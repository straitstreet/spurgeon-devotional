# 🚀 Deployment Guide

Complete guide for deploying Spurgeon Devotional to Cloudflare and Google Play Store.

## Quick Start

```bash
# Deploy to both platforms (interactive)
bun run release

# Deploy to Cloudflare only
bun run deploy:cf

# Build everything locally
bun run build:all
```

## 📋 Prerequisites

### For Cloudflare Deployment
- [Cloudflare account](https://dash.cloudflare.com/sign-up)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (installed automatically)
- Domain configured in Cloudflare (optional)

### For Play Store Deployment
- [Google Play Console account](https://play.google.com/console) ($25 one-time fee)
- [Android Studio](https://developer.android.com/studio) or Java JDK
- Release keystore (we'll help you create one)

## 🔐 First-Time Android Setup

1. **Create Release Keystore**
   ```bash
   bun run setup:keystore
   ```
   This interactive script will:
   - Generate a secure release keystore
   - Update Android build configuration
   - Add security files to `.gitignore`

2. **Test Build**
   ```bash
   bun run build:all
   ```

## ☁️ Cloudflare Deployment

### Automatic Deployment
```bash
bun run deploy:cf
```

### Manual Steps
1. Login to Cloudflare
   ```bash
   bunx wrangler auth login
   ```

2. Build and deploy
   ```bash
   bun run build
   node build-worker.js
   bunx wrangler deploy --env production
   ```

### Custom Domain Setup
1. Add your domain to Cloudflare
2. Update `wrangler.toml`:
   ```toml
   [env.production]
   name = "spurgeon-devotional"
   routes = [
     "your-domain.com/*"
   ]
   ```

## 📱 Play Store Deployment

### Interactive Deployment
```bash
bun run release
```
Choose option 2 or 3 for Play Store deployment.

### Manual Steps

1. **Build App Bundle**
   ```bash
   bun run build:all  # Builds AAB automatically
   ```

2. **Upload to Play Console**
   - Go to [Google Play Console](https://play.google.com/console)
   - Select your app → Release → Production
   - Create new release
   - Upload `android/app/build/outputs/bundle/release/app-release.aab`
   - Add release notes
   - Submit for review

## 📊 Version Management

The deploy script can automatically bump versions:

- **Patch** (1.0.0 → 1.0.1): Bug fixes
- **Minor** (1.0.0 → 1.1.0): New features
- **Major** (1.0.0 → 2.0.0): Breaking changes

Version numbers sync across:
- `package.json`
- Android `versionName` and `versionCode`

## 🛠 Advanced Configuration

### Environment Variables

Create `.env` file:
```env
# Cloudflare
CLOUDFLARE_API_TOKEN=your_token_here

# Android signing (handled by setup:keystore script)
SPURGEON_RELEASE_STORE_PASSWORD=your_keystore_password
SPURGEON_RELEASE_KEY_PASSWORD=your_key_password
```

### Build Optimization

The build process includes:
- **Tree shaking**: Removes unused code
- **Minification**: Compresses JavaScript/CSS
- **Asset optimization**: Compresses images
- **PWA generation**: Creates service worker
- **Bundle analysis**: Shows what's in your build

View bundle analysis:
```bash
bun run analyze
```

## 📂 File Structure

```
spurgeon-devotional/
├── dist/                     # Web build output
├── android/
│   └── app/build/outputs/
│       ├── apk/release/      # APK files
│       └── bundle/release/   # AAB files (for Play Store)
├── build-all.js             # Build everything
├── deploy-all.js            # Deploy everything
├── setup-android-keystore.js # Setup release signing
└── wrangler.toml            # Cloudflare config
```

## 🚨 Security Best Practices

### Keystore Security
- **Never** commit keystore files to version control
- **Always** backup your keystore securely
- **Use** strong passwords (12+ characters)
- **Store** passwords in environment variables or secure vault

### Environment Variables
Add to `.gitignore`:
```
# Security
.env
android/gradle.properties
android/app/release.keystore
android/app/*.jks
```

### API Keys
- Use Cloudflare API tokens (not global API keys)
- Set minimum required permissions
- Rotate keys regularly

## 📱 App Store Guidelines

### Google Play Store
- **Target API**: Android 14 (API level 34)
- **Min SDK**: Android 7.0 (API level 24)
- **Bundle size**: Under 150MB (we're ~4MB ✅)
- **64-bit support**: Required (included ✅)
- **App Bundle**: Preferred format (we use AAB ✅)

### Content Policy
- Family-friendly content ✅
- No misleading information ✅
- Proper app description ✅
- Privacy policy (if collecting data)

## 🐛 Troubleshooting

### Build Failures
```bash
# Clean build
rm -rf dist android/app/build node_modules
bun install
bun run build:all
```

### Cloudflare Issues
```bash
# Check auth status
bunx wrangler whoami

# View logs
bunx wrangler tail --env production
```

### Android Issues
```bash
# Clean Android build
cd android && ./gradlew clean
cd .. && bun run build:all
```

### Keystore Problems
- **Lost keystore**: Cannot recover, must create new app
- **Wrong password**: Re-run `bun run setup:keystore`
- **Permission errors**: Check file permissions

## 📈 Monitoring & Analytics

### Cloudflare Analytics
- View traffic in Cloudflare dashboard
- Monitor performance metrics
- Set up alerts for errors

### Play Console Analytics
- User acquisition metrics
- Crash reports
- Performance insights
- User reviews

## 🎉 Success Checklist

### Before First Deployment
- [ ] Keystore created and secured
- [ ] Cloudflare account configured
- [ ] Play Console developer account
- [ ] App tested on multiple devices
- [ ] Privacy policy created (if needed)

### For Each Release
- [ ] Version number updated
- [ ] Release notes written
- [ ] Build tested locally
- [ ] Web deployment successful
- [ ] Android bundle uploaded
- [ ] Both platforms live

## 📞 Support

- **Build issues**: Check build logs
- **Cloudflare**: [Cloudflare Docs](https://developers.cloudflare.com/workers/)
- **Play Store**: [Android Developer Docs](https://developer.android.com/distribute)
- **General**: Create issue in repository