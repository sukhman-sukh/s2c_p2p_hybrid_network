require('dotenv').config();
const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const fs = require("fs")

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
  mainWindow.loadURL(`http://localhost:${process.env.FRONTEND_PORT}`);
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
ipcMain.on('chunk_share', (event, videoData) => {
  console.log('File data',typeof(videoData));
  console.log('File data',videoData);
  console.log(videoData?.videoID)


  const fileId = videoData?.videoID;
  let string = ''
  let counter = 0;
  videoData?.chunkData?.map((chunk)=>{
    string+=chunk.Data
    counter++
  })
  console.log(string,counter)

  function base64ToBinary(base64String, filePath) {
    // const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  
    const binaryData = Buffer.from(base64String, 'base64');
  
    fs.writeFile(filePath, binaryData, (error) => {
      if (error) {
        console.error('Error writing file:', error);
      } else {
        console.log('File saved successfully:', filePath);
      }
    });
  }
  if(fileId){
    const filePath = `/home/arshdeep/Desktop/sdshackathon24/Client/client/downloadedData/${fileId}.mp4`
    base64ToBinary(string,filePath)

  }
});
