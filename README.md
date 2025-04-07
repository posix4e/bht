# Browser History Tracker

A browser extension that tracks your browsing history across devices using Holepunch for synchronization.

## Features

- Track browser history across multiple devices
- Synchronize history using Holepunch (Hypercore, Hyperbee, Hyperswarm)
- Configure public/private keys for synchronization
- Set custom expiration for history entries (default: 30 days)
- Available for Chrome and Safari iOS

## Development

### Prerequisites

- Node.js 16+
- npm
- For Safari iOS: macOS with Xcode

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/browser-history-tracker.git
cd browser-history-tracker

# Install dependencies
npm install
```

### Building

```bash
# Build for Chrome
npm run build

# Build Chrome extension zip
npm run build:chrome

# Build for Safari iOS
npm run build:safari-ios
```

### Testing

```bash
# Run all tests
npm test

# Run Chrome tests only
npm run test:chrome

# Run Safari iOS tests
npm run test:safari-ios
```

## CI/CD

This project uses GitHub Actions for continuous integration and deployment:

- Builds Chrome extension artifact
- Builds Safari iOS extension artifact
- Runs Playwright tests with xvfb
- Tests Safari iOS extension in simulator
- Uploads all artifacts to GitHub Actions

## Architecture

The extension uses the following technologies:

- **Holepunch**: For peer-to-peer synchronization across devices
  - Hypercore: Append-only log for storing data
  - Hyperbee: Key-value database built on Hypercore
  - Hyperswarm: DHT for peer discovery and connection

## License

MIT