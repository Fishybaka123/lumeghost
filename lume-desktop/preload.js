// ===========================================
// LUME DESKTOP - PRELOAD SCRIPT
// ===========================================

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // App info
    getVersion: () => ipcRenderer.invoke('get-version'),

    // Navigation from menu
    onNavigate: (callback) => {
        ipcRenderer.on('navigate', (event, path) => callback(path));
    },

    // Menu actions
    onMenuAction: (callback) => {
        ipcRenderer.on('menu-action', (event, action) => callback(action));
    },

    // Notifications
    showNotification: (title, body) => {
        ipcRenderer.invoke('show-notification', { title, body });
    },

    // Settings
    getSetting: (key) => ipcRenderer.invoke('get-setting', key),
    setSetting: (key, value) => ipcRenderer.invoke('set-setting', key, value),

    // Auto-update
    onUpdateAvailable: (callback) => {
        ipcRenderer.on('update-available', () => callback());
    },
    onUpdateDownloaded: (callback) => {
        ipcRenderer.on('update-downloaded', () => callback());
    },

    // Platform detection
    platform: process.platform,
    isElectron: true
});

// Log that preload is ready
console.log('✅ Lume Desktop preload ready');
