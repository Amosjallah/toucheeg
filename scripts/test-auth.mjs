import { createClient } from '@supabase/supabase-js';

const url = 'https://wexmezslqdbvwaavkwar.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndleG1lenNscWRidndhYXZrd2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNDg0NzcsImV4cCI6MjA5OTcyNDQ3N30.6tPZOO1IlXWKayNrHp4IP81HOZa8WwpW1ppZgF75YGU';

const supabase = createClient(url, anonKey);

console.log('Testing signInWithPassword...');
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@toucheeglow.com',
  password: 'Toucheeglow123'
});

if (error) {
  console.log('AUTH ERROR:', error.message, '| status:', error.status);
} else {
  console.log('SUCCESS! Has session:', !!data.session);
  console.log('User email:', data.user?.email);
  console.log('User id:', data.user?.id);
}
