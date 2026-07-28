import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envText = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf-8');
const env = {};
for (const line of envText.split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) {
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    env[m[1]] = v;
  }
}

console.log('Testing connection to:', env.NEXT_PUBLIC_SUPABASE_URL);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  try {
    const { data, error } = await supabase.from('categories').select('*');
    console.log('Categories:', data, 'Error:', error);
  } catch (err) {
    console.error('Catch error:', err);
  }
}
test();
