import { ipcMain, BrowserWindow } from "electron";
import { SerialAdapter } from "./serial_adapter";
import { LtdDriver } from "./ltd_driver";
import { DataType, MsgTypeConfig, LogMsg, _ToastMessageOptions } from "../../common/models";
import { get_chx_cps, get_chx_series, get_chx_eqs, get_chx_scripts } from "../system_settings";
// @ts-ignore
import { DeviceMsg } from "../../common/models";

const DEVICE_MODEL = 'LT-EC559';
const DEVICE_ERROR_MSG_TYPE = 14;
const DEVICE_ERROR_MSG_MAP: Record<number, string> = {};
const LT_EC559_DRIVER_CONFIG: MsgTypeConfig[] = [
    {
        msg_type: 0,
        msg_name: 'READ_B_V',
        data_type: DataType.FLOAT,
        size_bytes: 4,
        cfg2: 0,
    },
    {
        msg_type: 1,
        msg_name: 'READ_B_C',
        data_type: DataType.FLOAT,
        size_bytes: 4,
        cfg2: 0,
    },
    {
        msg_type: 2,
        msg_name: 'READ_B_P',
        data_type: DataType.FLOAT,
        size_bytes: 4,
        cfg2: 0,
    },
    {
        msg_type: 4,
        msg_name: 'READ_M_P',
        data_type: DataType.FLOAT,
        size_bytes: 4,
        cfg2: 0,
    },
    {
        msg_type: 5,
        msg_name: 'CONTROL_BUTTONS',
        data_type: DataType.UINT,
        size_bytes: 1,
        cfg2: 0,
    },
    {
        msg_type: DEVICE_ERROR_MSG_TYPE,
        msg_name: 'DEVICE_ERROR',
        data_type: DataType.UINT,
        size_bytes: 1,
        cfg2: 0,
    },
];

let serial_adapter: SerialAdapter | null = null;
let main_window: BrowserWindow | null = null;

ipcMain.handle(`${DEVICE_MODEL}_get_device_config`, () => LT_EC559_DRIVER_CONFIG);
ipcMain.handle(`${DEVICE_MODEL}_get_device_cmd_help`, () => LT_EC559_DEVICE_CMD_HELP);
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

const LT_EC559_DEVICE_CMD_HELP: string[] = [
    '=======================================================================================================',
    '=======================================================================================================',
];
function lt_ec559_cmd_exec(cmd: string) {
    console.log(`${DEVICE_MODEL} | Exec CMD: ${cmd}`);
}

export function init_lt_ec559_serial_adapter(_main_window: BrowserWindow) {
    main_window = _main_window;

    ipcMain.on(`${DEVICE_MODEL}_serial_port_connect`, (_, data) => {
        const { port_name } = data;
        serial_adapter = new SerialAdapter(port_name, new LtdDriver([0x32, 0x42], LT_EC559_DRIVER_CONFIG), DEVICE_ERROR_MSG_TYPE, DEVICE_ERROR_MSG_MAP, mw_ipc_handler, mw_logger, DEVICE_MODEL);
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
        lt_ec559_cmd_exec(cmd);
    });

    ipcMain.on(`${DEVICE_MODEL}_serial_port_scan`, () => SerialAdapter.scan_ports(true, DEVICE_MODEL, mw_ipc_handler, mw_logger));
    SerialAdapter.scan_ports(true, DEVICE_MODEL, mw_ipc_handler, mw_logger);

    main_window?.webContents.send(`${DEVICE_MODEL}_device_config_ready`);
    mw_logger({ level: 'INFO', msg: `Loaded Device Drivers: ${DEVICE_MODEL}` });
}