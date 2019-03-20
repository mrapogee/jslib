import { app, globalShortcut, BrowserWindow, screen } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { StorageService } from '../abstractions/storage.service';

const DEFAULT_WIDTH = 600
const DEFAULT_HEIGHT = 500

const autoplaceWindowDimension = (displayStart: number, displayLength: number, position: number, windowLength: number) => {
  const displayEnd = displayStart + displayLength
  const windowEnd = position + windowLength

  return displayEnd < windowEnd ? position - windowLength : position
}

export class HotWindowMain {
    win: BrowserWindow;

    constructor(private storageService: StorageService, private defaultWidth = 950, private defaultHeight = 600) { }

    init() {
        const hotKey = 'CommandOrControl+Alt+Space'

        const shortcutAdded = globalShortcut.register(hotKey, () => {
          if (!this.win) {
            this.createWindow()
          }

          const cursor = screen.getCursorScreenPoint()
          const display = screen.getDisplayNearestPoint(cursor)

          const x = autoplaceWindowDimension(display.bounds.x, display.bounds.width, cursor.x, DEFAULT_WIDTH)
          const y = autoplaceWindowDimension(display.bounds.y, display.bounds.height, cursor.y, DEFAULT_HEIGHT)

          this.win.setPosition(x, y)
          this.win.show()
        }) as any as boolean

        if (!shortcutAdded) {
          console.warn('could not register hot-key window')
        }

        app.on('will-quit', () => {
          globalShortcut.unregister(hotKey)
        })
    }

    private async createWindow() {
        this.win = new BrowserWindow({
          width: DEFAULT_WIDTH,
          height: DEFAULT_HEIGHT,
          frame: false,
          show: false
        }) 

        this.win.on('blur', () => {
          this.win.hide()
        })

        this.win.loadURL(url.format({
            protocol: 'file:',
            pathname: path.join(__dirname, '/hotwindow.html'),
            slashes: true,
        }));

    }
}

