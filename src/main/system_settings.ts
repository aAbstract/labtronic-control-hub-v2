import { ipcMain, BrowserWindow } from "electron";
import fs from 'fs';
import { CHXSettings, CHXComputedParam, _ToastMessageOptions, CHXSeries, CHXEquation } from "../common/models";
import { post_event } from "../common/mediator";

let main_window: BrowserWindow | null = null;
const CHX_SETTINGS_FILENAME = 'chx_settings.json';
const CHX_CPS_FILENAME = 'chx_cps.json';
const CHX_SERIES_FILENAME = 'chx_series.json';
const CHX_EQS_FILENAME = 'chx_eqs.json';

let chx_settings: CHXSettings = { labtronic_cdn_base_url: '' };
ipcMain.handle('get_chx_settings', () => chx_settings);
let chx_cps: CHXComputedParam[] = [{ param_name: '', expr: '' }];
ipcMain.handle('get_chx_cps', () => chx_cps);
let chx_series: CHXSeries[] = [{ series_name: '', x_param: -1, y_param: -1 }];
ipcMain.handle('get_chx_series', () => chx_series);
let chx_eqs: CHXEquation[] = [{ func_name: '', args_list: [], expr: '', result_unit: '' }];
ipcMain.handle('get_chx_eqs', () => chx_eqs);

function compare_json_schema(obj_1: Object, obj_2: Object): boolean {
    if (!obj_1 || !obj_2)
        return false;
    const json_schema_1 = new Set(Object.keys(obj_1));
    const json_schema_2 = new Set(Object.keys(obj_2));
    return [...json_schema_1].every(x => json_schema_2.has(x));
}

function compare_json_schema_arr(arr_1: Array<Object>, arr_2: Array<Object>): boolean {
    if (!Array.isArray(arr_1) || !Array.isArray(arr_2))
        return false;
    if (arr_1.length === 0 || arr_2.length === 0)
        return true;
    return compare_json_schema(arr_1[0], arr_2[0]);
}

ipcMain.on('save_chx_settings', (_, data) => {
    const { _chx_settings } = data;
    if (compare_json_schema(_chx_settings, chx_settings)) {
        chx_settings = _chx_settings;
        fs.writeFileSync(CHX_SETTINGS_FILENAME, JSON.stringify(chx_settings, null, 2));
        const notif: _ToastMessageOptions = {
            severity: 'warn',
            summary: 'App Restart',
            detail: 'Changes in System Settings Will Take Effect Next Time You Open the App',
            life: 0,
        };
        main_window?.webContents.send('show_system_notif', { notif });
    }
    else {
        const notif: _ToastMessageOptions = {
            severity: 'error',
            summary: 'Error',
            detail: 'Invalid CHX Settings Object',
            life: 0,
        };
        main_window?.webContents.send('show_system_notif', { notif });
    }
});

ipcMain.on('save_chx_cps', (_, data) => {
    const { _chx_cps } = data;
    if (compare_json_schema_arr(_chx_cps, chx_cps)) {
        chx_cps = _chx_cps;
        fs.writeFileSync(CHX_CPS_FILENAME, JSON.stringify(chx_cps, null, 2));
        post_event('chx_cps_change', { _chx_cps });
        const notif: _ToastMessageOptions = {
            severity: 'info',
            summary: 'Info',
            detail: 'Device Computed Parameters Updated',
            life: 3000,
        };
        main_window?.webContents.send('show_system_notif', { notif });
    }
    else {
        const notif: _ToastMessageOptions = {
            severity: 'error',
            summary: 'Error',
            detail: 'Invalid CHX Computed Parameters Object',
            life: 0,
        };
        main_window?.webContents.send('show_system_notif', { notif });
    }
});

ipcMain.on('save_chx_series', (_, data) => {
    const { _chx_series } = data;
    if (compare_json_schema_arr(_chx_series, chx_series)) {
        chx_series = _chx_series;
        fs.writeFileSync(CHX_SERIES_FILENAME, JSON.stringify(chx_series, null, 2));
        main_window?.webContents.send('chx_series_change', { _chx_series });
        const notif: _ToastMessageOptions = {
            severity: 'info',
            summary: 'Info',
            detail: 'Device Custom Series Updated',
            life: 3000,
        };
        main_window?.webContents.send('show_system_notif', { notif });
    }
    else {
        const notif: _ToastMessageOptions = {
            severity: 'error',
            summary: 'Error',
            detail: 'Invalid CHX Series Object',
            life: 0,
        };
        main_window?.webContents.send('show_system_notif', { notif });
    }
});

function load_settings(settings_filename: string, target_schema: any, valid_json_callback: (valid_json: any) => void) {
    const validator = Array.isArray(target_schema) ? compare_json_schema_arr : compare_json_schema;
    try {
        const _data = fs.readFileSync(settings_filename, 'utf-8');
        const _json = JSON.parse(_data);
        if (validator(_json, target_schema))
            valid_json_callback(_json);
        else
            throw new Error(`Invalid Schema, settings_filename=${settings_filename}`);
    } catch (_) { fs.writeFileSync(settings_filename, JSON.stringify(target_schema, null, 2)) }
}

export function get_chx_cps(): CHXComputedParam[] {
    return chx_cps;
}

export function init_system_settings(_main_window: BrowserWindow) {
    main_window = _main_window;
    load_settings(CHX_SETTINGS_FILENAME, chx_settings, (valid_chx_settings) => chx_settings = valid_chx_settings);
    load_settings(CHX_CPS_FILENAME, chx_cps, (valid_chx_cps) => chx_cps = valid_chx_cps);
    load_settings(CHX_SERIES_FILENAME, chx_series, (valid_chx_series) => chx_series = valid_chx_series);
    load_settings(CHX_EQS_FILENAME, chx_eqs, (valid_chx_eqs) => chx_eqs = valid_chx_eqs);
}