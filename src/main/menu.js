import { app, Menu } from 'electron'

const aboutMenu = {
  label: app.getName(),
  submenu: [
    {role: 'about'},
    {type: 'separator'},
    {role: 'services', submenu: []},
    {type: 'separator'},
    {role: 'hide'},
    {role: 'hideothers'},
    {role: 'unhide'},
    {type: 'separator'},
    {role: 'quit'}
  ]
}

const editMenu = {
  label: 'Edit',
  submenu: [
    { role: 'undo' },
    { role: 'redo' },
    { type: 'separator' },
    { role: 'cut' },
    { role: 'copy' },
    { role: 'paste' },
    { role: 'selectall' }
  ]
}

const windowMenu = {
  role: 'window',
  submenu: [
    { role: 'close' },
    { role: 'minimize' },
    { role: 'zoom' },
    { type: 'separator' },
    { role: 'front' }
  ]
}

const template = [
  aboutMenu,
  editMenu,
  windowMenu,
  { role: 'help', submenu: [] }
]

export function setApplicationMenu() {
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}