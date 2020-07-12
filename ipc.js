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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.init = void 0;
var uuid_1 = require("uuid");
var Store = require("electron-store");
var Path = require("path");
var hasha = require("hasha");
var fs = require("fs");
var viewer = require("./windows/viewer/viewer");
var store = new Store({
    name: "file_cache", defaults: {
        files: []
    }
});
function init(ipcMain, app) {
    var _this = this;
    ipcMain.on("loadFromFile", function (e, path) { return __awaiter(_this, void 0, void 0, function () {
        var files, filesIndex, hash, cachedata, cachepath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!fs.existsSync(path)) {
                        e.returnValue = "not_found";
                        return [2 /*return*/];
                    }
                    files = store.get("files", []);
                    filesIndex = files.findIndex(function (f) { return f.path == path; });
                    hash = hasha.fromFileSync(path, {
                        algorithm: "sha1"
                    });
                    return [4 /*yield*/, viewer.open(app, path)];
                case 1:
                    cachedata = _a.sent();
                    if (filesIndex == -1) {
                        cachepath = Path.join(app.getPath("userData"), uuid_1.v1() + ".json");
                        fs.writeFileSync(cachepath, JSON.stringify(cachedata));
                        store.set("files", __spreadArrays(files, [{ hash: hash, path: path, cache: cachepath }]));
                    }
                    else {
                        if (files[filesIndex].hash != hash) {
                            fs.writeFileSync(files[filesIndex].cache, JSON.stringify(cachedata));
                            files[filesIndex].hash = hash;
                            store.set("files", files);
                        }
                    }
                    e.returnValue = "close";
                    return [2 /*return*/];
            }
        });
    }); });
    ipcMain.on("files", function (e) {
        console.log(store.path);
        e.returnValue = store.get("files", []);
    });
    ipcMain.on("clearFiles", function (e) {
        var files = store.get("files", []);
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            fs.unlinkSync(file.cache);
        }
        store.set("files", []);
        e.returnValue = "success";
    });
}
exports.init = init;
