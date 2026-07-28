import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envText = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf-8');
const env = {};

envText.split(/\r?\n/).forEach(l => {
  const line = l.trim();
  if (line.startsWith('#') || !line.includes('=')) return;
  const idx = line.indexOf('=');
  const key = line.slice(0, idx).trim();
  let val = line.slice(idx + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  env[key] = val;
});

console.log('Parsed Supabase URL:', env.NEXT_PUBLIC_SUPABASE_URL);

const req = https.request(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/categories?select=id,slug`, {
  headers: {
    'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Response Status:', res.statusCode, 'Data:', data));
});

req.on('error', (err) => console.error('HTTPS Error:', err));
req.end();
