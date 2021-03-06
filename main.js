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
        click: async () =>  await showAbout(),
      },
      { type: 'separator' },
      {
        label: 'Settings',
        accelerator: 'Cmd+,',
        click: async () => await showSettings(),
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
      ...isMac ? [
        { role: 'close' }
      ] : [
        {
          label: 'Settings',
          click: async () => await showSettings(),
        },
        { role: 'quit' }
      ]
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
        { role: 'separator' },
        {
          label: 'Select Category',
          accelerator: 'Cmd+F',
          click: async () => await selectCategory()
        }
      ] : [
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Select Category',
          accelerator: 'Ctrl+F',
          click: async () => await selectCategory()
        }
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
          accelerator: 'Cmd+D',
          click: async() => await copyFilename(),
        }
      ] : [
        {
          label: 'Copy Filename',
          accelerator: 'Ctrl+D',
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
        click: async () =>  await showAbout(),
      }
    ]
  }
];

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1040,
    height: 740,
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

async function showSettings() {
  return new Promise((resolve) => {
    mainWindow.webContents.send('show-settings');
    resolve();
  });
}

async function selectCategory() {
  return new Promise((resolve) => {
    mainWindow.webContents.send('select-category');
    resolve();
  });
}

async function showAbout() {
  return new Promise((resolve) => {
    mainWindow.webContents.send('show-about', app.getVersion());
    resolve();
  });
}


