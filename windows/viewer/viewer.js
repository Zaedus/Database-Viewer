"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.open = void 0;
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
var exceljs = require("exceljs");
var fs = require("fs");
var Store = require("electron-store");
var window;
var store = new Store({
    name: "file_cache", defaults: {
        files: []
    }
});
function open(app, pathstring) {
    var _this = this;
    return new Promise(function (res, rej) {
        var _a = path.parse(pathstring), name = _a.name, ext = _a.ext;
        window = new electron_1.BrowserWindow({
            center: true,
            darkTheme: true,
            title: name + ext,
            webPreferences: {
                nodeIntegration: true
            },
            show: false,
            minWidth: 910,
            minHeight: 600,
            height: 610,
            width: 1240,
            autoHideMenuBar: true
        });
        window.loadURL(url.format({
            pathname: path.join(__dirname, "view", "viewer.html"),
            protocol: "file:",
            slashes: true
        }));
        window.on("ready-to-show", function () { return __awaiter(_this, void 0, void 0, function () {
            var storefile, filedata, wb, sheet, columnTypes, data, rowIndex, row, columnTypeIndex, columnType;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        storefile = store.get("files").find(function (f) { return f.path == pathstring; });
                        if (storefile) {
                            filedata = JSON.parse(fs.readFileSync(storefile.cache, { encoding: "utf8" }));
                            res(filedata);
                            window.webContents.send("data", filedata);
                            window.show();
                            return [2 /*return*/];
                        }
                        wb = new exceljs.Workbook();
                        if (!(ext == ".xlsx")) return [3 /*break*/, 2];
                        return [4 /*yield*/, wb.xlsx.readFile(pathstring)];
                    case 1:
                        sheet = (_a.sent()).worksheets[0];
                        return [3 /*break*/, 4];
                    case 2:
                        if (!(ext == ".csv")) return [3 /*break*/, 4];
                        return [4 /*yield*/, wb.csv.readFile(pathstring)];
                    case 3:
                        sheet = _a.sent();
                        _a.label = 4;
                    case 4:
                        columnTypes = sheet
                            .getRow(1)
                            .values.toString()
                            .split(",")
                            .filter(function (v) { return v; });
                        data = [];
                        for (rowIndex = 2; rowIndex < sheet.rowCount + 1; rowIndex++) {
                            row = sheet.getRow(rowIndex);
                            data.push({});
                            for (columnTypeIndex = 1; columnTypeIndex < columnTypes.length + 1; columnTypeIndex++) {
                                columnType = columnTypes[columnTypeIndex - 1];
                                data[rowIndex - 2][columnType] = row.getCell(columnTypeIndex).value;
                            }
                        }
                        res(data);
                        window.webContents.send("data", data);
                        window.show();
                        return [2 /*return*/];
                }
            });
        }); });
        window.on("close", function () {
            app.quit();
        });
    });
}
exports.open = open;
