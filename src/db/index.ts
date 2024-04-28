import { type PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import { customAlphabet } from 'nanoid';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';

import * as schema from './schema';

export type Database = PostgresJsDatabase<typeof schema>;

export const createConnection = (url: string) => {
  return drizzle(postgres(url), { schema });
};

const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz');
const prefixes = {
  transaction: 'transactions',
  account: 'accounts',
  cache: 'cache',
} as const;

export const newId = (prefix: keyof typeof prefixes): string => {
  return [prefixes[prefix], nanoid(16)].join('_');
};

export const getOrCreateAccount = async (db: Database, id: string, address: `0x${string}`) => {
  const result = await db.query.accounts.findFirst({
    where: eq(schema.accounts.address, address),
  });

  if (!result) {
    const resultt = (await db.insert(schema.accounts).values({ address: address, id }).returning())[0];
    return {
      ...resultt,
      paymentDetails: JSON.parse(JSON.stringify(resultt.paymentDetails)),
      updatedAt: resultt.updatedAt,
      createdAt: resultt.createdAt,
    };
  }

  return {
    ...result,
    paymentDetails: JSON.parse(JSON.stringify(result.paymentDetails)),
    updatedAt: result.updatedAt,
    createdAt: result.createdAt,
  };
};

export { schema };
