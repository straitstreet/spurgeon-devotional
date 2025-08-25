# Spurgeon Devotional

A beautiful, ultra-lightweight cross-platform devotional app featuring Charles Spurgeon's timeless "Morning & Evening" daily readings.

![Spurgeon Devotional](https://img.shields.io/badge/devotional-spurgeon-8B4513?style=flat-square) ![PWA](https://img.shields.io/badge/PWA-enabled-4CAF50?style=flat-square) ![Bundle Size](https://img.shields.io/badge/bundle-ultra%20light-FF6B35?style=flat-square)

## Quick Start

```bash
# Preview locally
bun run preview:all          # Multi-platform preview (web + Android)
bun run dev                  # Development server with live reload

# Test on devices  
bun run preview:android:quick  # Quick Android test

# Complete workflow
bun run workflow             # Commit → Push → Deploy

# Deploy everywhere
bun run release              # Interactive deployment
```

## Features

- **Ultra-Lightweight**: Optimized for minimal bundle size and blazing fast loading
- **Beautiful Design**: Clean, readable typography inspired by the NeuBible aesthetic  
- **Cross-Platform**: Progressive Web App (PWA) that works on web and mobile
- **Daily Readings**: Morning and evening devotionals for every day of the year
- **Offline Ready**: Works without internet connection once installed
- **Responsive**: Perfect reading experience on any device size

## Tech Stack

Built with modern, lightweight technologies for optimal performance:

- **Preact** - Ultra-fast React alternative (3KB gzipped)
- **Vite** - Lightning-fast build tool with minimal config
- **TypeScript** - Type-safe development experience
- **PWA** - Progressive Web App capabilities with service worker
- **Google Fonts** - Beautiful typography with Newsreader and IBM Plex Sans
- **Lucide Icons** - Lightweight, consistent iconography

## Typography

The app uses carefully selected Google Fonts optimized for reading:

- **Newsreader** - Elegant serif font for devotional content
- **IBM Plex Sans** - Clean, modern sans-serif for UI elements

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) - Fast JavaScript runtime and package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/straitstreet/spurgeon-devotional.git
cd spurgeon-devotional

# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## Project Structure

```
src/
├── components/          # React components
│   ├── About.tsx       # About page with attribution
│   ├── DevotionalView.tsx  # Main devotional reading interface
│   └── Header.tsx      # Navigation header
├── types/              # TypeScript type definitions
│   └── devotional.ts   # Devotional data types
├── app.tsx             # Main app component
├── index.css           # Global styles and design system
└── main.tsx            # App entry point

data/
└── sample-devotional.json  # Sample devotional data

public/
├── cross.svg           # App icon
└── ...                 # PWA assets
```

## About Charles Spurgeon

Charles Haddon Spurgeon (1834-1892) was a British Reformed Baptist preacher known as the "Prince of Preachers." His "Morning and Evening" devotional has provided spiritual guidance to millions for over a century. All content is in the public domain.

## Contributing

We welcome contributions! Please feel free to submit issues and pull requests.

## License

This project is licensed under the MIT License. Spurgeon's original works are in the public domain.

## Acknowledgments

- Content sourced from [Christian Classics Ethereal Library](https://ccel.org)
- Developed with care by [StraitStreet](https://straitstreet.co)
- Inspired by beautiful, essential reading apps

---

*"Let us go forth to serve our Lord with gladness, sorrowing most of all that we have no more strength, and no more love to give to Him who is so worthy of all honor and praise."* - Charles Spurgeon