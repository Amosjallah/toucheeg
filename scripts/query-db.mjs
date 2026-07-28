import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(envPath, 'utf-8')
      .split('\n')
      .filter((l) => /^[A-Z_]+=/.test(l.trim()))
      .map((l) => {
        const eq = l.indexOf('=');
        const key = l.slice(0, eq).trim();
        let val = l.slice(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        return [key, val];
      })
  );
}

const env = { ...process.env, ...loadEnv() };
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing env vars.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  const { data: categories, error: catError } = await supabase.from('categories').select('*');
  if (catError) {
    console.error('Error fetching categories:', catError);
  } else {
    console.log('Categories:', categories);
  }

  const { data: products, error: prodError } = await supabase.from('products').select('id, name, slug, price').limit(5);
  if (prodError) {
    console.error('Error fetching products:', prodError);
  } else {
    console.log('Sample Products:', products);
  }
}

main();
