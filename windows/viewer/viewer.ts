import { App, BrowserWindow } from "electron";
import * as path from "path";
import * as url from "url";
import * as exceljs from "exceljs";
import * as fs from "fs";
import * as Store from "electron-store";

var window: BrowserWindow;

var store = new Store({
	name: "file_cache", defaults: {
		files: []
	}
});

export function open(app: App, pathstring: string) {
	return new Promise((res, rej) => {
		const { name, ext } = path.parse(pathstring);
		window = new BrowserWindow({
			center: true,
			darkTheme: true,
			title: name + ext,
			webPreferences: {
				nodeIntegration: true,
			},
			show: false,
			minWidth: 910,
			minHeight: 600,
			height: 610,
			width: 1240,
			autoHideMenuBar: true
		});

		window.loadURL(
			url.format({
				pathname: path.join(__dirname, "view", "viewer.html"),
				protocol: "file:",
				slashes: true,
			})
		);

		window.on("ready-to-show", async () => {
			var storefile = store.get("files").find(f => f.path == pathstring);
			if (storefile) {
				let filedata = JSON.parse(fs.readFileSync(storefile.cache, { encoding: "utf8" }));
				res(filedata);
				window.webContents.send("data", filedata);
				window.show();
				return;
			}
			let wb: exceljs.Workbook = new exceljs.Workbook();
			let sheet: exceljs.Worksheet;
			if (ext == ".xlsx")
				sheet = (await wb.xlsx.readFile(pathstring)).worksheets[0];
			else if (ext == ".csv") sheet = await wb.csv.readFile(pathstring);

			let columnTypes = sheet
				.getRow(1)
				.values.toString()
				.split(",")
				.filter((v) => v);

			var data = [];

			for (let rowIndex = 2; rowIndex < sheet.rowCount + 1; rowIndex++) {
				let row = sheet.getRow(rowIndex);
				data.push({});
				for (
					let columnTypeIndex = 1;
					columnTypeIndex < columnTypes.length + 1;
					columnTypeIndex++
				) {
					let columnType = columnTypes[columnTypeIndex - 1];
					data[rowIndex - 2][columnType] = row.getCell(
						columnTypeIndex
					).value;
				}
			}

			res(data);
			window.webContents.send("data", data);
			window.show();
		});
		window.on("close", () => {
			app.quit();
		})
	});
}