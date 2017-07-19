import { app, BrowserWindow } from 'electron'
import fs from 'fs-extra'
import path from 'path'
import { setApplicationMenu } from './menu'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`
const tempDir = path.join(app.getPath('temp'), 'spriggan')
fs.mkdirs(tempDir)

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 640,
    height: 480,
    minWidth: 640,
    minHeight: 480,
    useContentSize: true,
    // vibrancy: 'light'
    vibrancy: 'dark',
    titleBarStyle: 'hidden-inset'
  })

  mainWindow.loadURL(winURL)

  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.webContents.on('will-navigate', event => {
    event.preventDefault()
  })
}

app.on('will-finish-launching', () => {
  app.on('open-file', (event, path) => {
    event.preventDefault()
    console.log('open-file', path)
  })
})

app.on('ready', createWindow)
app.on('ready', setApplicationMenu)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  fs.removeSync(tempDir)
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

global.Spriggan = {
  tempDir
}