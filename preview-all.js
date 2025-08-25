#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import readline from 'readline';

const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m'
};

const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
};

const exec = (command, description) => {
  log(`${colors.blue}🔨 ${description}...${colors.reset}`);
  try {
    execSync(command, { stdio: 'inherit' });
    log(`${colors.green}✅ ${description} completed${colors.reset}`);
    return true;
  } catch (error) {
    log(`${colors.red}❌ ${description} failed${colors.reset}`);
    return false;
  }
};

const execSilent = (command) => {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch (error) {
    return '';
  }
};

const question = (prompt) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
};

const startWebPreview = () => {
  log(`${colors.cyan}🌐 Starting web preview server...${colors.reset}`);
  
  if (!exec('bun run build', 'Building web application')) {
    return null;
  }
  
  // Start preview server in background
  const previewProcess = spawn('bun', ['run', 'vite', 'preview'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true
  });
  
  // Wait for server to start and get URL
  return new Promise((resolve) => {
    let serverStarted = false;
    let url = 'http://localhost:4173';
    
    previewProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:') && !serverStarted) {
        const match = output.match(/Local:\s+(https?:\/\/[^\s]+)/);
        if (match) {
          url = match[1];
        }
        serverStarted = true;
        log(`${colors.green}✅ Web preview server started${colors.reset}`);
        log(`🌐 URL: ${colors.cyan}${url}${colors.reset}`);
        resolve({ process: previewProcess, url });
      }
    });
    
    // Fallback timeout
    setTimeout(() => {
      if (!serverStarted) {
        log(`${colors.green}✅ Web preview server started${colors.reset}`);
        log(`🌐 URL: ${colors.cyan}${url}${colors.reset}`);
        resolve({ process: previewProcess, url });
      }
    }, 3000);
  });
};

const openBrowser = (url) => {
  try {
    const platform = process.platform;
    if (platform === 'darwin') {
      execSync(`open "${url}"`, { stdio: 'ignore' });
    } else if (platform === 'win32') {
      execSync(`start "${url}"`, { stdio: 'ignore' });
    } else {
      execSync(`xdg-open "${url}"`, { stdio: 'ignore' });
    }
    log(`🌐 Opened ${url} in browser`, colors.green);
    return true;
  } catch (error) {
    log(`⚠️  Could not open browser automatically`, colors.yellow);
    return false;
  }
};

const checkAndroidSetup = () => {
  const adbPath = execSilent('which adb') || execSilent('where adb');
  if (!adbPath) return false;
  
  const devices = execSilent('adb devices');
  const deviceLines = devices.split('\n').slice(1).filter(line => line.includes('device') && !line.includes('offline'));
  
  return deviceLines.length > 0;
};

const previewAndroid = async () => {
  log(`${colors.cyan}📱 Starting Android preview...${colors.reset}`);
  
  try {
    execSync('node quick-preview-android.js', { stdio: 'inherit' });
    return true;
  } catch (error) {
    log(`${colors.red}❌ Android preview failed${colors.reset}`);
    return false;
  }
};

const main = async () => {
  log(`${colors.bold}${colors.blue}🚀 Spurgeon Devotional - Multi-Platform Preview${colors.reset}`);
  
  // Check what's available
  const hasAndroid = checkAndroidSetup();
  
  log(`\n${colors.bold}Available preview options:${colors.reset}`);
  log(`1. 🌐 Web preview (local server)`);
  log(`2. 📱 Android preview${hasAndroid ? ' (device connected ✅)' : ' (no device connected ⚠️)'}`);
  log(`3. 🌍 Both platforms`);
  log(`4. 🔧 Development server (live reload)`);
  
  const choice = await question('\nChoose preview option (1-4): ');
  
  let webServer = null;
  
  try {
    switch (choice) {
      case '1':
        webServer = await startWebPreview();
        if (webServer) {
          const shouldOpen = await question('Open in browser? (y/n): ');
          if (shouldOpen.toLowerCase() === 'y') {
            openBrowser(webServer.url);
          }
          
          log(`\n${colors.cyan}Press Ctrl+C to stop the server${colors.reset}`);
          process.on('SIGINT', () => {
            log('\n🛑 Stopping web server...');
            webServer.process.kill();
            process.exit(0);
          });
          
          // Keep process alive
          await new Promise(() => {});
        }
        break;
        
      case '2':
        if (!hasAndroid) {
          log(`${colors.yellow}⚠️  No Android device detected${colors.reset}`);
          log('Please connect a device or start an emulator');
          const proceed = await question('Try anyway? (y/n): ');
          if (proceed.toLowerCase() !== 'y') {
            return;
          }
        }
        await previewAndroid();
        break;
        
      case '3':
        // Start web server first
        webServer = await startWebPreview();
        if (webServer) {
          openBrowser(webServer.url);
          
          // Then preview Android
          log(`\n${colors.blue}🔄 Starting Android preview...${colors.reset}`);
          await previewAndroid();
          
          log(`\n${colors.bold}${colors.green}🎉 Both platforms running!${colors.reset}`);
          log(`🌐 Web: ${webServer.url}`);
          log(`📱 Android: Check your connected device`);
          log(`\n${colors.cyan}Press Ctrl+C to stop the web server${colors.reset}`);
          
          process.on('SIGINT', () => {
            log('\n🛑 Stopping web server...');
            webServer.process.kill();
            process.exit(0);
          });
          
          // Keep process alive
          await new Promise(() => {});
        }
        break;
        
      case '4':
        log(`${colors.cyan}🔧 Starting development server with live reload...${colors.reset}`);
        execSync('bun run dev', { stdio: 'inherit' });
        break;
        
      default:
        log('Invalid option selected', colors.red);
        break;
    }
  } catch (error) {
    if (webServer) {
      webServer.process.kill();
    }
    log(`\n❌ Preview failed: ${error.message}`, colors.red);
    process.exit(1);
  }
};

main().catch(error => {
  log(`❌ Preview failed: ${error.message}`, colors.red);
  process.exit(1);
});