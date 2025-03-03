import { readFileSync } from 'fs';
import { spawn } from 'child_process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables from .env.local
const envContent = readFileSync('.env.local', 'utf8');
const envVars = envContent
  .split('\n')
  .filter(line => line.trim() !== '' && !line.startsWith('#'))
  .reduce((acc, line) => {
    const [key, valueWithQuotes] = line.split('=');
    // Remove quotes if present
    const value = valueWithQuotes ? valueWithQuotes.replace(/^["']|["']$/g, '') : '';
    acc[key] = value;
    return acc;
  }, {});

// Combine current process env with loaded env vars
const env = { ...process.env, ...envVars };

// Run the compiled JavaScript file with environment variables
const child = spawn('node', ['./dist/run-example.js'], { 
  env, 
  stdio: 'inherit',
  shell: true 
});

child.on('exit', (code) => {
  process.exit(code);
}); 