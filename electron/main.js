import { app, BrowserWindow, ipcMain, dialog, Menu, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
        // Icon path differs between dev (root/public) and prod (dist)
        // In packaged app, __dirname is in resources/app/electron/
        // dist is in resources/app/dist/
        icon: app.isPackaged
            ? path.join(__dirname, '../dist/icon.ico')
            : path.join(__dirname, '../public/icon.ico')
    });

    // In development, load the Vite dev server
    // In production, load the built index.html
    // In development, load the Vite dev server
    // In production, load the built index.html
    if (!app.isPackaged) {
        win.loadURL('http://localhost:5173');
        win.webContents.openDevTools();
    } else {
        // In production, we need to handle the file protocol correctly
        // Assuming 'dist' is the output folder
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    createMenu(win);
}

// Persistence logic
// Simple JSON file in userData
const PREFS_FILE = path.join(app.getPath('userData'), 'user-prefs.json');
let lastExportPath = app.getPath('documents'); // default

try {
    if (fs.existsSync(PREFS_FILE)) {
        const data = JSON.parse(fs.readFileSync(PREFS_FILE, 'utf8'));
        if (data.lastExportPath) {
            lastExportPath = data.lastExportPath;
        }
    }
} catch (e) {
    console.error("Failed to load prefs", e);
}

function savePrefs() {
    try {
        fs.writeFileSync(PREFS_FILE, JSON.stringify({ lastExportPath }));
    } catch (e) {
        console.error("Failed to save prefs", e);
    }
}

function createMenu(win) {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Reset App',
                    click: () => win.reload()
                },
                {
                    label: 'Force Reset',
                    click: () => win.webContents.reloadIgnoringCache()
                },
                { type: 'separator' },
                { role: 'quit' }
            ]
        },
        // Optional: Keep 'View' specifically for DevTools if strictly needed, but user said "Edit can go away"
        // and implied simplifying. "Reset" is covering reload.
        // Let's add a hidden DevTools toggle just in case, or skipping it as requested.
        // User asked to clean up.
        {
            label: 'Help',
            submenu: [
                {
                    label: 'Bug Report',
                    click: async () => {
                        await shell.openExternal('https://github.com/HeadlessWing/ByosHub/issues');
                    }
                },
                {
                    label: 'Features & Tutorials',
                    click: () => {
                        win.webContents.send('open-tutorial');
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
    createWindow();

    ipcMain.handle('save-file', async (event, content, filename, type) => {
        const { canceled, filePath } = await dialog.showSaveDialog({
            defaultPath: path.join(lastExportPath, filename),
            filters: [
                { name: 'Deck Application Files', extensions: ['json', 'cod', 'txt'] }
            ]
        });

        if (canceled || !filePath) {
            return { status: 'canceled' };
        }

        try {
            fs.writeFileSync(filePath, content);

            // Update persistence
            lastExportPath = path.dirname(filePath);
            savePrefs();

            return { status: 'success', filePath };
        } catch (e) {
            console.error("Failed to save file", e);
            return { status: 'error', error: e.message };
        }
    });

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
