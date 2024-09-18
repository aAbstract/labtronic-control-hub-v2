import { ipcMain, BrowserWindow } from "electron";
import { SerialAdapter } from "./serial_adapter";
import { LogMsg, DataType, MsgTypeConfig, VceParamConfig, VceParamType } from "../../common/models";
import { get_chx_cps, get_chx_series, get_chx_eqs, get_chx_scripts } from '../system_settings';
import { LtdDriverFloatSequence } from "./ltd_driver_fltsq";

const DEVICE_MODEL = 'LT-RE600';
const DEVICE_ERROR_MSG_TYPE = -1;
const DEVICE_ERROR_MSG_MAP: Record<number, string> = {};
const LT_RE600_TPH_MSG_LIST = [
    'Freq',
    'V12',
    'V23',
    'V31',
    'Ull_avg',//
    'I1',
    'I2',
    'I3',
    'L_avg',//
    'Sys_P',
    'Sys_Q',
    'Sys_S',//
    'Sys_PF',
];

const LT_RE600_SPH_MSG_LIST = [
    'Freq',
    'V1',
    'I1',
    'Sys_P',
    'Sys_Q',
    'Sys_S',//
    'Sys_PF',
];

const LT_RE600_BAT_MSG_LIST = [
    'V',
    'I',
    'P',
];

const LT_RE600_DCL_MSG_LIST = [
    'V',
    'I',
    'P',
];

const LT_RE600_ACD_MSG_LIST = [
    'Freq',
    'I',//
    'V',//
    'P',
];

export const LT_RE600_MSG_LIST = [
    ...LT_RE600_TPH_MSG_LIST.map(x => 'READ_TPH_' + x),
    ...LT_RE600_SPH_MSG_LIST.map(x => 'READ_SPH_' + x),
    ...LT_RE600_BAT_MSG_LIST.map(x => 'READ_BAT_' + x),
    ...LT_RE600_DCL_MSG_LIST.map(x => 'READ_DCL_' + x),
    ...LT_RE600_ACD_MSG_LIST.map(x => 'READ_ACD_' + x),
];

export const LT_RE600_DRIVER_CONFIG = LT_RE600_MSG_LIST.map((msg_name, idx) => {
    return {
        msg_type: idx,
        msg_name,
        data_type: DataType.FLOAT,
        size_bytes: 4,
        cfg2: 0,
    } as MsgTypeConfig;
});
const LT_RE600_VCE_CONFIG = LT_RE600_MSG_LIST.map((msg_name, idx) => {
    return {
        msg_type_config: {
            msg_type: idx,
            msg_name,
            data_type: DataType.FLOAT,
            size_bytes: 4,
            cfg2: 0,
        },
        param_symbol: '$' + msg_name.replace('READ_', ''),
        param_type: VceParamType.VCE_VAR,
        desc: DEVICE_MODEL + ' Variable ' + msg_name.replace('READ_', ''),
    } as VceParamConfig;
});

let serial_adapter: SerialAdapter | null = null;
let main_window: BrowserWindow | null = null;

ipcMain.handle(`${DEVICE_MODEL}_get_device_config`, () => LT_RE600_DRIVER_CONFIG);
ipcMain.handle(`${DEVICE_MODEL}_get_device_cmd_help`, () => LT_RE600_DEVICE_CMD_HELP);
ipcMain.handle(`${DEVICE_MODEL}_get_vce_config`, () => LT_RE600_VCE_CONFIG);

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

const LT_RE600_DEVICE_CMD_HELP: string[] = [
    '=======================================================================================================',
    '=======================================================================================================',
];
function lt_re600_cmd_exec(cmd: string) {
    console.log(`${DEVICE_MODEL} | Exec CMD: ${cmd}`);
}

export function init_lt_re600_serial_adapter(_main_window: BrowserWindow) {
    main_window = _main_window;

    ipcMain.on(`${DEVICE_MODEL}_serial_port_connect`, (_, data) => {
        const { port_name } = data;
        serial_adapter = new SerialAdapter(port_name, new LtdDriverFloatSequence([0x99, 0x99], LT_RE600_DRIVER_CONFIG), DEVICE_ERROR_MSG_TYPE, DEVICE_ERROR_MSG_MAP, mw_ipc_handler, mw_logger, DEVICE_MODEL);
        serial_adapter.connect();
    });

    ipcMain.on(`${DEVICE_MODEL}_serial_port_disconnect`, () => {
        if (!serial_adapter)
            return;
        serial_adapter.disconnect();
        serial_adapter = null;
    });

    ipcMain.on(`${DEVICE_MODEL}_exec_device_cmd`, (_, data) => {
        if (!serial_adapter) {
            mw_logger({ level: 'ERROR', msg: 'No Connected Device' });
            return;
        }

        const { cmd } = data;
        lt_re600_cmd_exec(cmd);
    });

    ipcMain.on(`${DEVICE_MODEL}_serial_port_scan`, () => SerialAdapter.scan_ports(true, DEVICE_MODEL, mw_ipc_handler, mw_logger));
    SerialAdapter.scan_ports(true, DEVICE_MODEL, mw_ipc_handler, mw_logger);

    main_window?.webContents.send(`${DEVICE_MODEL}_device_config_ready`);
    mw_logger({ level: 'INFO', msg: `Loaded Device Drivers: ${DEVICE_MODEL}` });
}