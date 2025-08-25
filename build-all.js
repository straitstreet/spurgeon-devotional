#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
};

const exec = (command, description) => {
  log(`\n${colors.blue}🔨 ${description}...${colors.reset}`);
  try {
    execSync(command, { stdio: 'inherit' });
    log(`${colors.green}✅ ${description} completed${colors.reset}`);
  } catch (error) {
    log(`${colors.red}❌ ${description} failed${colors.reset}`, colors.red);
    process.exit(1);
  }
};

const main = async () => {
  log(`${colors.bold}${colors.blue}🚀 Building Spurgeon Devotional App${colors.reset}`);
  
  // Check if we're in the right directory
  if (!fs.existsSync('package.json')) {
    log('❌ package.json not found. Please run from project root.', colors.red);
    process.exit(1);
  }

  const startTime = Date.now();

  // 1. Clean previous builds
  exec('rm -rf dist android/app/src/main/assets/public', 'Cleaning previous builds');

  // 2. Install dependencies (if needed)
  if (!fs.existsSync('node_modules')) {
    exec('bun install', 'Installing dependencies');
  }

  // 3. Build web app
  exec('bun run build', 'Building web application');

  // 4. Copy assets to Android
  if (fs.existsSync('android')) {
    exec('mkdir -p android/app/src/main/assets', 'Creating Android assets directory');
    exec('cp -r dist android/app/src/main/assets/public', 'Copying web build to Android assets');
    
    // 5. Build Android APK
    if (process.platform === 'darwin') {
      exec('cd android && ./gradlew assembleRelease', 'Building Android release APK');
      
      // Show APK location
      const apkPath = 'android/app/build/outputs/apk/release/app-release.apk';
      if (fs.existsSync(apkPath)) {
        const stats = fs.statSync(apkPath);
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        log(`\n${colors.green}📱 Android APK built successfully!${colors.reset}`);
        log(`📍 Location: ${apkPath}`);
        log(`📊 Size: ${fileSizeMB} MB`);
      }
    } else {
      log('⚠️  Android build skipped (not on macOS)', colors.yellow);
    }
  } else {
    log('⚠️  Android directory not found, skipping mobile build', colors.yellow);
  }

  // 6. Show web build info
  if (fs.existsSync('dist')) {
    const distStats = fs.readdirSync('dist').map(file => {
      const filePath = path.join('dist', file);
      const stats = fs.statSync(filePath);
      return { file, size: stats.size };
    });
    
    log(`\n${colors.green}🌐 Web build completed!${colors.reset}`);
    log(`📍 Location: ./dist/`);
    distStats.forEach(({ file, size }) => {
      const sizeMB = (size / 1024).toFixed(1);
      log(`  📄 ${file}: ${sizeMB} KB`);
    });
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);
  
  log(`\n${colors.bold}${colors.green}🎉 Build completed in ${duration}s!${colors.reset}`);
  
  // Show next steps
  log(`\n${colors.bold}Next steps:${colors.reset}`);
  log(`• Test web build: ${colors.blue}bun run preview${colors.reset}`);
  log(`• Test Android app: ${colors.blue}bun run preview:android:quick${colors.reset}`);
  log(`• Deploy to web: Upload ./dist/ to your hosting provider`);
  if (fs.existsSync('android/app/build/outputs/apk/release/app-release.apk')) {
    log(`• Install Android APK: adb install android/app/build/outputs/apk/release/app-release.apk`);
  }
};

main().catch(error => {
  log(`❌ Build failed: ${error.message}`, colors.red);
  process.exit(1);
});