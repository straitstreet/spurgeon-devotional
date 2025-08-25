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
  bold: '\x1b[1m'
};

const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
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

const main = async () => {
  log(`${colors.bold}${colors.blue}🔐 Android Release Keystore Setup${colors.reset}`);
  
  const keystorePath = 'android/app/release.keystore';
  const gradlePropsPath = 'android/gradle.properties';
  
  if (fs.existsSync(keystorePath)) {
    log(`⚠️  Keystore already exists at: ${keystorePath}`, colors.yellow);
    const overwrite = await question('Overwrite existing keystore? (y/n): ');
    if (overwrite.toLowerCase() !== 'y') {
      log('Aborted.', colors.yellow);
      return;
    }
  }
  
  log('\n📝 Please provide the following information for your release keystore:\n');
  
  const alias = await question('Key alias (e.g., "release"): ') || 'release';
  const storePassword = await question('Keystore password: ');
  const keyPassword = await question('Key password (press enter to use same as keystore): ') || storePassword;
  const firstName = await question('First and last name: ');
  const orgUnit = await question('Organizational unit (e.g., "IT Department"): ');
  const org = await question('Organization (e.g., "My Company"): ');
  const city = await question('City or locality: ');
  const state = await question('State or province: ');
  const country = await question('Two-letter country code (e.g., "US"): ');
  
  const dname = `CN=${firstName}, OU=${orgUnit}, O=${org}, L=${city}, ST=${state}, C=${country}`;
  
  log(`\n${colors.blue}🔨 Creating keystore...${colors.reset}`);
  
  try {
    // Create keystore
    execSync(`keytool -genkey -v -keystore ${keystorePath} -alias ${alias} -keyalg RSA -keysize 2048 -validity 10000 -storepass "${storePassword}" -keypass "${keyPassword}" -dname "${dname}"`, {
      stdio: 'inherit'
    });
    
    log(`${colors.green}✅ Keystore created successfully!${colors.reset}`);
    
    // Update gradle.properties
    const gradleProps = `
# Android Release Signing
SPURGEON_RELEASE_STORE_FILE=release.keystore
SPURGEON_RELEASE_KEY_ALIAS=${alias}
SPURGEON_RELEASE_STORE_PASSWORD=${storePassword}
SPURGEON_RELEASE_KEY_PASSWORD=${keyPassword}
`;
    
    if (fs.existsSync(gradlePropsPath)) {
      let existingProps = fs.readFileSync(gradlePropsPath, 'utf8');
      // Remove existing SPURGEON signing properties
      existingProps = existingProps.replace(/\n*# Android Release Signing[\s\S]*?(?=\n[A-Z]|\n*$)/g, '');
      fs.writeFileSync(gradlePropsPath, existingProps + gradleProps);
    } else {
      fs.writeFileSync(gradlePropsPath, gradleProps.trim());
    }
    
    log(`${colors.green}✅ Updated gradle.properties${colors.reset}`);
    
    // Update build.gradle
    const buildGradlePath = 'android/app/build.gradle';
    if (fs.existsSync(buildGradlePath)) {
      let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');
      
      if (!buildGradle.includes('signingConfigs')) {
        const signingConfig = `
    signingConfigs {
        release {
            if (project.hasProperty('SPURGEON_RELEASE_STORE_FILE')) {
                storeFile file(SPURGEON_RELEASE_STORE_FILE)
                storePassword SPURGEON_RELEASE_STORE_PASSWORD
                keyAlias SPURGEON_RELEASE_KEY_ALIAS
                keyPassword SPURGEON_RELEASE_KEY_PASSWORD
            }
        }
    }
`;
        
        const buildTypesConfig = `
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
`;
        
        // Add signing config
        buildGradle = buildGradle.replace('android {', 'android {\n' + signingConfig);
        
        // Update release build type
        if (buildGradle.includes('buildTypes {')) {
          buildGradle = buildGradle.replace(/release\s*{[^}]*}/, buildTypesConfig.trim());
        }
        
        fs.writeFileSync(buildGradlePath, buildGradle);
        log(`${colors.green}✅ Updated build.gradle with signing configuration${colors.reset}`);
      }
    }
    
    log(`\n${colors.bold}🎉 Android keystore setup complete!${colors.reset}`);
    log(`\n${colors.yellow}⚠️  IMPORTANT SECURITY NOTES:${colors.reset}`);
    log(`1. Keep your keystore file (${keystorePath}) safe and secure`);
    log(`2. Never commit gradle.properties to version control (add to .gitignore)`);
    log(`3. Back up your keystore - you cannot recover it if lost`);
    log(`4. You'll need this same keystore for all future app updates`);
    
    // Add to .gitignore if exists
    if (fs.existsSync('.gitignore')) {
      let gitignore = fs.readFileSync('.gitignore', 'utf8');
      if (!gitignore.includes('android/gradle.properties')) {
        fs.appendFileSync('.gitignore', '\n# Android Release\nandroid/gradle.properties\nandroid/app/release.keystore\n');
        log(`${colors.green}✅ Added keystore files to .gitignore${colors.reset}`);
      }
    }
    
  } catch (error) {
    log(`${colors.red}❌ Failed to create keystore: ${error.message}${colors.reset}`);
    process.exit(1);
  }
};

main().catch(error => {
  log(`❌ Setup failed: ${error.message}`, colors.red);
  process.exit(1);
});