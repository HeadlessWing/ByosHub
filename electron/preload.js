const { contextBridge, ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector);
        if (element) element.innerText = text;
    };

    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, process.versions[type]);
    }
});

contextBridge.exposeInMainWorld('electronAPI', {
    saveFile: (content, filename, type) => ipcRenderer.invoke('save-file', content, filename, type),
    onTutorial: (callback) => ipcRenderer.on('open-tutorial', callback)
});
