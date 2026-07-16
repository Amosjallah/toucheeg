@echo off
curl -s -w "\nHTTP_STATUS:%%{http_code}\n" ^
  -X POST "https://wexmezslqdbvwaavkwar.supabase.co/auth/v1/token?grant_type=password" ^
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndleG1lenNscWRidndhYXZrd2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNDg0NzcsImV4cCI6MjA5OTcyNDQ3N30.6tPZOO1IlXWKayNrHp4IP81HOZa8WwpW1ppZgF75YGU" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@toucheeglow.com\",\"password\":\"Toucheeglow123\"}"
