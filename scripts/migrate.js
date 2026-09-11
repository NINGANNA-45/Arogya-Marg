const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres.zpvyxtvhqkumdivbfkcs:supabaseomkar@aws-0-eu-central-1.pooler.supabase.com:6543/postgres";

async function runMigration() {
  console.log('Connecting to PostgreSQL database...');
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected successfully!');

    const sqlPath = path.join(__dirname, '..', 'supabase_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing supabase_schema.sql...');
    await client.query(sql);
    console.log('Migration completed successfully! All tables and seed data created.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

runMigration();
