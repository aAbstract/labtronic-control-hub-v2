import { ipcMain, BrowserWindow } from "electron";
import { SerialAdapter } from "./serial_adapter";
import { LtdDriver } from "./ltd_driver";
import { DataType, MsgTypeConfig, LogMsg, VceParamConfig, VceParamType, _ToastMessageOptions, LT_HT107_DeviceMode } from '../../common/models';
import { DeviceMsg } from '../../common/models';

const DEVICE_MODEL = 'LT-HT107';
const DEVICE_ERROR_MSG_TYPE = 14;
const WRITE_P_HEATER_MSG_TYPE = 12;
// const HEART_BEAT_MSG_TYPE = 15;
const DEVICE_MODE_LBL_MAP: Record<LT_HT107_DeviceMode, string> = {
    [LT_HT107_DeviceMode.LINEAR]: 'LINEAR',
    [LT_HT107_DeviceMode.RADIAL]: 'RADIAL',
};
const DEVICE_ERROR_MSG_MAP: Record<number, string> = {
    0xF1: 'Temperature {T1} OTP',
    0xF2: 'Temperature {T2} OTP',
    0xF3: 'Temperature {T3} OTP',
    0xF4: 'Temperature {T4} OTP',
    0xF5: 'Temperature {T5} OTP',
    0xF6: 'Temperature {T6} OTP',
    0xF7: 'Temperature {T7} OTP',
    0xF8: 'Temperature {T8} OTP',
    0xF9: 'Temperature {T9} OTP',
    0xFA: 'Temperature {T_Heater} OTP',
    0xFB: 'Constant Power {P_Heater} OPP',
    0xFC: 'Module is not connected, Please check the connection',
    0x0F: 'Setpoint value out of range',
    0xFF: 'Invalid Packet',
};
const LT_HT107_DRIVER_CONFIG: MsgTypeConfig[] = [
    {
        msg_type: 0,
        msg_name: 'READ_T1',
        data_type: DataType.FLOAT,
        size_bytes: 4,
        cfg2: 0,
    },
    {
        msg_type: 1,
        msg_name: 'READ_T2',
        data_type: DataType.FLOAT,
        size_bytes: 4,
        cfg2: 0,
    },
    {
        msg_type: 2,
        msg_name: 'READ_T3',
        data_type: DataType.FLOAT,
        size_bytes: 4,
        cfg2: 0,
    },
    {
        msg_type: 3,
        msg_name: 'READ_T4',
        data_type: DataType.FLOAT,
        size_bytes: 4,
        cfg2: 0,
    },
    {
        msg_type: 4,
        msg_name: 'READ_T5',
        data_type: DataType.FLOAT,
        size_bytes: 4,
        cfg2: 0,
    },
    {
        msg_type: 5,
        msg_name: 'READ_T6',
        data_type: DataType.FLOAT,
        size_bytes: 4,
        cfg2: 0,
    },
    {
        msg_type: 6,
        msg_name: 'READ_T7',
        data_type: DataType.FLOAT,
        size_bytes: 4,
        cfg2: 0,
    },
    {
        msg_type: 7,
        msg_name: 'READ_T8',
        data_type: DataType.FLOAT,
        size_bytes: 4,
        cfg2: 0,
    },
    {
        msg_type: 8,
        msg_name: 'READ_T9',
        data_type: DataType.FLOAT,
        size_bytes: 4,
        cfg2: 0,
    },
    {
        msg_type: 9,
        msg_name: 'T_H',
        data_type: DataType.FLOAT,
        size_bytes: 4,
        cfg2: 0,
    },
    {
        msg_type: 13,
        msg_name: 'P_HEATER',
        data_type: DataType.FLOAT,
        size_bytes: 4,
        cfg2: 0,
    },
    {
        msg_type: 12,
        msg_name: 'WRITE_P_HEATER',
        data_type: DataType.FLOAT,
        size_bytes: 4,
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
const LT_HT107_VCE_CONFIG: VceParamConfig[] = [
    // VCE_VAR
    {
        msg_type_config: {
            msg_type: 0,
            msg_name: 'READ_T1',
            data_type: DataType.FLOAT,
            size_bytes: 4,
            cfg2: 0,
        },
        param_symbol: '$T1',
        param_type: VceParamType.VCE_VAR,
        desc: 'Temprature Sensor 1',
    },
    {
        msg_type_config: {
            msg_type: 1,
            msg_name: 'READ_T2',
            data_type: DataType.FLOAT,
            size_bytes: 4,
            cfg2: 0,
        },
        param_symbol: '$T2',
        param_type: VceParamType.VCE_VAR,
        desc: 'Temprature Sensor 2',
    },
    {
        msg_type_config: {
            msg_type: 2,
            msg_name: 'READ_T3',
            data_type: DataType.FLOAT,
            size_bytes: 4,
            cfg2: 0,
        },
        param_symbol: '$T3',
        param_type: VceParamType.VCE_VAR,
        desc: 'Temprature Sensor 3',
    },
    {
        msg_type_config: {
            msg_type: 3,
            msg_name: 'READ_T4',
            data_type: DataType.FLOAT,
            size_bytes: 4,
            cfg2: 0,
        },
        param_symbol: '$T4',
        param_type: VceParamType.VCE_VAR,
        desc: 'Temprature Sensor 4',
    },
    {
        msg_type_config: {
            msg_type: 4,
            msg_name: 'READ_T5',
            data_type: DataType.FLOAT,
            size_bytes: 4,
            cfg2: 0,
        },
        param_symbol: '$T5',
        param_type: VceParamType.VCE_VAR,
        desc: 'Temprature Sensor 5',
    },
    {
        msg_type_config: {
            msg_type: 5,
            msg_name: 'READ_T6',
            data_type: DataType.FLOAT,
            size_bytes: 4,
            cfg2: 0,
        },
        param_symbol: '$T6',
        param_type: VceParamType.VCE_VAR,
        desc: 'Temprature Sensor 6',
    },
    {
        msg_type_config: {
            msg_type: 6,
            msg_name: 'READ_T7',
            data_type: DataType.FLOAT,
            size_bytes: 4,
            cfg2: 0,
        },
        param_symbol: '$T7',
        param_type: VceParamType.VCE_VAR,
        desc: 'Temprature Sensor 7',
    },
    {
        msg_type_config: {
            msg_type: 7,
            msg_name: 'READ_T8',
            data_type: DataType.FLOAT,
            size_bytes: 4,
            cfg2: 0,
        },
        param_symbol: '$T8',
        param_type: VceParamType.VCE_VAR,
        desc: 'Temprature Sensor 8',
    },
    {
        msg_type_config: {
            msg_type: 8,
            msg_name: 'READ_T9',
            data_type: DataType.FLOAT,
            size_bytes: 4,
            cfg2: 0,
        },
        param_symbol: '$T9',
        param_type: VceParamType.VCE_VAR,
        desc: 'Temprature Sensor 9',
    },
    {
        msg_type_config: {
            msg_type: 9,
            msg_name: 'T_H',
            data_type: DataType.FLOAT,
            size_bytes: 4,
            cfg2: 0,
        },
        param_symbol: '$T_H',
        param_type: VceParamType.VCE_VAR,
        desc: 'Heater Temprature',
    },
    // VCE_CONST
    {
        msg_type_config: {
            msg_type: 13,
            msg_name: 'P_HEATER',
            data_type: DataType.FLOAT,
            size_bytes: 4,
            cfg2: 0,
        },
        param_symbol: '$P_H',
        param_type: VceParamType.VCE_CONST,
        const_init_value: 0,
        desc: 'Heater Electrical Power',
    },
];

const switch_msg_types = new Set([6, 7, 8]);
function filter_driver_config(_driver_config: MsgTypeConfig[]): MsgTypeConfig[] {
    if (device_mode === LT_HT107_DeviceMode.LINEAR) {
        _driver_config.forEach(_conifg => _conifg.cfg2 = 0xA1)
        return _driver_config;
    }
    else if (device_mode === LT_HT107_DeviceMode.RADIAL) {
        _driver_config.forEach(_conifg => _conifg.cfg2 = 0xA2)
        return _driver_config.filter(x => !switch_msg_types.has(x.msg_type));
    }
    else { return []; }
}
function filter_vce_config(_vce_config: VceParamConfig[]): VceParamConfig[] {
    if (device_mode === LT_HT107_DeviceMode.LINEAR) {
        _vce_config.forEach(_conifg => _conifg.msg_type_config.cfg2 = 0xA1)
        return _vce_config;
    }
    else if (device_mode === LT_HT107_DeviceMode.RADIAL) {
        _vce_config.forEach(_conifg => _conifg.msg_type_config.cfg2 = 0xA2)
        return _vce_config.filter(x => !switch_msg_types.has(x.msg_type_config.msg_type));
    }
    else { return []; }
}

function device_mode_switch(new_device_mode: LT_HT107_DeviceMode) {
    if (device_mode === new_device_mode)
        return;
    device_mode = new_device_mode;
    main_window?.webContents.send(`${DEVICE_MODEL}_device_config_ready`);
    const notif: _ToastMessageOptions = {
        severity: 'info',
        summary: 'Device Mode Switch',
        detail: 'Device Mode Changed To: ' + DEVICE_MODE_LBL_MAP[device_mode],
        life: 3000,
    };
    main_window?.webContents.send('show_system_notif', { notif });
}

let device_mode: LT_HT107_DeviceMode = LT_HT107_DeviceMode.RADIAL;
let serial_adapter: SerialAdapter | null = null;
let main_window: BrowserWindow | null = null;

ipcMain.handle(`${DEVICE_MODEL}_get_device_config`, () => filter_driver_config(LT_HT107_DRIVER_CONFIG));
ipcMain.handle(`${DEVICE_MODEL}_get_device_cmd_help`, () => LT_HT107_DEVICE_CMD_HELP);
ipcMain.handle(`${DEVICE_MODEL}_get_vce_config`, () => filter_vce_config(LT_HT107_VCE_CONFIG));

function mw_logger(log_msg: LogMsg) {
    main_window?.webContents.send('add_sys_log', log_msg);
}

function mw_ipc_handler(channel: string, data: any) {
    main_window?.webContents.send(channel, data);
    if (channel === `${DEVICE_MODEL}_device_msg`) {
        const device_msg: DeviceMsg = data.device_msg;
        if (device_msg.config.cfg2 === 0xA1)
            device_mode_switch(LT_HT107_DeviceMode.LINEAR);
        else if (device_msg.config.cfg2 === 0xA2)
            device_mode_switch(LT_HT107_DeviceMode.RADIAL);
    }
}

const LT_HT107_DEVICE_CMD_HELP: string[] = [
    '=======================================================================================================',
    'SET P_HEATER <value>, Alias: SH <value>  | Control Device P_HEATER, 0 <= value <= 120',
    '=======================================================================================================',
];
function lt_ht107_cmd_exec(cmd: string) {
    const CMD_ALIAS_LIST: Record<string, string[]> = {
        'SH': ['SET', 'P_HEATER'],
    };

    // substitute command alias
    let cmd_parts = cmd.split(' ');
    const cmd_part_1 = cmd_parts[0];
    if (cmd_part_1 in CMD_ALIAS_LIST)
        cmd_parts = [...CMD_ALIAS_LIST[cmd_part_1], ...cmd_parts.slice(1)];

    if (cmd_parts.length !== 3) {
        mw_logger({ level: 'ERROR', msg: 'Invalid Device Command, Type HELP to List Device Commands' });
        return;
    }

    const new_set_val = Number(cmd_parts[2]);

    if (cmd_parts[0] === 'SET' && cmd_parts[1] === 'P_HEATER' && !isNaN(new_set_val)) {
        if (!(new_set_val >= 0 && new_set_val <= 120)) {
            mw_logger({ level: 'ERROR', msg: 'Invalid P_HEATER Value: 0 <= value <= 120' });
            return;
        }
        serial_adapter?.send_packet(WRITE_P_HEATER_MSG_TYPE, new_set_val);
        return;
    }

    mw_logger({ level: 'ERROR', msg: 'Invalid Device Command, Type HELP to List Device Commands' });
}

export function init_lt_ht107_serial_adapter(_main_window: BrowserWindow) {
    main_window = _main_window;

    ipcMain.on(`${DEVICE_MODEL}_serial_port_connect`, (_, data) => {
        const { port_name } = data;
        serial_adapter = new SerialAdapter(port_name, new LtdDriver([0x13, 0x14], LT_HT107_DRIVER_CONFIG), DEVICE_ERROR_MSG_TYPE, DEVICE_ERROR_MSG_MAP, mw_ipc_handler, mw_logger, DEVICE_MODEL);
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
        lt_ht107_cmd_exec(cmd);
    });

    ipcMain.on(`${DEVICE_MODEL}_switch_device_mode`, (_, data) => {
        const _device_mode: LT_HT107_DeviceMode = data._device_mode;
        device_mode_switch(_device_mode);
    });

    ipcMain.on(`${DEVICE_MODEL}_serial_port_scan`, () => SerialAdapter.scan_ports(true, DEVICE_MODEL, mw_ipc_handler, mw_logger));
    SerialAdapter.scan_ports(true, DEVICE_MODEL, mw_ipc_handler, mw_logger);

    main_window?.webContents.send(`${DEVICE_MODEL}_device_config_ready`);
    mw_logger({ level: 'INFO', msg: `Loaded Device Drivers: ${DEVICE_MODEL}` });
}