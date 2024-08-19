import { ipcMain, Rectangle } from "electron";
import { dialog, BrowserWindow, SaveDialogOptions, OpenDialogOptions } from "electron";
import { DmtbRow, Result } from "../common/models";
import pcsv from 'papaparse';
import fs from 'fs';

// @ts-ignore
function _export_device_data(main_window: BrowserWindow, device_data: DmtbRow[]) {
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
        fs.writeFile(res.filePath + '.csv', pcsv.unparse(device_data), (err) => {
            const fsio_res: Result<string> = err ? { err: err.message } : { ok: `Device Data Saved to: ${res.filePath}` };
            main_window.webContents.send('export_device_data_res', fsio_res);
        });
    });
}

function export_device_data(main_window: BrowserWindow, device_data: Record<string, number>[]) {
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
        fs.writeFile(res.filePath + '.csv', pcsv.unparse(device_data), (err) => {
            const fsio_res: Result<string> = err ? { err: err.message } : { ok: `Device Data Saved to: ${res.filePath}` };
            main_window.webContents.send('export_device_data_res', fsio_res);
        });
    });
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
                main_window.webContents.send('import_device_data_res', {
                    ok: pcsv.parse(data, {
                        header: true,
                        transform: (value: string, _: string) => Number(value),
                    }).data
                });
        });
    });
}

function save_screenshot(main_window: BrowserWindow, comp_rect: Rectangle) {
    const options: SaveDialogOptions = {
        title: 'CHX Screenshot',
        filters: [
            { name: 'PNG Files', extensions: ['png'] },
            { name: 'All Files', extensions: ['*'] },
        ],
    };

    dialog.showSaveDialog(main_window, options).then(res => {
        if (res.canceled || !res.filePath)
            return;
        const { filePath } = res;
        main_window.webContents.capturePage(comp_rect).then(cap_img => {
            fs.writeFile(filePath + '.png', cap_img.toPNG(), (err) => {
                const fsio_res: Result<string> = err ? { err: err.message } : { ok: `Screenshot Saved to: ${res.filePath}` };
                main_window.webContents.send('save_screenshot_res', fsio_res);
            });
        });
    });
}

function load_device_asset(asset_path: string): string {
    const file_path = `device_assets/${asset_path}`;
    const bitmap = fs.readFileSync(file_path);
    const base64_buffer = Buffer.from(bitmap).toString('base64');
    const img_ext = asset_path.split('.').pop();
    return `data:image/${img_ext};base64,${base64_buffer}`;
}

export function init_fsio(main_window: BrowserWindow) {
    ipcMain.on('import_device_data', () => import_device_data(main_window));
    ipcMain.on('export_device_data', (_, data) => export_device_data(main_window, data.device_data));
    ipcMain.on('save_screenshot', (_, data) => save_screenshot(main_window, data.comp_rect));
    ipcMain.handle('load_devie_asset', (_, data) => load_device_asset(data.asset_path));
}