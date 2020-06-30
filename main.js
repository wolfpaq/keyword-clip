const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const url = require('url');
const path = require('path');
const applescript = require('applescript');
const { shell } = require('electron');

const isMac = process.platform === 'darwin';

const template = [
  ...(isMac ? [{
    label: 'AudioCategoryClipper',
    submenu: [
      // { role: 'about' },
      {
        label: 'About AudioCategoryClipper',
        click: async () =>  await shell.openExternal('https://github.com/wolfpaq/keyword-clip'),
      },
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
      ]),
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Run',
    submenu:[
      ...(isMac ? [
        {
        label: 'Applescript',
        accelerator: 'F5',
        click: async () =>  await runApplescript(),
        },
        {
          label: 'Copy Filename',
          accelerator: 'Cmd+F',
          click: async() => await copyFilename(),
        }
      ] : [
        {
          label: 'Copy Filename',
          accelerator: 'Ctrl+F',
          click: async() => await copyFilename(),
        }

      ]),
    ]
  },
  // ...(isMac ? [{
  //   label: 'Run',
  //   submenu: [
  //     {
  //       label: 'Applescript',
  //       accelerator: 'F5',
  //       click: async () =>  await runApplescript(),
  //     },
  //     {
  //       label: 'Copy Filename',
  //       accelerator: 'Cmd+F',
  //       click: async () =>  await copyFilename(),
  //     },
  //   ]
  //   }] : []),
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : [
        { role: 'close' }
      ])
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'About',
        click: async () =>  await shell.openExternal('https://github.com/wolfpaq/keyword-clip'),
      }
    ]
  }
];

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 500,
    minHeight: 500,
    webPreferences: {
      nodeIntegration: true,
      devTools: true
    },
    title: 'AudioCategoryClipper'
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
  applescript.execString(arg, (err, result) => {
    if (err) {
      console.log('ERROR', err);
    } else {
      console.log('RESULT', result);
    }
  });
});

async function runApplescript() {
  return new Promise((resolve) => {
    mainWindow.webContents.send('run-applescript');
    resolve();
  });
}

async function copyFilename() {
  return new Promise((resolve) => {
    mainWindow.webContents.send('copy-filename');
    resolve();
  });
}

