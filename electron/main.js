import { app, BrowserWindow } from 'electron';
import path from 'path';
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
}

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
