# Lume Desktop

Native Windows, macOS, and Linux desktop application for Lume - the AI-powered med spa client retention platform.

## Prerequisites

- [Node.js 18+](https://nodejs.org/)
- npm or yarn

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Copy web app files (from parent lume folder)
cp -r ../lume ./app

# Run in development mode
npm run dev
```

### Building

```bash
# Build for Windows
npm run build:win

# Build for macOS
npm run build:mac

# Build for Linux
npm run build:linux

# Build for all platforms
npm run build:all
```

## Build Output

Installers are created in the `dist/` folder:

| Platform | Output |
|----------|--------|
| Windows | `Lume-1.0.0-Setup.exe` (installer) |
| Windows | `Lume-1.0.0-portable.exe` (portable) |
| macOS | `Lume-1.0.0.dmg` |
| Linux | `Lume-1.0.0.AppImage` |
| Linux | `lume_1.0.0_amd64.deb` |

## Features

- 🖥️ Native window with system tray
- ⌨️ Keyboard shortcuts (Ctrl+1-4 for navigation)
- 🔔 Native push notifications
- 🔄 Auto-updates
- 💾 Persistent settings
- 📴 Offline support

## Folder Structure

```
lume-desktop/
├── main.js          # Electron main process
├── preload.js       # Bridge to renderer
├── package.json     # Build configuration
├── app/             # Web app files (copy from ../lume)
└── build/           # Icons and assets for installer
    ├── icon.ico     # Windows icon
    ├── icon.icns    # macOS icon
    └── icon.png     # Linux icon
```

## Required Icons

Before building, add icons to the `build/` folder:

- `icon.ico` - 256x256 Windows icon
- `icon.icns` - macOS icon bundle
- `icon.png` - 512x512 PNG for Linux
- `tray-icon.png` - 16x16 or 32x32 for system tray

## Signing (Production)

For distribution, you'll need to code sign:

**Windows:** Use a Windows EV Code Signing Certificate
**macOS:** Sign with Apple Developer ID

See [electron-builder Code Signing docs](https://www.electron.build/code-signing)
