require('dotenv').config();
const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'FileWave',
    width: 1400,
    height: 800,
    resizable: false,
    icon: './renderer/public/icon.png',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  const startUrl = url.format({
    pathname: path.join(__dirname, './renderer/build/index.html'),
    protocol: 'file',
  });

  // mainWindow.loadURL(startUrl);
  mainWindow.loadURL(`http://localhost:3000`);
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createMainWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
