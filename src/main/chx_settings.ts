import { ipcMain, BrowserWindow } from "electron";
import fs from 'fs';
import { CHXSettings, LogMsg } from "../common/models";

let main_window: BrowserWindow | null = null;
const CHX_SETTINGS_FN = 'chx_settings.json';

let chx_settings: CHXSettings = { labtronic_cdn_base_url: '' };
ipcMain.handle('get_chx_settings', () => chx_settings);

function compare_json_schema(obj_1: Object, obj_2: Object): boolean {
    const json_schema_1 = new Set(Object.keys(obj_1));
    const json_schema_2 = new Set(Object.keys(obj_2));
    return [...json_schema_1].every(x => json_schema_2.has(x));
}

ipcMain.on('save_chx_settings', (_, data) => {
    const { _chx_settings } = data;
    if (compare_json_schema(_chx_settings, chx_settings)) {
        chx_settings = _chx_settings;
        fs.writeFileSync(CHX_SETTINGS_FN, JSON.stringify(chx_settings, null, 2));
        main_window?.reload();
    }
    else { main_window?.webContents.send('add_sys_log', { level: 'ERROR', msg: 'Invalid CHX Settings Object' } as LogMsg) }
});

export function init_chx_settings(_main_window: BrowserWindow) {
    main_window = _main_window;
    try {
        const _data = fs.readFileSync(CHX_SETTINGS_FN, 'utf-8');
        const _json = JSON.parse(_data);
        if (!compare_json_schema(_json, chx_settings))
            throw new Error('Invalid CHX Settings Schema');
        chx_settings = _json;
    }
    catch (_) { fs.writeFileSync(CHX_SETTINGS_FN, JSON.stringify(chx_settings, null, 2)) }
}