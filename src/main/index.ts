import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import { init_lt_ch000_serial_adapter, lt_ch000_main_to_renderer_ipc_bridge } from './device_drivers/lt_ch000';
import { subscribe } from '../common/mediator';

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  setup_main_to_renderer_ipc_bridge(mainWindow);
  setTimeout(() => {
    init_lt_ch000_serial_adapter();
  }, 1000);
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('labtronic-control-hub-v2.aAbstract')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

function setup_main_to_renderer_ipc_bridge(main_window: BrowserWindow) {
  // main -> renderer ipc bridge
  [
    ...lt_ch000_main_to_renderer_ipc_bridge,
    'add_sys_log',
    'detected_ports',
  ].forEach(event_type => subscribe(event_type, `${event_type}_ipc_bridge`, args => main_window.webContents.send(event_type, args)));
}