#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverScript = path.join(__dirname, '../server/index.js');

console.log('=======================================================');
console.log('  ⚡ Launching OpenMenti Local-First Assessment Engine ');
console.log('=======================================================');

const server = spawn('node', [serverScript], {
  stdio: 'inherit',
  env: process.env
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
});

server.on('exit', (code) => {
  process.exit(code || 0);
});
