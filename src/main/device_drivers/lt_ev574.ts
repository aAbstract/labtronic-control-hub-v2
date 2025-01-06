import { ipcMain, BrowserWindow } from "electron";
import { SerialAdapter } from "./serial_adapter";
import { LtdDriver } from "./ltd_driver";
import { DataType, MsgTypeConfig, LogMsg, VceParamConfig, VceParamType, _ToastMessageOptions, CHXSeries, CHXComputedParam, DeviceMsg } from '../../common/models';
import { get_chx_cps, get_chx_eqs, get_chx_scripts, get_chx_series } from "../system_settings";
import { VirtualComputeEngine } from "../vce";

const DEVICE_MODEL = 'LT-EV574';
const WRITE_CONTROL_BUTTONS_MSG_TYPE = 12;
const DEVICE_ERROR_MSG_TYPE = 14;
const DEVICE_HEART_BEAT_MSG_TYPE = 15;

const DEVICE_ERROR_MSG_MAP: Record<number, string> = {
    0xF0: 'Low Battery Voltage',
    0x0F: 'Setpoint value out of range',
    0xFF: 'Invalid Packet',
};
const LT_EV574_DRIVER_CONFIG: MsgTypeConfig[] = [
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
        msg_type: 3,
        msg_name: 'READ_W_S',
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
        msg_type: WRITE_CONTROL_BUTTONS_MSG_TYPE,
        msg_name: 'WRITE_CONTROL_BUTTONS',
        data_type: DataType.COMMAND,
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
    {
        msg_type: DEVICE_HEART_BEAT_MSG_TYPE,
        msg_name: 'DEVICE_HEART_BEAT',
        data_type: DataType.COMMAND,
        size_bytes: 1,
        cfg2: 0,
    },
];
const LT_EV574_VCE_CONFIG: VceParamConfig[] = [
    // VCE_VAR
    {
        msg_type_config: {
            msg_type: 0,
            msg_name: 'READ_B_V',
            data_type: DataType.FLOAT,
            size_bytes: 4,
            cfg2: 0,
        },
        param_symbol: '$B_V',
        param_type: VceParamType.VCE_VAR,
        desc: 'Battery Voltage',
    },
    {
        msg_type_config: {
            msg_type: 1,
            msg_name: 'READ_B_C',
            data_type: DataType.FLOAT,
            size_bytes: 4,
            cfg2: 0,
        },
        param_symbol: '$B_C',
        param_type: VceParamType.VCE_VAR,
        desc: 'Battery Current',
    },
    {
        msg_type_config: {
            msg_type: 2,
            msg_name: 'READ_B_P',
            data_type: DataType.FLOAT,
            size_bytes: 4,
            cfg2: 0,
        },
        param_symbol: '$B_P',
        param_type: VceParamType.VCE_VAR,
        desc: 'Battery Power',
    },
    {
        msg_type_config: {
            msg_type: 3,
            msg_name: 'READ_W_S',
            data_type: DataType.FLOAT,
            size_bytes: 4,
            cfg2: 0,
        },
        param_symbol: '$W_S',
        param_type: VceParamType.VCE_VAR,
        desc: 'Wheel Speed',
    },
    {
        msg_type_config: {
            msg_type: 4,
            msg_name: 'READ_M_P',
            data_type: DataType.FLOAT,
            size_bytes: 4,
            cfg2: 0,
        },
        param_symbol: '$M_P',
        param_type: VceParamType.VCE_VAR,
        desc: 'Mechanical Power',
    },
];
const DEVICE_SERIES: CHXSeries[] = [
    {
        series_name: 'time [s] - M_P [W]',
        x_param: -1,
        y_param: 4,
    },
    {
        series_name: 'time [s] - B_P [W]',
        x_param: -1,
        y_param: 2,
    },
    {
        series_name: 'time [s] - B_C [A]',
        x_param: -1,
        y_param: 1,
    },
];
const DEVICE_CPS: CHXComputedParam[] = [
    { param_name: 'M_T', expr: '$M_P / $W_S', msg_type: 16 },
];

let serial_adapter: SerialAdapter | null = null;
let main_window: BrowserWindow | null = null;
let lt_ev574_vce0: VirtualComputeEngine | null = null;

ipcMain.handle(`${DEVICE_MODEL}_get_device_config`, () => [...LT_EV574_DRIVER_CONFIG, ...(lt_ev574_vce0?.get_cps_config() ?? [])]);
ipcMain.handle(`${DEVICE_MODEL}_get_device_cmd_help`, () => LT_EV574_DEVICE_CMD_HELP);
ipcMain.handle(`${DEVICE_MODEL}_get_vce_config`, () => LT_EV574_VCE_CONFIG);

ipcMain.handle(`${DEVICE_MODEL}_get_chx_cps`, () => [...DEVICE_CPS, ...get_chx_cps()]);
ipcMain.handle(`${DEVICE_MODEL}_get_chx_series`, () => [...DEVICE_SERIES, ...get_chx_series()]);
ipcMain.handle(`${DEVICE_MODEL}_get_chx_eqs`, () => get_chx_eqs());
ipcMain.handle(`${DEVICE_MODEL}_get_chx_scripts`, () => get_chx_scripts());

function mw_logger(log_msg: LogMsg) {
    main_window?.webContents.send('add_sys_log', log_msg);
}

function mw_ipc_handler(channel: string, data: any) {
    main_window?.webContents.send(channel, data);

    if (channel === `${DEVICE_MODEL}_device_msg`) {
        const device_msg: DeviceMsg = data.device_msg;
        if (device_msg.config.msg_type < 16)
            lt_ev574_vce0?.load_device_msg(data.device_msg);
    }
}

const MAX_CONTROL_BUTTONS = 63 // the maximum value for 1 byte
const LT_EV574_DEVICE_CMD_HELP: string[] = [
    '=======================================================================================================',
    'SET CONTROL_BUTTONS <value>, Alias: SCB <value> | Control Device Control_BUTTONS, 0 <= value <= 63',
    '=======================================================================================================',
];
function lt_ev574_cmd_exec(cmd: string) {
    const CMD_ALIAS_LIST: Record<string, string[]> = {
        'SCB': ['SET', 'CONTROL_BUTTONS'],
    };
    let cmd_parts = cmd.split(' ');
    const cmd_part_1 = cmd_parts[0];
    if (cmd_part_1 in CMD_ALIAS_LIST)
        cmd_parts = [...CMD_ALIAS_LIST[cmd_part_1], ...cmd_parts.slice(1)];

    if (cmd_parts.length !== 3) {
        mw_logger({ level: 'ERROR', msg: 'Invalid Device Command, Type HELP to List Device Commands' });
        return;
    }
    const new_set_val = Number(cmd_parts[2]);
    if (cmd_parts[0] === 'SET' && cmd_parts[1] === 'CONTROL_BUTTONS' && !isNaN(new_set_val)) {
        if (!(new_set_val >= 0 && new_set_val <= MAX_CONTROL_BUTTONS)) {
            mw_logger({ level: 'ERROR', msg: `Invalid CONTROL_BUTTONS Value: 0 <= value <= ${MAX_CONTROL_BUTTONS}` });
            return;
        }
        serial_adapter?.send_packet(WRITE_CONTROL_BUTTONS_MSG_TYPE, new_set_val);
        mw_logger({ level: 'DEBUG', msg: `Set Control Buttons State: ${new_set_val}` });
        return;
    }
    mw_logger({ level: 'ERROR', msg: 'Invalid Device Command, Type HELP to List Device Commands' });
}

export function init_lt_ev574_serial_adapter(_main_window: BrowserWindow) {
    main_window = _main_window;

    ipcMain.on(`${DEVICE_MODEL}_serial_port_connect`, (_, data) => {
        const { port_name } = data;
        serial_adapter = new SerialAdapter(port_name, new LtdDriver([0x10, 0xA0], LT_EV574_DRIVER_CONFIG), DEVICE_ERROR_MSG_TYPE, DEVICE_ERROR_MSG_MAP, mw_ipc_handler, mw_logger, DEVICE_MODEL);
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
        lt_ev574_cmd_exec(cmd);
    });

    ipcMain.on(`${DEVICE_MODEL}_serial_port_scan`, () => SerialAdapter.scan_ports(true, DEVICE_MODEL, mw_ipc_handler, mw_logger));
    SerialAdapter.scan_ports(true, DEVICE_MODEL, mw_ipc_handler, mw_logger);

    lt_ev574_vce0 = new VirtualComputeEngine(LT_EV574_VCE_CONFIG, [...DEVICE_CPS, ...get_chx_cps()], mw_ipc_handler, DEVICE_MODEL);

    main_window?.webContents.send(`${DEVICE_MODEL}_device_config_ready`);
    mw_logger({ level: 'INFO', msg: `Loaded Device Drivers: ${DEVICE_MODEL}` });

    // device heart beat signal
    setInterval(() => {
        if (!serial_adapter)
            return;

        if (!serial_adapter.is_connected)
            return;

        serial_adapter.send_packet(DEVICE_HEART_BEAT_MSG_TYPE, 0);

    }, 1000);
}