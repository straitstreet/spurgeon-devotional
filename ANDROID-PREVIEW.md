# 📱 Android Preview Guide

Complete guide for testing the Spurgeon Devotional Android app locally on devices and emulators.

## 🚀 Quick Start

```bash
# Quick preview (if device already connected)
bun run preview:android:quick

# Full interactive preview
bun run preview:android
```

## 📋 Prerequisites

### 1. Android Studio Setup
- [Download Android Studio](https://developer.android.com/studio)
- Install with Android SDK
- Add `platform-tools` to your PATH

### 2. Environment Variables
Add to your shell profile (`.bashrc`, `.zshrc`, etc.):
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/emulator
```

### 3. Device Setup (Physical Device)
**Enable Developer Options:**
1. Go to Settings → About Phone
2. Tap "Build Number" 7 times
3. Go back to Settings → Developer Options
4. Enable "USB Debugging"
5. Connect device via USB and allow debugging

### 4. Emulator Setup (Virtual Device)
**Create AVD in Android Studio:**
1. Open Android Studio → AVD Manager
2. Create Virtual Device
3. Choose device (e.g., Pixel 7)
4. Select system image (API 34+ recommended)
5. Finish setup

## 📱 Preview Commands

### Quick Preview
```bash
bun run preview:android:quick
```
**Features:**
- Auto-detects first connected device
- Builds debug APK automatically  
- Installs and launches app
- Perfect for rapid testing

### Interactive Preview  
```bash
bun run preview:android
```
**Features:**
- Lists all devices and emulators
- Choose target device
- Select debug or release build
- Launch with logs
- Advanced options

## 🛠️ Manual Testing

### Build APK Only
```bash
bun run build:all
```
APK location: `android/app/build/outputs/apk/release/app-release.apk`

### Install Manually
```bash
# Install on specific device
adb -s DEVICE_ID install -r path/to/app.apk

# Install on first device
adb install -r path/to/app.apk
```

### Launch App
```bash
# Launch app
adb shell monkey -p com.straitstreet.spurgeon -c android.intent.category.LAUNCHER 1
```

## 📊 Development Tools

### View Device Logs
```bash
# All logs
adb logcat

# App-specific logs
adb logcat | grep spurgeon

# Real-time filtered logs
adb logcat -s SpurgeonApp
```

### Device Information
```bash
# List connected devices
adb devices

# Device details
adb shell getprop ro.product.model
adb shell getprop ro.build.version.release
```

### App Management
```bash
# Uninstall app
adb uninstall com.straitstreet.spurgeon

# Clear app data
adb shell pm clear com.straitstreet.spurgeon

# Kill app process
adb shell am force-stop com.straitstreet.spurgeon
```

## 🐛 Debugging Tips

### Common Issues

**1. No devices found**
```bash
# Check USB debugging is enabled
adb devices

# Restart ADB daemon
adb kill-server && adb start-server
```

**2. App won't install**
```bash
# Uninstall existing version first
adb uninstall com.straitstreet.spurgeon

# Install with replace flag
adb install -r app.apk
```

**3. Emulator won't start**
```bash
# List available emulators
emulator -list-avds

# Start specific emulator
emulator -avd "Your_AVD_Name"
```

**4. Build fails**
```bash
# Clean build
cd android && ./gradlew clean
bun run build:all
```

### Performance Testing
```bash
# Monitor memory usage
adb shell dumpsys meminfo com.straitstreet.spurgeon

# Monitor CPU usage  
adb shell top -p $(adb shell pidof com.straitstreet.spurgeon)

# Network monitoring
adb shell netstat | grep spurgeon
```

## 📋 Testing Checklist

### Functionality Testing
- [ ] App launches successfully
- [ ] All dates display correctly
- [ ] Morning/evening toggle works
- [ ] Date picker functionality
- [ ] Content loads properly
- [ ] Offline functionality works
- [ ] App survives rotation
- [ ] Navigation works smoothly

### Performance Testing  
- [ ] App starts quickly (< 3 seconds)
- [ ] Smooth scrolling
- [ ] No memory leaks
- [ ] Battery usage reasonable
- [ ] Works on low-end devices

### UI Testing
- [ ] Layouts work on different screen sizes
- [ ] Fonts load without flickering
- [ ] Colors and styling correct
- [ ] Touch targets are adequate
- [ ] Accessibility features work

## 🔄 Continuous Testing Workflow

### Development Cycle
1. **Make changes** to web app code
2. **Quick test**: `bun run preview:android:quick`
3. **Verify changes** on device
4. **Iterate** until satisfied
5. **Full test**: `bun run preview:android` (release build)
6. **Deploy**: `bun run release`

### Automated Testing
Create this script for CI/CD:
```bash
#!/bin/bash
# test-android.sh
set -e

echo "🏗️ Building app..."
bun run build:all

echo "📱 Installing on test device..."
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

echo "🚀 Launching app..."
adb shell monkey -p com.straitstreet.spurgeon -c android.intent.category.LAUNCHER 1

echo "✅ Android test complete!"
```

## 🎯 Device Testing Matrix

### Recommended Test Devices
- **High-end**: Pixel 7+ (Android 14+)
- **Mid-range**: Samsung Galaxy A-series (Android 12+)
- **Low-end**: Budget device (Android 10+)
- **Tablet**: Any 10"+ tablet
- **Emulator**: Pixel 6 API 34

### Screen Sizes
- **Phone**: 5-7" (most common)
- **Large Phone**: 6.5"+ (phablet)
- **Tablet**: 7-12" (different layouts)
- **Foldable**: Special handling needed

## 📈 Performance Benchmarks

### Target Metrics
- **App startup**: < 3 seconds (cold start)
- **Content loading**: < 1 second
- **Memory usage**: < 100MB
- **APK size**: < 10MB (currently ~4.4MB ✅)
- **Battery drain**: < 5% per hour of reading

### Measuring Performance
```bash
# Startup time
adb shell am start -W com.straitstreet.spurgeon/.MainActivity

# Memory usage
adb shell dumpsys meminfo com.straitstreet.spurgeon | head -n 20

# APK size
ls -lh android/app/build/outputs/apk/release/
```

## 🎉 Success Indicators

Your Android preview is working when:
- ✅ App installs without errors
- ✅ Launches in under 3 seconds
- ✅ All devotional content displays
- ✅ Date navigation works smoothly
- ✅ Morning/evening toggle responds
- ✅ Fonts load without flickering
- ✅ Works offline (airplane mode test)
- ✅ Survives app backgrounding/foregrounding

## 🆘 Getting Help

### Android Studio
- **Device Manager**: Tools → Device Manager
- **Logcat**: View → Tool Windows → Logcat
- **Emulator Console**: Extended controls in emulator

### Command Line
```bash
# Comprehensive device info
adb shell getprop | grep -E "(model|version|manufacturer)"

# Package information  
adb shell dumpsys package com.straitstreet.spurgeon

# System information
adb shell cat /proc/meminfo
adb shell cat /proc/cpuinfo
```

Happy testing! 🙏📱