import { ipcMain } from "electron";
import { dialog, BrowserWindow, SaveDialogOptions, OpenDialogOptions } from "electron";
import { DmtbRow, Result } from "../common/models";
import pcsv from 'papaparse';
import fs from 'fs';

function export_device_data(main_window: BrowserWindow, device_data: DmtbRow[]) {
    const options: SaveDialogOptions = {
        title: 'Export Device Data',
        filters: [
            { name: 'CSV Files', extensions: ['csv'] },
            { name: 'All Files', extensions: ['*'] },
        ],
    };

    dialog.showSaveDialog(main_window, options).then(res => {
        if (res.canceled || !res.filePath)
            return;
        fs.writeFile(res.filePath, pcsv.unparse(device_data), (err) => {
            const fsio_res: Result<string> = err ? { err: err.message } : { ok: `Device Data Saved to: ${res.filePath}` };
            main_window.webContents.send('export_device_data_res', fsio_res);
        });
    });
}

function import_device_data_transformer(value: string, header: string) {
    if (['sn', 'msg_type', 'msg_value'].includes(header))
        return Number(value);
    return value;
}

function import_device_data(main_window: BrowserWindow) {
    const options: OpenDialogOptions = {
        title: 'Import Device Data',
        filters: [
            { name: 'CSV Files', extensions: ['csv'] },
            { name: 'All Files', extensions: ['*'] },
        ],
    };

    dialog.showOpenDialog(main_window, options).then(res => {
        if (res.canceled || res.filePaths.length === 0)
            return;
        fs.readFile(res.filePaths[0], 'utf-8', (err, data) => {
            if (err)
                main_window.webContents.send('import_device_data_res', { err: err.message });
            else
                main_window.webContents.send('import_device_data_res', { ok: pcsv.parse(data, { header: true, transform: import_device_data_transformer }).data });
        });
    });
}

export function init_fsio(main_window: BrowserWindow) {
    ipcMain.on('import_device_data', () => import_device_data(main_window));
    ipcMain.on('export_device_data', (_, data) => {
        const { device_data } = data;
        export_device_data(main_window, device_data);
    });
}