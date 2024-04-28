import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dbCredentials: {
    connectionString: process.env.DATABASE_URL as string,
  },
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  verbose: true,
  driver: 'pg',
  strict: true,
});
