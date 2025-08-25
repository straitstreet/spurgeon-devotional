#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

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

const exec = (command, description, silent = false) => {
  if (!silent) log(`${colors.blue}🔨 ${description}...${colors.reset}`);
  
  try {
    const options = silent ? { stdio: 'pipe' } : { stdio: 'inherit' };
    const result = execSync(command, options);
    
    if (!silent) log(`${colors.green}✅ ${description} completed${colors.reset}`);
    return result;
  } catch (error) {
    if (!silent) log(`${colors.red}❌ ${description} failed${colors.reset}`);
    throw error;
  }
};

const main = () => {
  log(`${colors.bold}${colors.blue}🚀 Quick Android Preview${colors.reset}`);
  
  try {
    // Check if we have devices/emulators
    const devices = exec('adb devices', 'Checking connected devices', true).toString();
    const deviceLines = devices.split('\n').slice(1).filter(line => line.includes('device'));
    
    if (deviceLines.length === 0) {
      log('❌ No Android devices connected', colors.red);
      log('Please:', colors.yellow);
      log('• Connect a device via USB and enable Developer Options + USB Debugging');
      log('• Or start an Android emulator');
      log('• Or run the full preview: bun run preview:android');
      process.exit(1);
    }
    
    const deviceId = deviceLines[0].split('\t')[0];
    log(`📱 Using device: ${deviceId}`, colors.green);
    
    // Quick build and install
    exec('bun run build', 'Building web app');
    exec('mkdir -p android/app/src/main/assets', 'Preparing Android assets');
    exec('cp -r dist android/app/src/main/assets/public', 'Copying assets');
    exec('cd android && ./gradlew assembleDebug', 'Building debug APK');
    
    const apkPath = 'android/app/build/outputs/apk/debug/app-debug.apk';
    if (!fs.existsSync(apkPath)) {
      throw new Error('APK not found');
    }
    
    const stats = fs.statSync(apkPath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    exec(`adb -s ${deviceId} install -r "${apkPath}"`, `Installing APK (${sizeMB} MB)`);
    
    // Launch the app
    log(`${colors.blue}🚀 Launching app...${colors.reset}`);
    exec(`adb -s ${deviceId} shell monkey -p com.straitstreet.spurgeon -c android.intent.category.LAUNCHER 1`, 'Starting app', true);
    
    log(`\n${colors.bold}${colors.green}🎉 App launched successfully!${colors.reset}`);
    log(`📱 Spurgeon Devotional is now running on your device`);
    log(`\n${colors.bold}Useful commands:${colors.reset}`);
    log(`• View logs: adb logcat | grep spurgeon`);
    log(`• Uninstall: adb uninstall com.straitstreet.spurgeon`);
    log(`• Reinstall: bun run preview:android:quick`);
    
  } catch (error) {
    log(`\n❌ Quick preview failed: ${error.message}`, colors.red);
    log(`\n💡 Try the full preview instead: bun run preview:android`, colors.yellow);
    process.exit(1);
  }
};

main();