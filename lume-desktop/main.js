// ===========================================
// LUME DESKTOP - ELECTRON MAIN PROCESS
// ===========================================

const { app, BrowserWindow, Menu, Tray, nativeImage, shell, ipcMain, Notification } = require('electron');
const path = require('path');
const Store = require('electron-store');

// Initialize store for persistent settings
const store = new Store({
    defaults: {
        windowBounds: { width: 1400, height: 900 },
        isMaximized: false,
        darkMode: false
    }
});

let mainWindow;
let tray;

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}

function createWindow() {
    const { width, height } = store.get('windowBounds');
    const isMaximized = store.get('isMaximized');

    mainWindow = new BrowserWindow({
        width,
        height,
        minWidth: 1024,
        minHeight: 700,
        icon: path.join(__dirname, 'build', 'icon.png'),
        titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
        backgroundColor: '#0A2540',
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            spellcheck: true
        }
    });

    // Load the web app
    if (process.argv.includes('--dev')) {
        // Development: load from local server
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    } else {
        // Production: load from bundled files
        mainWindow.loadFile(path.join(__dirname, 'app', 'index.html'));
    }

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        if (isMaximized) {
            mainWindow.maximize();
        }
    });

    // Save window bounds on resize
    mainWindow.on('resize', () => {
        if (!mainWindow.isMaximized()) {
            store.set('windowBounds', mainWindow.getBounds());
        }
    });

    mainWindow.on('maximize', () => {
        store.set('isMaximized', true);
    });

    mainWindow.on('unmaximize', () => {
        store.set('isMaximized', false);
    });

    // Handle external links
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // Create app menu
    createMenu();

    // Create system tray
    createTray();
}

function createMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Client',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => mainWindow.webContents.send('menu-action', 'new-client')
                },
                {
                    label: 'Send Nudge',
                    accelerator: 'CmdOrCtrl+U',
                    click: () => mainWindow.webContents.send('menu-action', 'send-nudge')
                },
                { type: 'separator' },
                {
                    label: 'Export Report',
                    accelerator: 'CmdOrCtrl+Shift+E',
                    click: () => mainWindow.webContents.send('menu-action', 'export-report')
                },
                { type: 'separator' },
                { role: 'quit' }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectAll' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { type: 'separator' },
                {
                    label: 'Dashboard',
                    accelerator: 'CmdOrCtrl+1',
                    click: () => mainWindow.webContents.send('navigate', '/dashboard')
                },
                {
                    label: 'Clients',
                    accelerator: 'CmdOrCtrl+2',
                    click: () => mainWindow.webContents.send('navigate', '/clients')
                },
                {
                    label: 'Analytics',
                    accelerator: 'CmdOrCtrl+3',
                    click: () => mainWindow.webContents.send('navigate', '/analytics')
                },
                {
                    label: 'Communications',
                    accelerator: 'CmdOrCtrl+4',
                    click: () => mainWindow.webContents.send('navigate', '/communications')
                },
                { type: 'separator' },
                { role: 'togglefullscreen' },
                { role: 'toggleDevTools' }
            ]
        },
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'zoom' },
                { type: 'separator' },
                { role: 'close' }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'Documentation',
                    click: () => shell.openExternal('https://docs.lume.com')
                },
                {
                    label: 'Report Issue',
                    click: () => shell.openExternal('https://github.com/lume/lume/issues')
                },
                { type: 'separator' },
                {
                    label: 'About Lume',
                    click: () => {
                        const { dialog } = require('electron');
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'About Lume',
                            message: 'Lume - Med Spa Client Retention',
                            detail: `Version: ${app.getVersion()}\nElectron: ${process.versions.electron}\nChrome: ${process.versions.chrome}\nNode.js: ${process.versions.node}`
                        });
                    }
                }
            ]
        }
    ];

    // macOS specific menu
    if (process.platform === 'darwin') {
        template.unshift({
            label: app.getName(),
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

function createTray() {
    // Create tray icon
    const iconPath = path.join(__dirname, 'build', 'tray-icon.png');
    const icon = nativeImage.createFromPath(iconPath);

    tray = new Tray(icon.resize({ width: 16, height: 16 }));

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open Lume',
            click: () => mainWindow.show()
        },
        { type: 'separator' },
        {
            label: 'Dashboard',
            click: () => {
                mainWindow.show();
                mainWindow.webContents.send('navigate', '/dashboard');
            }
        },
        {
            label: 'At-Risk Clients',
            click: () => {
                mainWindow.show();
                mainWindow.webContents.send('navigate', '/clients');
            }
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: () => app.quit()
        }
    ]);

    tray.setToolTip('Lume - Med Spa CRM');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    });
}

// IPC Handlers
ipcMain.handle('get-version', () => app.getVersion());

ipcMain.handle('show-notification', (event, { title, body }) => {
    if (Notification.isSupported()) {
        new Notification({ title, body }).show();
    }
});

ipcMain.handle('get-setting', (event, key) => store.get(key));

ipcMain.handle('set-setting', (event, key, value) => {
    store.set(key, value);
    return true;
});

// App lifecycle
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Handle auto-updates (optional)
if (!process.argv.includes('--dev')) {
    const { autoUpdater } = require('electron-updater');

    autoUpdater.on('update-available', () => {
        mainWindow.webContents.send('update-available');
    });

    autoUpdater.on('update-downloaded', () => {
        mainWindow.webContents.send('update-downloaded');
    });

    app.on('ready', () => {
        autoUpdater.checkForUpdatesAndNotify();
    });
}

console.log('🌟 Lume Desktop initialized');
