import { timestamp, pgTable, varchar, boolean, decimal, pgEnum, json, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

interface AccountPaymentDetails {
  paystack: {
    trfRecipientCode?: string;
    accountNumber?: string;
    accountName?: string;
    bankCode?: string;
  };
}

interface TransactionMetadata {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  paystack: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onchain: Record<string, any>;
}

export const transactionTypeEnum = pgEnum('tx_type', ['deposit', 'withdrawal']);
export const transactionStatusEnum = pgEnum('tx_status', ['success', 'failed', 'pending']);

export const accounts = pgTable('accounts', {
  paymentDetails: json('payment_details')
    .$type<AccountPaymentDetails>()
    .default({ paystack: { trfRecipientCode: '', accountNumber: '', accountName: '', bankCode: '' } }),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  isPaymentDetailsLinked: boolean('is_payment_details_linked').default(false),
  address: varchar('address').$type<`0x${string}`>().notNull().unique(),
  id: varchar('id').primaryKey(),
});

export const accountsRelations = relations(accounts, ({ many }) => ({
  posts: many(transactions),
}));

export const transactions = pgTable('transactions', {
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  accountId: varchar('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  metadata: json('metadata').$type<TransactionMetadata>().default({ paystack: {}, onchain: {} }),
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  status: transactionStatusEnum('tx_status').notNull(),
  txType: transactionTypeEnum('tx_type').notNull(),
  amount: decimal('amount').notNull(),
  id: varchar('id').primaryKey(),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  account: one(accounts, { fields: [transactions.accountId], references: [accounts.id] }),
}));

export const cache = pgTable('cache', {
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 3 })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  createdAt: timestamp('created_at', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  key: varchar('key').$type<'last_queried_block'>().notNull().unique(),
  value: text('value').notNull(),
  id: text('id').primaryKey(),
});
