import { app, BrowserWindow, ipcMain } from "electron";

import * as mainWindow from "./windows/main/main"
import * as ipc from "./ipc"

app.on("ready", () => {
    mainWindow.open(app);
    ipc.init(ipcMain, app);
})