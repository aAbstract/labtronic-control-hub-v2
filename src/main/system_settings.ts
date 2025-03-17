import { ipcMain, BrowserWindow } from "electron";
import fs from 'node:fs';
import { CHXSettings, CHXComputedParam, _ToastMessageOptions, Result, CHXSeries, CHXEquation, CHXScript, CHXVersionInfo } from "../common/models";

export const CHX_SETTINGS_FILENAME = 'chx_settings.json';

const chx_settings_schema: CHXSettings = {
    device_model: '',
    chx_core_version: '',
    chx_module_version: '',
    chx_advanced: false,
    computed_params: [{ param_name: '', expr: '' }],
    equations: [{ func_name: '', args_list: [], expr: '', result_unit: '' }],
    scripts: [{ script_name: '', script_path: '' }],
    series: [{ series_name: '', x_param: -1, y_param: -1 }],
    device_config: {},
};
// @ts-ignore
let main_window: BrowserWindow | null = null;
let chx_settings: CHXSettings | null = null;

function compare_json_schema(obj_1: Object, obj_2: Object): boolean {
    if (!obj_1 || !obj_2)
        return false;
    const json_schema_1 = new Set(Object.keys(obj_1));
    const json_schema_2 = new Set(Object.keys(obj_2));
    return json_schema_1.size === json_schema_2.size && [...json_schema_1].every(x => json_schema_2.has(x));
}

function compare_json_schema_arr(arr_1: Array<Object>, arr_2: Array<Object>): boolean {
    if (!Array.isArray(arr_1) || !Array.isArray(arr_2))
        return false;
    if (arr_1.length === 0 || arr_2.length === 0)
        return true;
    return compare_json_schema(arr_1[0], arr_2[0]);
}

function validate_chx_settings(_chx_settings: CHXSettings | null): Result<string> {
    if (!_chx_settings)
        return { err: 'validate_chx_settings: _chx_settings=NULL' };

    const __ks = [
        'device_model',
        'chx_core_version',
        'chx_module_version',
        'chx_advanced',
        'device_config',
    ]
    for (const __k of __ks) {
        if (!(__k in _chx_settings))
            return { err: `validate_chx_settings: Missing ${__k}` };
    }

    if (!compare_json_schema_arr(_chx_settings.computed_params ?? [], chx_settings_schema.computed_params))
        return { err: 'validate_chx_settings: Invalid _chx_settings.computed_params' };

    if (!compare_json_schema_arr(_chx_settings.equations ?? [], chx_settings_schema.equations))
        return { err: 'validate_chx_settings: Invalid _chx_settings.equations' };

    if (!compare_json_schema_arr(_chx_settings.scripts ?? [], chx_settings_schema.scripts))
        return { err: 'validate_chx_settings: Invalid _chx_settings.scripts' };

    if (!compare_json_schema_arr(_chx_settings.series ?? [], chx_settings_schema.series))
        return { err: 'validate_chx_settings: Invalid _chx_settings.series' };

    return { ok: 'OK' };
}

function load_chx_settings(): boolean {
    try {
        const _data = fs.readFileSync(CHX_SETTINGS_FILENAME, 'utf-8');
        const _json = JSON.parse(_data);
        const _vres = validate_chx_settings(_json);
        if (_vres.ok) {
            chx_settings = _json;
            return true;
        }

        throw new Error(_vres.err);
    } catch (_) {
        fs.writeFileSync(CHX_SETTINGS_FILENAME, JSON.stringify(chx_settings_schema, null, 2));
        return false;
    }
}

export function get_chx_cps(): CHXComputedParam[] {
    return chx_settings?.computed_params ?? [];
}

export function get_chx_series(): CHXSeries[] {
    return chx_settings?.series ?? [];
}

export function get_chx_eqs(): CHXEquation[] {
    return chx_settings?.equations ?? [];
}

export function get_chx_scripts(): CHXScript[] {
    return chx_settings?.scripts ?? [];
}

export function get_chx_device_confg(): Record<string, any> {
    return chx_settings?.device_config ?? {};
}

export function set_chx_device_config(_device_config: Record<string, any>) {
    if (!_device_config || !chx_settings)
        return;
    chx_settings.device_config = _device_config;
}

export function get_version_info(): CHXVersionInfo {
    const device_model = chx_settings?.device_model ?? '';
    const chx_core_version = chx_settings?.chx_core_version ?? '';
    const chx_module_version = chx_settings?.chx_module_version ?? '';
    return { device_model, chx_core_version, chx_module_version };
}

export function save_chx_settings(): boolean {
    try {
        const _vres = validate_chx_settings(chx_settings);
        if (_vres.ok) {
            fs.writeFileSync(CHX_SETTINGS_FILENAME, JSON.stringify(chx_settings, null, 2));
            return true;
        }

        return false;
    } catch (_) { return false }
}

export function init_system_settings(_main_window: BrowserWindow) {
    main_window = _main_window;
    load_chx_settings();
    ipcMain.handle('get_chx_advanced', () => chx_settings?.chx_advanced ?? false);
    ipcMain.handle('get_chx_device_config', () => chx_settings?.device_config ?? {});
    ipcMain.handle('get_chx_eqs', () => chx_settings?.equations ?? []);

    ipcMain.handle('get_version_info', () => get_version_info());
}