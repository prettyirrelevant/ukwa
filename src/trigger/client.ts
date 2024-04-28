import {
  createPublicClient,
  createWalletClient,
  decodeEventLog,
  zeroAddress,
  formatUnits,
  parseUnits,
  http,
} from 'viem';
import { intervalTrigger, TriggerClient } from '@trigger.dev/sdk';
import { privateKeyToAccount } from 'viem/accounts';
import { optimismSepolia } from 'viem/chains';
import { getContract } from 'viem';
import { eq } from 'drizzle-orm';
import crypto from 'node:crypto';

import { getOrCreateAccount, createConnection, schema, newId } from '../db';
import { WngnInitBlock, WngnAddress, WngnAbi } from '../constants';
import { DepositWebhookPayload, Paystack } from '../services';

export const createTriggerClient = (opts: {
  privateKey: `0x${string}`;
  paystackSecretKey: string;
  databaseUrl: string;
  apiKey: string;
  apiUrl: string;
}) => {
  const client = new TriggerClient({
    id: 'wrapped-naira',
    apiUrl: opts.apiUrl,
    apiKey: opts.apiKey,
  });

  const db = createConnection(opts.databaseUrl);
  const publicClient = createPublicClient({
    chain: optimismSepolia,
    transport: http(),
  });
  const deployer = privateKeyToAccount(opts.privateKey);
  const walletClient = createWalletClient({
    chain: optimismSepolia,
    transport: http(),
    account: deployer,
  });
  const wngnContract = getContract({
    client: { public: publicClient, wallet: walletClient },
    address: WngnAddress,
    abi: WngnAbi,
  });
  const paystack = new Paystack(opts.paystackSecretKey);

  const paystackcom = client.defineHttpEndpoint({
    verify: async (request) => {
      try {
        const body = await request.json();
        const signatureFromHeader = request.headers.get('x-paystack-signature');
        const computedHash = crypto
          .createHmac('sha512', opts.paystackSecretKey)
          .update(JSON.stringify(body))
          .digest('hex');

        return { success: signatureFromHeader == computedHash };
      } catch (error) {
        const reason = error instanceof Error ? error.message : undefined;
        return { success: false, reason };
      }
    },
    source: 'api.paystack.co',
    icon: 'paystack',
    id: 'paystack',
  });

  // todo(@prettyirrelevant): find a way to group jobs into modules without losing type inference.
  client.defineJob({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async (_payload, io, _ctx) => {
      const lastQueriedBlock = await io.runTask('get last queried block', async () => {
        const block = await db.query.cache.findFirst({ where: eq(schema.cache.key, 'last_queried_block') });
        return block?.value ? block.value : WngnInitBlock.toString();
      });

      const latestBlock = await io.runTask('get latest block', async () =>
        (await publicClient.getBlockNumber()).toString(),
      );

      const logs = await io.runTask(`get event logs from ${lastQueriedBlock} to ${latestBlock}`, async () => {
        const transferEvents = await wngnContract.getEvents.Transfer(
          { to: zeroAddress },
          { fromBlock: BigInt(lastQueriedBlock), toBlock: BigInt(latestBlock), strict: true },
        );

        return transferEvents.map((event) => {
          const decodedEvent = decodeEventLog({ abi: wngnContract.abi, topics: event.topics, data: event.data });
          return decodedEvent.eventName === 'Transfer'
            ? {
                ...decodedEvent,
                args: {
                  ...decodedEvent.args,
                  value: decodedEvent.args.value.toString(),
                },
                transactionHash: event.transactionHash,
              }
            : null;
        });
      });
      io.logger.debug('fetched logs successfully', logs);

      for (const log of logs) {
        await io.runTask(`initiate wngn withdrawal for event: ${log?.transactionHash}`, async () => {
          const accountId = newId('account');
          const account = await io.runTask(
            'get account from db',
            async () => await getOrCreateAccount(db, accountId, log?.args.from as `0x${string}`),
          );

          const txId = newId('transaction');
          const txMetadata = { onchain: { ...log }, paystack: {} };
          const formattedAmount = formatUnits(BigInt(log?.args.value as string), 6);

          await io.runTask(
            'create transaction entry',
            async () =>
              await db.insert(schema.transactions).values({
                amount: formattedAmount.toString(),
                accountId: account.id,
                metadata: txMetadata,
                txType: 'withdrawal',
                status: 'pending',
                id: txId,
              }),
          );

          if (!account.isPaymentDetailsLinked) return;

          const response = await io.runTask(
            'initiate transfer',
            async () =>
              await paystack.transfer(
                (BigInt(formattedAmount) * BigInt(100)).toString(),
                account.paymentDetails?.paystack.trfRecipientCode as string,
                txId,
              ),
          );

          await io.runTask(
            'update transaction metadata',
            async () =>
              await db
                .update(schema.transactions)
                .set({ metadata: { ...txMetadata, paystack: response } })
                .where(eq(schema.transactions.id, txId)),
          );
        });
      }

      await io.runTask(
        'update last queried block',
        async () =>
          await db
            .insert(schema.cache)
            .values({ key: 'last_queried_block', id: newId('cache'), value: latestBlock })
            .onConflictDoUpdate({ set: { value: latestBlock }, target: schema.cache.key }),
      );
    },
    trigger: intervalTrigger({ seconds: 300 }),
    name: 'WNGN Token Withdrawal',
    id: 'wngn-token-withdrawal',
    version: '0.0.1',
  });

  client.defineJob({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run: async (request, io, _ctx) => {
      const body = await request.json<DepositWebhookPayload>();
      await io.logger.info('got webhook body:', body);

      if (body.event === 'charge.success') {
        const address = atob(
          body.data.metadata.custom_fields.find((el) => el.variable_name === 'address')?.value as string,
        );
        const accountId = newId('account');
        const account = await io.runTask(
          'get account from db',
          async () => await getOrCreateAccount(db, accountId, address as `0x${string}`),
        );

        const txId = newId('transaction');
        const txMetadata = { paystack: { ...body.data }, onchain: {} };
        const actualAmount = BigInt(body.data.amount / 100).toString();
        await io.runTask(
          'create deposit transaction entry',
          async () =>
            await db.insert(schema.transactions).values({
              accountId: account.id,
              amount: actualAmount,
              metadata: txMetadata,
              txType: 'deposit',
              status: 'pending',
              id: txId,
            }),
        );

        const txHash = await io.runTask('mint wngn to provided address', async () => {
          await wngnContract.simulate.mint([address as `0x${string}`, parseUnits(actualAmount, 6)], {
            account: deployer,
          });
          const txHash = await wngnContract.write.mint([address as `0x${string}`, parseUnits(actualAmount, 6)], {
            account: deployer,
          });
          return txHash;
        });

        await io.runTask(
          'update transaction metadata',
          async () =>
            await db
              .update(schema.transactions)
              .set({ metadata: { ...txMetadata, onchain: { txHash } }, status: 'success' })
              .where(eq(schema.transactions.id, txId)),
        );
      }

      return;
    },
    trigger: paystackcom.onRequest(),
    name: 'HTTP paystack.com',
    id: 'http-paystack',
    version: '0.0.1',
    enabled: true,
  });

  return client;
};
