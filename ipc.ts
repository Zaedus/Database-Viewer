import { IpcMain, App } from "electron";
import { v1 as uuid } from "uuid"

import * as Store from "electron-store";
import * as Path from "path";
import * as hasha from "hasha";
import * as fs from "fs";

import * as viewer from "./windows/viewer/viewer"

var store = new Store({
	name: "file_cache", defaults: {
		files: []
	}
});

export function init(ipcMain: IpcMain, app: App) {
    ipcMain.on("loadFromFile", async (e, path) => {
        if(!fs.existsSync(path)) {
            e.returnValue = "not_found"
            return;
        }
        let files = store.get("files", []);
        var filesIndex = files.findIndex(f => f.path == path);

        let hash = hasha.fromFileSync(path, {
            algorithm: "sha1"
        })

        let cachedata = await viewer.open(app, path);

        if(filesIndex == -1) {
            let cachepath = Path.join(app.getPath("userData"), `${uuid()}.json`);
            fs.writeFileSync(cachepath, JSON.stringify(cachedata));
            store.set("files", [...files, { hash, path, cache: cachepath }]);
            
        } else {
            if(files[filesIndex].hash != hash) {
                fs.writeFileSync(files[filesIndex].cache, JSON.stringify(cachedata));
                files[filesIndex].hash = hash;
                store.set("files", files);
            }
        }
        e.returnValue = "close";
    })

    ipcMain.on("files", (e) => {
        console.log(store.path)
        e.returnValue = store.get("files", []);
    })

    ipcMain.on("clearFiles", (e) => {
        const files : Array<{cache: string, path: string, hash: string}> = store.get("files", []);
        for(let file of files) fs.unlinkSync(file.cache);
        store.set("files", []);
        e.returnValue = "success";
    })
}