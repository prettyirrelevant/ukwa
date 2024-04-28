import { HTTPException } from 'hono/http-exception';
import { addMiddleware } from '@trigger.dev/hono';
import { verifyMessage, isAddress } from 'viem';
import { poweredBy } from 'hono/powered-by';
import { logger } from 'hono/logger';
import { cache } from 'hono/cache';
import { cors } from 'hono/cors';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';

import { getOrCreateAccount, createConnection, type Database, schema, newId } from './db';
import { createTriggerClient } from './trigger';
import { Paystack } from './services';

const app = new Hono<{
  Bindings: {
    DEPLOYER_PRIVATE_KEY: `0x${string}`;
    PAYSTACK_SECRET_KEY: string;
    TRIGGER_API_KEY: string;
    TRIGGER_API_URL: string;
    DATABASE_URL: string;
  };
  Variables: {
    services: { paymentProcessor: Paystack; db: Database };
    auth: { address?: `0x${string}`; id?: string };
  };
}>();

app.use(poweredBy());
app.use(logger());
app.use(cors());

app.use(async (c, next) => {
  const db = createConnection(c.env.DATABASE_URL);
  const paystack = new Paystack(c.env.PAYSTACK_SECRET_KEY);

  c.set('services', { paymentProcessor: paystack, db });
  await next();
});

addMiddleware(app, (env) =>
  createTriggerClient({
    paystackSecretKey: env.PAYSTACK_SECRET_KEY,
    privateKey: env.DEPLOYER_PRIVATE_KEY,
    databaseUrl: env.DATABASE_URL,
    apiKey: env.TRIGGER_API_KEY,
    apiUrl: env.TRIGGER_API_URL,
  }),
);

app.use('/api/*', async (c, next) => {
  if (c.req.path === '/api/trigger' || c.req.path === '/api/banks') {
    await next();
    return;
  }

  const headerSignature = c.req.header('X-Signature');
  if (!headerSignature) {
    throw new HTTPException(401, { message: 'Authentication header missing!' });
  }

  const [address, signature] = headerSignature.split(':');
  if (!isAddress(address)) {
    throw new HTTPException(401, { message: 'Invalid address provided in signature. Make sure it is checksum' });
  }

  const isValid = await verifyMessage({
    message: 'Message: Welcome to Wrapped Naira!\nURI: https://wrapped-naira.vercel.app',
    signature: signature as `0x${string}`,
    address,
  });
  if (!isValid) {
    throw new HTTPException(401, { message: 'Invalid signature provided' });
  }

  const { db } = c.get('services');
  const accountId = newId('account');
  const account = await getOrCreateAccount(db, accountId, address);

  c.set('auth', { id: account ? account.id : accountId, address });
  await next();
});

app.get(
  '*',
  cache({
    cacheControl: 'max-age=3600',
    cacheName: 'wrapped-naira',
  }),
);

app.get('/', (c) => {
  return c.json({ data: { msg: 'pong!' } });
});

app.get('/api/banks', async (c) => {
  const { paymentProcessor } = c.get('services');
  const banks = await paymentProcessor.getBanks();
  return c.json({ data: banks });
});

app.get('/api/banks/verify', async (c) => {
  const { paymentProcessor } = c.get('services');
  const { accountNumber, bankCode } = c.req.query();

  const response = await paymentProcessor.verifyAccountNumber(bankCode, accountNumber);
  return c.json({ data: response });
});

app.post('/api/accounts/link', async (c) => {
  const { address } = c.get('auth');
  const { paymentProcessor, db } = c.get('services');
  const { accountNumber, bankCode } = await c.req.json();
  const { account_number, account_name } = await paymentProcessor.verifyAccountNumber(bankCode, accountNumber);
  const { recipient_code } = await paymentProcessor.createTransferRecipient(account_name, account_number, bankCode);

  await db
    .update(schema.accounts)
    .set({
      paymentDetails: {
        paystack: {
          trfRecipientCode: recipient_code,
          accountNumber: account_number,
          accountName: account_name,
          bankCode: bankCode,
        },
      },
      isPaymentDetailsLinked: true,
    })
    .where(eq(schema.accounts.address, address as `0x${string}`));

  return c.json({ data: { msg: 'Payment details linked successfully' } });
});

app.get('/api/transactions', async (c) => {
  const { db } = c.get('services');
  const { id } = c.get('auth');

  const txs = await db
    .select()
    .from(schema.transactions)
    .where(eq(schema.transactions.accountId, id as string));

  return c.json({ data: txs });
});

app.onError((err, c) => {
  console.error(err.stack);
  const status = err instanceof HTTPException ? err.status : 500;

  return c.json({ error: { message: err.message, name: err.name } }, status);
});

app.notFound((c) => {
  return c.json({ error: { message: `${c.req.path} not found.`, name: 'NOT_FOUND' } }, 404);
});

export default app;
