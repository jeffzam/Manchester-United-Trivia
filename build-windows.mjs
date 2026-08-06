#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function buildWindowsExecutable() {
  try {
    console.log('🔨 Building Next.js application...');
    await execAsync('pnpm build');

    console.log('📦 Creating Windows standalone executable...');
    await execAsync('pnpm run pkg');

    console.log('✅ Windows standalone executable created: manchester-united-trivia.exe');
    console.log('📂 Output location: ./manchester-united-trivia.exe');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

buildWindowsExecutable();
