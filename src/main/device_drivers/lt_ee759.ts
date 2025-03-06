import { ipcMain, BrowserWindow } from "electron";
import { SerialAdapter } from "./serial_adapter";
import { LtdDriver } from "./ltd_driver";
import { DataType, MsgTypeConfig, LogMsg, VceParamConfig, VceParamType, _ToastMessageOptions, CHXComputedParam, DeviceMsg } from '../../common/models';
import { get_chx_cps, get_chx_eqs, get_chx_scripts, get_chx_series } from "../system_settings";
import { VirtualComputeEngine } from "../vce";

const DEVICE_MODEL = 'LT-EE759';
const DEVICE_ERROR_MSG_TYPE = 14;
const DEVICE_ERROR_MSG_MAP: Record<number, string> = {};

const LT_EE759_DRIVER_CONFIG: MsgTypeConfig[] = [
    {
        msg_type: 0,
        msg_name: 'READ_V',
        data_type: DataType.FLOAT,
        size_bytes: 4,
        cfg2: 0,
    },
    {
        msg_type: 1,
        msg_name: 'READ_I',
        data_type: DataType.FLOAT,
        size_bytes: 4,
        cfg2: 0,
    },
];
const LT_EE759_VCE_CONFIG: VceParamConfig[] = [
    // VCE_VAR
    {
        msg_type_config: {
            msg_type: 0,
            msg_name: 'READ_V',
            data_type: DataType.FLOAT,
            size_bytes: 4,
            cfg2: 0,
        },
        param_symbol: '$V',
        param_type: VceParamType.VCE_VAR,
        desc: 'Voltage',
    },
    {
        msg_type_config: {
            msg_type: 1,
            msg_name: 'READ_I',
            data_type: DataType.FLOAT,
            size_bytes: 4,
            cfg2: 0,
        },
        param_symbol: '$I',
        param_type: VceParamType.VCE_VAR,
        desc: 'Current',
    },
];
const E_WH_MsgTypeConfig: MsgTypeConfig = {
    msg_type: 17,
    msg_name: 'E_wh',
    data_type: DataType.FLOAT,
    size_bytes: 4,
    cfg2: 0,
};
const DEVICE_CPS: CHXComputedParam[] = [
    { param_name: 'P', expr: '$V * $I', msg_type: 16, unit: 'W' },
    { param_name: E_WH_MsgTypeConfig.msg_name, msg_type: E_WH_MsgTypeConfig.msg_type, unit: 'Wh' },
];

let serial_adapter: SerialAdapter | null = null;
let main_window: BrowserWindow | null = null;
let lt_ee759_vce0: VirtualComputeEngine | null = null;

ipcMain.handle(`${DEVICE_MODEL}_get_device_config`, () => [...LT_EE759_DRIVER_CONFIG, ...(lt_ee759_vce0?.get_cps_config() ?? [])]);
ipcMain.handle(`${DEVICE_MODEL}_get_device_cmd_help`, () => LT_EE759_DEVICE_CMD_HELP);
ipcMain.handle(`${DEVICE_MODEL}_get_vce_config`, () => LT_EE759_VCE_CONFIG);

ipcMain.handle(`${DEVICE_MODEL}_get_chx_cps`, () => [...DEVICE_CPS, ...get_chx_cps()]);
ipcMain.handle(`${DEVICE_MODEL}_get_chx_series`, () => get_chx_series());
ipcMain.handle(`${DEVICE_MODEL}_get_chx_eqs`, () => get_chx_eqs());
ipcMain.handle(`${DEVICE_MODEL}_get_chx_scripts`, () => get_chx_scripts());

function mw_logger(log_msg: LogMsg) {
    main_window?.webContents.send('add_sys_log', log_msg);
}

let last_t = 0;
let last_p = 0;
let e_wh = 0; // energy in Wh
let debug_last_wh = 0;
const __DEBUG = false;
function energy_trapz(sn: number, power: number) {
    // calculate energy using trapezoidal numerical integration
    if (last_t === 0) {
        last_t = new Date().getTime();
        last_p = power;
        return;
    }

    const current_t = new Date().getTime();
    const dt = (current_t - last_t) * 1E-3;
    const trapz_integral_step = 0.5 * dt * (last_p + power);
    e_wh += trapz_integral_step * 2.78E-4; // convert from watt*second to watt*hour

    const e_wh_device_msg: DeviceMsg = {
        config: E_WH_MsgTypeConfig,
        seq_number: sn,
        msg_value: e_wh,
        b64_msg_value: '', // skip binary encoding float bytes
    };
    main_window?.webContents.send(`${DEVICE_MODEL}_device_msg`, { device_msg: e_wh_device_msg });

    last_p = power;
    last_t = current_t;

    // debug: print delta energy over time
    if (__DEBUG) {
        if (debug_last_wh === 0) {
            debug_last_wh = e_wh;
            return;
        }

        console.log(`[DEBUG-${DEVICE_MODEL}] Energy Diff [Wh]: ${e_wh - debug_last_wh}`);
        debug_last_wh = e_wh;
    }
}

function mw_ipc_handler(channel: string, data: any) {
    main_window?.webContents.send(channel, data);

    if (channel === `${DEVICE_MODEL}_device_msg`) {
        const device_msg: DeviceMsg = data.device_msg;
        if (device_msg.config.msg_type < 16)
            lt_ee759_vce0?.load_device_msg(data.device_msg);


        if (device_msg.config.msg_type === 16) // VCE: P
            energy_trapz(device_msg.seq_number, device_msg.msg_value);
    }
}

const LT_EE759_DEVICE_CMD_HELP: string[] = [
    '=======================================================================================================',
    '=======================================================================================================',
];
function lt_ee759_cmd_exec(cmd: string) {
    console.log(`${DEVICE_MODEL} | Exec CMD: ${cmd}`);
}

export function init_lt_ee759_serial_adapter(_main_window: BrowserWindow) {
    main_window = _main_window;

    ipcMain.on(`${DEVICE_MODEL}_serial_port_connect`, (_, data) => {
        const { port_name } = data;
        serial_adapter = new SerialAdapter(port_name, new LtdDriver([0xA0, 0x0A], LT_EE759_DRIVER_CONFIG), DEVICE_ERROR_MSG_TYPE, DEVICE_ERROR_MSG_MAP, mw_ipc_handler, mw_logger, DEVICE_MODEL);
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
        lt_ee759_cmd_exec(cmd);
    });

    ipcMain.on(`${DEVICE_MODEL}_reset_energy`, () => e_wh = 0);

    ipcMain.on(`${DEVICE_MODEL}_serial_port_scan`, () => SerialAdapter.scan_ports(true, DEVICE_MODEL, mw_ipc_handler, mw_logger));
    SerialAdapter.scan_ports(true, DEVICE_MODEL, mw_ipc_handler, mw_logger);

    lt_ee759_vce0 = new VirtualComputeEngine(LT_EE759_VCE_CONFIG, [...DEVICE_CPS, ...get_chx_cps()], mw_ipc_handler, DEVICE_MODEL);

    main_window?.webContents.send(`${DEVICE_MODEL}_device_config_ready`);
    mw_logger({ level: 'INFO', msg: `Loaded Device Drivers: ${DEVICE_MODEL}` });
}