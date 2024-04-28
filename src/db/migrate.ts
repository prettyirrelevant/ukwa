import { migrate } from 'drizzle-orm/postgres-js/migrator';

import { createConnection } from '.';

const db = createConnection(process.env.DATABASE_URL as string);

console.log('[db] Running migrations');
migrate(db, { migrationsFolder: 'src/db/migrations' })
  .then(() => {
    console.log('[db] Migrations completed!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('[db] Migrations failed!', err);
    process.exit(1);
  });
