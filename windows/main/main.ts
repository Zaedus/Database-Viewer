import { App, BrowserWindow, InputEvent } from "electron";
import * as path from "path";
import * as url  from "url";

export var window : BrowserWindow;

export function open(app: App) {
    window = new BrowserWindow({
        center: true,
        darkTheme: true,
        title: "Database Viewer",
        webPreferences: {
            nodeIntegration: true
        },
        minWidth: 910,
        minHeight: 600,
        height: 610,
        width: 1400,
        autoHideMenuBar: true
    })
    
    window.loadURL(url.format({
        pathname: path.join(__dirname, "view", "main.html"),
        protocol: "file:",
        slashes: true
    }))

    window.on("ready-to-show", window.show);
}

export const close = () => window.close();