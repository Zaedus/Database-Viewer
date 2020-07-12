"use strict";
exports.__esModule = true;
exports.close = exports.open = exports.window = void 0;
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
function open(app) {
    exports.window = new electron_1.BrowserWindow({
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
    });
    exports.window.loadURL(url.format({
        pathname: path.join(__dirname, "view", "main.html"),
        protocol: "file:",
        slashes: true
    }));
    exports.window.on("ready-to-show", exports.window.show);
}
exports.open = open;
exports.close = function () { return exports.window.close(); };
