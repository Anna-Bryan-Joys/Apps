const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development';
const WIDGET = { w: 320, h: 480 };
const FULL   = { w: 1420, h: 880 };

let anchor;
let win;
let savedWidgetPos = null;

function createWindow() {
  // Invisible normal-level anchor window — child windows inherit parent's window level
  anchor = new BrowserWindow({
    width: 1, height: 1, x: -200, y: -200,
    show: false, frame: true, skipTaskbar: true,
    webPreferences: { nodeIntegration: false },
  });

  win = new BrowserWindow({
    parent:          anchor,
    width:           WIDGET.w,
    height:          WIDGET.h,
    titleBarStyle:   'hidden',
    trafficLightPosition: { x: -100, y: 0 },
    backgroundColor: '#04030f',
    alwaysOnTop:     false,
    resizable:       true,
    minWidth:        WIDGET.w,
    minHeight:       WIDGET.h,
    hasShadow:       true,
    webPreferences: {
      nodeIntegration:  false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

ipcMain.on('go-full', () => {
  savedWidgetPos = win.getPosition();
  win.setResizable(true);
  win.maximize();
});

ipcMain.on('go-widget', () => {
  win.setAlwaysOnTop(false);
  win.setResizable(true);
  win.setSize(WIDGET.w, WIDGET.h);
  if (savedWidgetPos) win.setPosition(savedWidgetPos[0], savedWidgetPos[1]);
});

ipcMain.on('app-quit',     () => { win.destroy(); anchor.destroy(); });
ipcMain.on('app-minimize', () => win.minimize());

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
