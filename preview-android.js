#!/usr/bin/env node

import { execSync } from 'child_process';
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
  log(`\n${colors.blue}🔨 ${description}...${colors.reset}`);
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

const checkAndroidSDK = () => {
  log(`${colors.cyan}🔍 Checking Android SDK setup...${colors.reset}`);
  
  const androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (!androidHome) {
    log('❌ ANDROID_HOME environment variable not set', colors.red);
    log('Please install Android Studio and set ANDROID_HOME', colors.red);
    return false;
  }
  
  // Check if adb is available
  const adbPath = execSilent('which adb') || execSilent('where adb');
  if (!adbPath) {
    log('❌ ADB not found in PATH', colors.red);
    log('Please add Android SDK platform-tools to PATH', colors.red);
    return false;
  }
  
  log(`✅ Android SDK found: ${androidHome}`, colors.green);
  log(`✅ ADB found: ${adbPath}`, colors.green);
  return true;
};

const getConnectedDevices = () => {
  const devices = execSilent('adb devices');
  if (!devices) return [];
  
  const lines = devices.split('\n').slice(1); // Skip header
  const connectedDevices = lines
    .filter(line => line.includes('device') && !line.includes('offline'))
    .map(line => {
      const [id, status] = line.split('\t');
      return { id: id.trim(), status: status.trim() };
    });
    
  return connectedDevices;
};

const getAvailableEmulators = () => {
  const emulators = execSilent('emulator -list-avds');
  if (!emulators) return [];
  
  return emulators.split('\n').filter(line => line.trim().length > 0);
};

const startEmulator = async (emulatorName) => {
  log(`🚀 Starting emulator: ${emulatorName}`, colors.cyan);
  
  // Start emulator in background
  const emulatorCmd = `emulator -avd "${emulatorName}" -no-audio -no-snapshot &`;
  execSync(emulatorCmd, { stdio: 'inherit' });
  
  // Wait for emulator to boot
  log('⏳ Waiting for emulator to boot...', colors.yellow);
  let bootComplete = false;
  let attempts = 0;
  const maxAttempts = 30; // 5 minutes max
  
  while (!bootComplete && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
    
    const bootStatus = execSilent('adb shell getprop sys.boot_completed');
    if (bootStatus === '1') {
      bootComplete = true;
      log('✅ Emulator is ready!', colors.green);
    } else {
      attempts++;
      log(`⏳ Still booting... (${attempts}/${maxAttempts})`, colors.yellow);
    }
  }
  
  if (!bootComplete) {
    log('❌ Emulator failed to boot within timeout', colors.red);
    return false;
  }
  
  return true;
};

const buildAndInstallAPK = async (deviceId, buildType = 'debug') => {
  log(`\n${colors.bold}${colors.blue}📱 BUILDING AND INSTALLING APP${colors.reset}`);
  
  // Build web app first
  if (!exec('bun run build', 'Building web application')) {
    return false;
  }
  
  // Copy to Android assets
  if (!exec('mkdir -p android/app/src/main/assets', 'Creating Android assets directory')) {
    return false;
  }
  
  if (!exec('cp -r dist android/app/src/main/assets/public', 'Copying web assets to Android')) {
    return false;
  }
  
  // Build APK
  const buildCommand = buildType === 'release' 
    ? 'cd android && ./gradlew assembleRelease'
    : 'cd android && ./gradlew assembleDebug';
    
  if (!exec(buildCommand, `Building Android ${buildType} APK`)) {
    return false;
  }
  
  // Install APK
  const apkPath = `android/app/build/outputs/apk/${buildType}/app-${buildType}.apk`;
  if (!fs.existsSync(apkPath)) {
    log(`❌ APK not found: ${apkPath}`, colors.red);
    return false;
  }
  
  const installCmd = deviceId 
    ? `adb -s ${deviceId} install -r "${apkPath}"`
    : `adb install -r "${apkPath}"`;
    
  if (!exec(installCmd, 'Installing APK on device')) {
    return false;
  }
  
  const stats = fs.statSync(apkPath);
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  log(`📦 APK installed successfully! (${fileSizeMB} MB)`, colors.green);
  
  return true;
};

const launchApp = (deviceId, packageName = 'com.straitstreet.spurgeon') => {
  log(`🚀 Launching app: ${packageName}`, colors.cyan);
  
  const launchCmd = deviceId 
    ? `adb -s ${deviceId} shell monkey -p ${packageName} -c android.intent.category.LAUNCHER 1`
    : `adb shell monkey -p ${packageName} -c android.intent.category.LAUNCHER 1`;
    
  if (exec(launchCmd, 'Launching app')) {
    log(`🎉 App launched successfully!`, colors.green);
    return true;
  }
  
  return false;
};

const showLogs = (deviceId, packageName = 'com.straitstreet.spurgeon') => {
  log(`📋 Showing app logs (press Ctrl+C to stop)...`, colors.cyan);
  
  const logCmd = deviceId 
    ? `adb -s ${deviceId} logcat | grep "${packageName}"`
    : `adb logcat | grep "${packageName}"`;
    
  try {
    execSync(logCmd, { stdio: 'inherit' });
  } catch (error) {
    // User pressed Ctrl+C, that's expected
  }
};

const main = async () => {
  log(`${colors.bold}${colors.blue}📱 Android Preview & Testing${colors.reset}`);
  
  // Check prerequisites
  if (!checkAndroidSDK()) {
    process.exit(1);
  }
  
  // Check Android project
  if (!fs.existsSync('android')) {
    log('❌ Android project not found. Run: bunx cap add android', colors.red);
    process.exit(1);
  }
  
  // Get connected devices
  const devices = getConnectedDevices();
  log(`\n📱 Connected devices: ${devices.length}`);
  devices.forEach((device, i) => {
    log(`${i + 1}. ${device.id} (${device.status})`);
  });
  
  // Get available emulators
  const emulators = getAvailableEmulators();
  log(`\n🖥️  Available emulators: ${emulators.length}`);
  emulators.forEach((emulator, i) => {
    log(`${devices.length + i + 1}. ${emulator} (emulator)`);
  });
  
  let selectedDevice = null;
  
  if (devices.length === 0 && emulators.length === 0) {
    log('\n❌ No devices or emulators available', colors.red);
    log('Setup options:', colors.yellow);
    log('1. Connect a physical device via USB');
    log('2. Create an emulator in Android Studio');
    log('3. Use Android Studio AVD Manager');
    process.exit(1);
  }
  
  // Device/emulator selection
  if (devices.length === 1 && emulators.length === 0) {
    selectedDevice = devices[0].id;
    log(`\n✅ Using device: ${selectedDevice}`, colors.green);
  } else {
    log(`\n${colors.bold}Select target device:${colors.reset}`);
    const choice = await question('Enter number (or press Enter for first device): ');
    
    const choiceNum = parseInt(choice) || 1;
    
    if (choiceNum <= devices.length) {
      selectedDevice = devices[choiceNum - 1].id;
      log(`✅ Selected device: ${selectedDevice}`, colors.green);
    } else if (choiceNum <= devices.length + emulators.length) {
      const emulatorIndex = choiceNum - devices.length - 1;
      const emulatorName = emulators[emulatorIndex];
      
      if (await startEmulator(emulatorName)) {
        // After emulator starts, get its device ID
        const newDevices = getConnectedDevices();
        const emulatorDevice = newDevices.find(d => d.id.includes('emulator'));
        selectedDevice = emulatorDevice ? emulatorDevice.id : null;
      }
    }
  }
  
  if (!selectedDevice) {
    log('❌ No valid device selected', colors.red);
    process.exit(1);
  }
  
  // Build type selection
  log(`\n${colors.bold}Select build type:${colors.reset}`);
  log('1. Debug build (faster, includes debugging)');
  log('2. Release build (optimized, like production)');
  
  const buildChoice = await question('Choose (1-2, default: 1): ');
  const buildType = buildChoice === '2' ? 'release' : 'debug';
  
  // Build and install
  if (await buildAndInstallAPK(selectedDevice, buildType)) {
    // Launch options
    log(`\n${colors.bold}What would you like to do?${colors.reset}`);
    log('1. Launch app');
    log('2. Launch app and show logs');
    log('3. Just show logs');
    log('4. Exit');
    
    const actionChoice = await question('Choose action (1-4): ');
    
    switch (actionChoice) {
      case '1':
        launchApp(selectedDevice);
        break;
      case '2':
        if (launchApp(selectedDevice)) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for app to start
          showLogs(selectedDevice);
        }
        break;
      case '3':
        showLogs(selectedDevice);
        break;
      default:
        log('👍 APK installed and ready!', colors.green);
        break;
    }
    
    // Final instructions
    log(`\n${colors.bold}📝 Next steps:${colors.reset}`);
    log(`• App is installed on device: ${selectedDevice}`);
    log(`• Package name: com.straitstreet.spurgeon`);
    log(`• To uninstall: adb uninstall com.straitstreet.spurgeon`);
    log(`• To view logs: adb logcat | grep spurgeon`);
    log(`• To reinstall: bun run preview:android`);
    
  } else {
    log('❌ Build or installation failed', colors.red);
    process.exit(1);
  }
};

main().catch(error => {
  log(`❌ Preview failed: ${error.message}`, colors.red);
  process.exit(1);
});