#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { generateAllReleaseNotes } from './generate-release-notes.js';

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
  log(`\n${colors.blue}🚀 ${description}...${colors.reset}`);
  try {
    execSync(command, { stdio: 'inherit' });
    log(`${colors.green}✅ ${description} completed${colors.reset}`);
    return true;
  } catch (error) {
    log(`${colors.red}❌ ${description} failed${colors.reset}`, colors.red);
    return false;
  }
};

const execSilent = (command) => {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch (error) {
    return null;
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
      resolve(answer.trim().toLowerCase());
    });
  });
};

const updateVersion = async () => {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const currentVersion = packageJson.version;
  
  log(`\n${colors.cyan}📋 Current version: ${currentVersion}${colors.reset}`);
  const versionType = await question('Bump version? (patch/minor/major/none): ');
  
  if (versionType !== 'none' && ['patch', 'minor', 'major'].includes(versionType)) {
    if (exec(`npm version ${versionType} --no-git-tag-version`, `Bumping ${versionType} version`)) {
      const newPackageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      log(`${colors.green}📈 Version updated: ${currentVersion} → ${newPackageJson.version}${colors.reset}`);
      return newPackageJson.version;
    }
  }
  
  return currentVersion;
};

const generateReleaseNotes = async (version) => {
  log(`\n${colors.bold}${colors.cyan}📝 GENERATING RELEASE NOTES${colors.reset}`);
  
  try {
    const releaseNotes = await generateAllReleaseNotes(version, true);
    return releaseNotes;
  } catch (error) {
    log(`⚠️  Failed to generate release notes: ${error.message}`, colors.yellow);
    return null;
  }
};

const deployCloudflare = async () => {
  log(`\n${colors.bold}${colors.blue}☁️  CLOUDFLARE DEPLOYMENT${colors.reset}`);
  
  // Check if wrangler is available
  const wranglerVersion = execSilent('bunx wrangler --version');
  if (!wranglerVersion) {
    log('❌ Wrangler CLI not found. Installing...', colors.red);
    if (!exec('bun add -d wrangler', 'Installing Wrangler CLI')) {
      return false;
    }
  }
  
  // Check if logged in
  const whoami = execSilent('bunx wrangler whoami');
  if (!whoami || whoami.includes('not authenticated')) {
    log('🔑 Please login to Cloudflare first:', colors.yellow);
    if (!exec('bunx wrangler auth login', 'Authenticating with Cloudflare')) {
      return false;
    }
  }
  
  // Build worker and deploy
  if (!exec('node build-worker.js', 'Building Cloudflare Worker')) {
    return false;
  }
  
  if (!exec('bunx wrangler deploy --env production', 'Deploying to Cloudflare')) {
    return false;
  }
  
  log(`${colors.green}🌐 Cloudflare deployment successful!${colors.reset}`);
  log(`🔗 Your app should be live at: https://spurgeon-devotional.your-domain.workers.dev`);
  return true;
};

const deployPlayStore = async (version, releaseNotes = null) => {
  log(`\n${colors.bold}${colors.blue}📱 GOOGLE PLAY STORE DEPLOYMENT${colors.reset}`);
  
  // Check Android setup
  if (!fs.existsSync('android')) {
    log('❌ Android project not found', colors.red);
    return false;
  }
  
  // Check if we have a keystore
  const keystorePath = 'android/app/release.keystore';
  if (!fs.existsSync(keystorePath)) {
    log(`⚠️  Release keystore not found at ${keystorePath}`, colors.yellow);
    log('You need to create a release keystore first:', colors.yellow);
    log('keytool -genkey -v -keystore android/app/release.keystore -alias release -keyalg RSA -keysize 2048 -validity 10000');
    return false;
  }
  
  // Update version in Android
  const buildGradlePath = 'android/app/build.gradle';
  if (fs.existsSync(buildGradlePath)) {
    let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');
    const versionParts = version.split('.');
    const versionCode = parseInt(versionParts[0]) * 10000 + parseInt(versionParts[1]) * 100 + parseInt(versionParts[2]);
    
    buildGradle = buildGradle.replace(/versionCode \d+/, `versionCode ${versionCode}`);
    buildGradle = buildGradle.replace(/versionName "[^"]*"/, `versionName "${version}"`);
    
    fs.writeFileSync(buildGradlePath, buildGradle);
    log(`📝 Updated Android version to ${version} (${versionCode})`, colors.green);
  }
  
  // Build AAB (Android App Bundle)
  if (!exec('cd android && ./gradlew bundleRelease', 'Building Android App Bundle (AAB)')) {
    return false;
  }
  
  const aabPath = 'android/app/build/outputs/bundle/release/app-release.aab';
  if (fs.existsSync(aabPath)) {
    const stats = fs.statSync(aabPath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    log(`${colors.green}📦 Android App Bundle created!${colors.reset}`);
    log(`📍 Location: ${aabPath}`);
    log(`📊 Size: ${fileSizeMB} MB`);
    
    // Check if we should upload to Play Console
    const upload = await question('Upload to Play Store Console? (y/n): ');
    if (upload === 'y' || upload === 'yes') {
      log('\n📋 Manual steps for Play Store upload:', colors.cyan);
      log('1. Go to https://play.google.com/console');
      log('2. Select your app');
      log('3. Go to Release > Production');
      log('4. Create new release');
      log(`5. Upload: ${aabPath}`);
      log('6. Add release notes (see release-notes-playstore.txt) and submit for review');
      
      if (releaseNotes && releaseNotes.playstore) {
        log(`\n📝 Generated release notes for Play Store:`, colors.cyan);
        log(colors.yellow + '─'.repeat(50) + colors.reset);
        console.log(releaseNotes.playstore);
        log(colors.yellow + '─'.repeat(50) + colors.reset);
      }
      
      // Open Play Console
      const open = await question('Open Play Console in browser? (y/n): ');
      if (open === 'y' || open === 'yes') {
        try {
          execSync('open https://play.google.com/console', { stdio: 'ignore' });
        } catch (error) {
          log('Could not open browser automatically', colors.yellow);
        }
      }
    }
    
    return true;
  }
  
  log('❌ Android App Bundle not found', colors.red);
  return false;
};

const main = async () => {
  log(`${colors.bold}${colors.blue}🚀 DEPLOYING SPURGEON DEVOTIONAL${colors.reset}`);
  
  // Check if we're in the right directory
  if (!fs.existsSync('package.json')) {
    log('❌ package.json not found. Please run from project root.', colors.red);
    process.exit(1);
  }

  const startTime = Date.now();
  
  // Ask what to deploy
  log(`\n${colors.bold}What would you like to deploy?${colors.reset}`);
  log('1. Cloudflare only');
  log('2. Play Store only');
  log('3. Both platforms');
  log('4. Build only (no deploy)');
  
  const choice = await question('Choose option (1-4): ');
  
  // Update version and generate release notes if deploying
  let version = null;
  let releaseNotes = null;
  
  if (['1', '2', '3'].includes(choice)) {
    version = await updateVersion();
    
    if (version) {
      releaseNotes = await generateReleaseNotes(version);
    }
  }
  
  let cfSuccess = false;
  let playSuccess = false;
  
  // First, always build everything
  if (!exec('bun run build:all', 'Building all platforms')) {
    process.exit(1);
  }
  
  if (choice === '4') {
    log(`${colors.green}✅ Build completed successfully!${colors.reset}`);
    return;
  }
  
  // Deploy based on choice
  if (choice === '1' || choice === '3') {
    cfSuccess = await deployCloudflare();
  }
  
  if (choice === '2' || choice === '3') {
    playSuccess = await deployPlayStore(version, releaseNotes);
  }
  
  // Summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);
  
  log(`\n${colors.bold}📊 DEPLOYMENT SUMMARY${colors.reset}`);
  log(`⏱️  Total time: ${duration}s`);
  
  if (choice === '1' || choice === '3') {
    log(`☁️  Cloudflare: ${cfSuccess ? '✅ Success' : '❌ Failed'}`);
  }
  
  if (choice === '2' || choice === '3') {
    log(`📱 Play Store: ${playSuccess ? '✅ Success' : '❌ Failed'}`);
  }
  
  if ((choice === '1' && cfSuccess) || 
      (choice === '2' && playSuccess) || 
      (choice === '3' && cfSuccess && playSuccess)) {
    log(`\n${colors.bold}${colors.green}🎉 Deployment completed successfully!${colors.reset}`);
  } else {
    log(`\n${colors.bold}${colors.yellow}⚠️  Some deployments failed. Check logs above.${colors.reset}`);
  }
};

main().catch(error => {
  log(`❌ Deployment failed: ${error.message}`, colors.red);
  process.exit(1);
});