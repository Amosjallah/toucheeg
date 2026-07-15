/**
 * Migrate all SQL files to Supabase.
 * Tries multiple connection strategies automatically.
 *
 * Run:
 *   node scripts/migrate-to-supabase.mjs
 *
 * Requires in .env (or as env vars):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_DB_PASSWORD
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

// ── Load .env / .env.local ────────────────────────────────────────────────
function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    const p = path.join(root, file);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, 'utf-8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      // Strip surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}
loadEnv();

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const DB_PASSWORD   = process.env.SUPABASE_DB_PASSWORD      || '';
const PROJECT_REF   = SUPABASE_URL.match(/([a-z0-9]{20,})\.supabase\.co/)?.[1] || '';

if (!PROJECT_REF) { console.error('Missing NEXT_PUBLIC_SUPABASE_URL'); process.exit(1); }
if (!DB_PASSWORD) { console.error('Missing SUPABASE_DB_PASSWORD'); process.exit(1); }

// ── Migration files (applied in order) ───────────────────────────────────
const migrationFiles = [
  'supabase/migrations/20260209000000_complete_schema.sql',
  'supabase/migrations/20260218000000_allow_null_order_items_product_fks.sql',
  'supabase/migrations/20260219000000_contact_submissions.sql',
];

function readMigration(rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) throw new Error(`Migration not found: ${p}`);
  return fs.readFileSync(p, 'utf-8');
}

// ── Connection candidates (tried in order) ────────────────────────────────
function buildConnectionStrings() {
  const pw  = encodeURIComponent(DB_PASSWORD);
  const ref = PROJECT_REF;
  return [
    // Supavisor session-mode pooler (port 5432) — best for scripts
    { label: 'Supavisor US pooler (5432)', url: `postgresql://postgres.${ref}:${pw}@aws-0-us-east-1.pooler.supabase.com:5432/postgres` },
    // Supavisor transaction-mode (port 6543)
    { label: 'Supavisor US pooler (6543)', url: `postgresql://postgres.${ref}:${pw}@aws-0-us-east-1.pooler.supabase.com:6543/postgres` },
    // EU region pooler
    { label: 'Supavisor EU pooler (5432)', url: `postgresql://postgres.${ref}:${pw}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres` },
    // AP region pooler
    { label: 'Supavisor AP pooler (5432)', url: `postgresql://postgres.${ref}:${pw}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres` },
    // Direct (IPv6 — works if machine has IPv6 connectivity)
    { label: 'Direct DB (5432)',           url: `postgresql://postgres:${pw}@db.${ref}.supabase.co:5432/postgres` },
  ];
}

async function tryConnect(label, connUrl) {
  process.stdout.write(`  Trying ${label} … `);
  const client = new pg.Client({
    connectionString: connUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });
  try {
    await client.connect();
    console.log('connected ✓');
    return client;
  } catch (err) {
    console.log(`failed: ${err.message.split('\n')[0]}`);
    return null;
  }
}

// ── Run a single SQL block ─────────────────────────────────────────────────
async function runSql(client, label, sql) {
  process.stdout.write(`  Executing ${label} … `);
  try {
    await client.query(sql);
    console.log('done ✓');
    return true;
  } catch (err) {
    // Idempotent: already-exists errors are safe to skip when re-running
    if (
      err.message.includes('already exists') ||
      err.code === '42P07' ||  // duplicate_table
      err.code === '42710'     // duplicate_object (type/trigger/etc.)
    ) {
      console.log(`skipped (some objects already exist — OK)`);
      return true;
    }
    console.error(`\n  ERROR in ${label}: ${err.message}`);
    return false;
  }
}

// ── Main ─────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('   TOUCHEEGLOW — Supabase Schema Migration');
  console.log('═══════════════════════════════════════════════════\n');
  console.log(`Project : ${PROJECT_REF}`);
  console.log(`Files   : ${migrationFiles.length} migration(s)\n`);

  // 1. Find a working connection
  console.log('── Connecting ──────────────────────────────────────');
  let client = null;
  for (const { label, url } of buildConnectionStrings()) {
    client = await tryConnect(label, url);
    if (client) break;
  }

  if (!client) {
    console.error('\n✗ All connection attempts failed.');
    console.error('  Check: SUPABASE_DB_PASSWORD in .env is correct.');
    console.error(`\n  Alternatively run SQL manually:\n  https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`);
    process.exit(1);
  }

  // 2. Apply each migration
  console.log('\n── Applying migrations ─────────────────────────────');
  let allOk = true;
  for (const file of migrationFiles) {
    const sql = readMigration(file);
    const ok  = await runSql(client, path.basename(file), sql);
    if (!ok) { allOk = false; break; }
  }

  await client.end();

  if (allOk) {
    console.log('\n✅  Migration complete!');
    console.log(`\n   View your tables:\n   https://supabase.com/dashboard/project/${PROJECT_REF}/editor`);
  } else {
    console.error('\n✗ Migration stopped due to an error. See above.');
    process.exit(1);
  }
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
