import { ipcMain, BrowserWindow } from "electron";
import { LogMsg, _ToastMessageOptions } from '../../common/models';
import { get_chx_cps, get_chx_eqs, get_chx_scripts, get_chx_series } from "../system_settings";

const DEVICE_MODEL = 'LT-CH500';

let main_window: BrowserWindow | null = null;

ipcMain.handle(`${DEVICE_MODEL}_get_device_config`, () => []);
ipcMain.handle(`${DEVICE_MODEL}_get_device_cmd_help`, () => LT_HT113_DEVICE_CMD_HELP);
ipcMain.handle(`${DEVICE_MODEL}_get_vce_config`, () => []);

ipcMain.handle(`${DEVICE_MODEL}_get_chx_cps`, () => get_chx_cps());
ipcMain.handle(`${DEVICE_MODEL}_get_chx_series`, () => get_chx_series());
ipcMain.handle(`${DEVICE_MODEL}_get_chx_eqs`, () => get_chx_eqs());
ipcMain.handle(`${DEVICE_MODEL}_get_chx_scripts`, () => get_chx_scripts());

function mw_logger(log_msg: LogMsg) {
    main_window?.webContents.send('add_sys_log', log_msg);
}

function mw_ipc_handler(channel: string, data: any) {
    main_window?.webContents.send(channel, data);
}

const LT_HT113_DEVICE_CMD_HELP: string[] = [
    '=======================================================================================================',
    'REQUEST REGISTER <register_name>, Alias: RR <register_name>      | Request Register Value from LT Bus',
    '=======================================================================================================',
];
function lt_bus_driver_cmd_exec(cmd: string) {
    const CMD_ALIAS_LIST: Record<string, string[]> = {
        'RR': ['REQUEST', 'REGISTER'],
    };

    // substitute command alias
    let cmd_parts = cmd.split(' ');
    const cmd_part_1 = cmd_parts[0];
    if (cmd_part_1 in CMD_ALIAS_LIST)
        cmd_parts = [...CMD_ALIAS_LIST[cmd_part_1], ...cmd_parts.slice(1)];

    if (cmd_parts[0] === 'REQUEST' && cmd_parts[1] === 'REGISTER') {
        const reg_addr = Number(cmd_parts[2]);
        if (isNaN(reg_addr))
            return;

    }
}

export function init_lt_ch500_serial_adapter(_main_window: BrowserWindow) {
    main_window = _main_window;

    ipcMain.on(`${DEVICE_MODEL}_exec_device_cmd`, (_, data) => {
        const { cmd } = data;
        lt_bus_driver_cmd_exec(cmd);
    });

    main_window?.webContents.send(`${DEVICE_MODEL}_device_config_ready`);
    mw_logger({ level: 'INFO', msg: 'Loaded Device Drivers: LT-BUS-DRIVER' });
}