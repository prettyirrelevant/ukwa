DO $$ BEGIN
 CREATE TYPE "tx_status" AS ENUM('success', 'failed', 'pending');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "tx_type" AS ENUM('deposit', 'withdrawal');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "accounts" (
	"payment_details" json DEFAULT '{"paystack":{"trfRecipientCode":"","accountNumber":"","accountName":"","bankCode":""}}'::json,
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"is_payment_details_linked" boolean DEFAULT false,
	"address" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	CONSTRAINT "accounts_address_unique" UNIQUE("address")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cache" (
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"key" varchar NOT NULL,
	"value" text NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	CONSTRAINT "cache_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"updated_at" timestamp (3) DEFAULT now() NOT NULL,
	"account_id" varchar NOT NULL,
	"metadata" json DEFAULT '{"paystack":{},"onchain":{}}'::json,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"tx_status" "tx_status" NOT NULL,
	"tx_type" "tx_type" NOT NULL,
	"amount" numeric NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
