"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var mainWindow = require("./windows/main/main");
var ipc = require("./ipc");
electron_1.app.on("ready", function () {
    mainWindow.open(electron_1.app);
    ipc.init(electron_1.ipcMain, electron_1.app);
});
