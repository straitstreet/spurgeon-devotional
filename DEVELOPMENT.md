# Development Guide

## Available Commands

### Preview & Testing
```bash
bun run preview:all           # Multi-platform preview (web + Android)
bun run dev                   # Development server (live reload)
bun run preview               # Web preview only  
bun run preview:android       # Interactive Android preview
bun run preview:android:quick # Quick Android test
```

### Building
```bash
bun run build                # Web build only
bun run build:all            # Build for all platforms
```

### Deployment
```bash
bun run release              # Interactive release (both platforms)
bun run deploy:cf            # Cloudflare only
bun run deploy:playstore     # Play Store only
```

### Utilities
```bash
bun run setup:keystore       # Setup Android signing
bun run release-notes        # Generate release notes
bun run workflow             # Complete git workflow
```

## Development Workflow

1. **Make changes** to your code
2. **Preview locally**: `bun run preview:all`
3. **Test thoroughly** on web and Android
4. **Commit and deploy**: `bun run workflow`

## Quick Links

- [Android Preview Guide](ANDROID-PREVIEW.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Release Notes](CHANGELOG.md)

Updated: 2025-08-25 (v1.0.0)
