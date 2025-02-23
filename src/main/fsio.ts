import { ipcMain, Rectangle } from "electron";
import { dialog, BrowserWindow, SaveDialogOptions, OpenDialogOptions } from "electron";
import { DmtbRow, Result } from "../common/models";
import pcsv from 'papaparse';
import fs from 'node:fs';

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

    main_window.webContents.capturePage(comp_rect).then(cap_img => {
        dialog.showSaveDialog(main_window, options).then(res => {
            if (res.canceled || !res.filePath)
                return;
            const { filePath } = res;
            fs.writeFile(filePath + '.png', cap_img.toPNG() as any, (err) => {
                const fsio_res: Result<string> = err ? { err: err.message } : { ok: `Screenshot Saved to: ${res.filePath}` };
                main_window.webContents.send('save_screenshot_res', fsio_res);
            });
        });
    });
}

function load_device_asset(asset_path: string): string | null {
    const file_path = `device_assets/${asset_path}`;
    try {
        const bitmap = fs.readFileSync(file_path);
        const base64_buffer = Buffer.from(bitmap).toString('base64');
        const img_ext = asset_path.split('.').pop();
        return `data:image/${img_ext};base64,${base64_buffer}`;
    } catch (_) { return null; }
}

function load_device_pdf(device_model: string): string {
    const _device_model = device_model.toLowerCase().replace('-', '_');
    const file_path = `device_data/${_device_model}/${_device_model}.pdf`;
    try {
        const pdf_bin = fs.readFileSync(file_path);
        const base64_buffer = Buffer.from(pdf_bin).toString('base64');
        return `data:application/pdf;base64,${base64_buffer}`;
    } catch (_) { return '' }
}

function load_device_metadata(device_model: string): Record<string, string> {
    const _device_model = device_model.toLowerCase().replace('-', '_');
    const _file_path = `device_data/${_device_model}/${_device_model}.json`;
    try {
        const metadata_str = fs.readFileSync(_file_path, { encoding: 'utf8' });
        const metadata_record = JSON.parse(metadata_str);
        return metadata_record;
    } catch (_) { return {} }
}

export function init_fsio(main_window: BrowserWindow) {
    ipcMain.on('import_device_data', () => import_device_data(main_window));
    ipcMain.on('export_device_data', (_, data) => export_device_data(main_window, data.device_data));
    ipcMain.on('save_screenshot', (_, data) => save_screenshot(main_window, data.comp_rect));
    ipcMain.handle('load_devie_asset', (_, data) => load_device_asset(data.asset_path));
    ipcMain.handle('load_devie_pdf', (_, data) => load_device_pdf(data.device_model));
    ipcMain.handle('load_device_metadata', (_, data) => load_device_metadata(data.device_model));
}