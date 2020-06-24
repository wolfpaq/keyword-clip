const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const url = require('url');
const path = require('path');
const applescript = require('applescript');

const isMac = process.platform === 'darwin';

const template = [
  ...(isMac ? [{
    label: 'Audio Category Clipper',
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  {
    label: 'File',
    submenu: [
      isMac ? { role: 'close' } : { role: 'quit' }
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
      ...(isMac ? [
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
      ] : [
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ])
    ]
  },
];

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      devTools: false
    }
  });

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, `/dist/index.html`),
      protocol: 'file:',
      slashes: true
    })
  );
  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null
  });
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
});

app.on('activate', function () {
  if (mainWindow === null) createWindow()
});

ipcMain.on('run-applescript', (event, arg) => {
  console.log('run-applescript', event, arg);
  applescript.execString(arg, (err, result) => {
    if (err) {
      console.log('ERROR', err);
    } else {
      console.log('RESULT', result);
    }
  });
});

