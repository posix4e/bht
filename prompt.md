# Create a Cross-Platform Browser History Tracker Extension

## Core Requirements
Create a browser extension that tracks browsing history with the following features:
- Track device_id, webpage URL, and title for each history entry
- Use Holepunch (Hypercore, Hyperbee, Hyperswarm) for peer-to-peer synchronization across devices
- Allow users to configure public/private keys in the extension settings
- Implement configurable history expiration (default: 30 days)
- Support both Chrome and Safari iOS platforms

## Technical Implementation
1. **Chrome Extension Structure**
   - Create manifest.json (v3)
   - Implement background service worker for history tracking
   - Design popup UI to display recent history
   - Create options page for configuration

2. **Safari iOS Extension**
   - Implement Safari web extension compatibility
   - Create necessary iOS app wrapper

3. **Synchronization**
   - Implement Holepunch for P2P data synchronization
   - Store history in Hyperbee database
   - Use Hyperswarm for peer discovery

4. **User Interface**
   - Clean, modern UI for viewing history
   - Settings page for key management and expiration configuration
   - Display device ID and synchronization status

## CI/CD Pipeline
Create a GitHub Actions workflow that:
- Uses macOS runner for building artifacts
- Generates Chrome extension as a zip file
- Creates Safari iOS artifact using xcrun (self-signed for simulator use)
- Implements Playwright tests with xvfb for headless testing
- Takes screenshots during testing for verification
- Tests iOS functionality in simulator
- Uploads all artifacts (Chrome extension, Safari iOS app, test results, screenshots)

## Project Structure
- Organize code with modern JavaScript practices
- Use webpack for bundling
- Include comprehensive README
- Add proper .gitignore
- Create placeholder icons

## Testing
- Implement Playwright tests for Chrome extension
- Create tests that verify multiple extensions working simultaneously
- Add iOS simulator testing script