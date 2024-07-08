import { ipcMain, BrowserWindow } from "electron";
import { SerialAdapter } from "./serial_adapter";
import { LtdDriver } from "./ltd_driver";
import { DataType, MsgTypeConfig, LogMsg, VceParamConfig, VceParamType, CHXComputedParam, CHXEquation, CHXScript, LT_HT103_DeviceConfig, LT_HT103_DeviceOperationMode, _ToastMessageOptions } from '../../common/models';
import { VirtualComputeEngine } from '../vce';
import { subscribe } from '../../common/mediator';
//@ts-ignore
import { DeviceMsg } from '../../common/models';
//@ts-ignore
import { get_chx_cps, get_chx_device_confg } from "../system_settings";

const DEVICE_MODEL = 'LT-HT103';
const DEVICE_ERROR_MSG_TYPE = 14;
const WRITE_P_HEATER_MSG_TYPE = 12;
const WRITE_P_PELTIER_MSG_TYPE = 13;
// const HEART_BEAT_MSG_TYPE = 15;
const DEVICE_ERROR_MSG_MAP: Record<number, string> = {
    0xF0: 'Temperature {T_Ambient} OTP',
    0xF1: 'Temperature {T1} OTP',
    0xF2: 'Temperature {T2} OTP',
    0xF3: 'Temperature {T_Cooling} OTP',
    0xF4: 'Temperature {T_Heater} OTP',
    0xF5: 'Constant Power {P_Heater} OPP',
    0xF6: 'Constant Power {P_Peltier} OPP',
    0x0F: 'Setpoint value out of range',
    0xFF: 'Invalid Packet',
};
const DEVICE_OP_MODE_CPS_MAP: Record<LT_HT103_DeviceOperationMode, CHXComputedParam[]> = {
    [LT_HT103_DeviceOperationMode.CALIBRATION]: [
        { param_name: 'Delta_T', expr: '$T1 - $T2' },
        { param_name: 'Q_L', expr: '$C_f * ($T_h - $T_amb)' },
        { param_name: 'Q_Cond', expr: '$P_H - ($C_f * ($T_h - $T_amb))' }, // $P_H - $Q_L
        { param_name: 'Lambda', expr: '1E-4 * Math.PI * 1E-3 * $L * ($P_H - ($C_f * ($T_h - $T_amb)))' }, // 1E-4 * Pi * 1E-3 * L * Q_Cond
    ],
    [LT_HT103_DeviceOperationMode.EXPERIMENT]: [
        { param_name: 'Delta_T', expr: '$T1 - $T2' },
        { param_name: 'Q_L', expr: '$Q_L_F1 + $Q_L_F2 * $T_h' },
        { param_name: 'Q_Cond', expr: '$P_H - ($Q_L_F1 + $Q_L_F2 * $T_h)' },
        { param_name: 'Lambda', expr: '1E-4 * Math.PI * 1E-3 * $L * ($P_H - ($Q_L_F1 + $Q_L_F2 * $T_h))' }, // 1E-4 * Pi * 1E-3 * L * Q_Cond
    ],
};
const DEVICE_OP_MODE_LBL_MAP: Record<LT_HT103_DeviceOperationMode, string> = {
    [LT_HT103_DeviceOperationMode.CALIBRATION]: 'CALIBRATION',
    [LT_HT103_DeviceOperationMode.EXPERIMENT]: 'EXPERIMENT',
};
const LT_HT103_DRIVER_CONFIG: MsgTypeConfig[] = [
    {
        msg_type: 0,
        msg_name: 'READ_T1',
        data_type: DataType.FLOAT,
        size_bytes: 4,
    },
    {
        msg_type: 1,
        msg_name: 'READ_T2',
        data_type: DataType.FLOAT,
        size_bytes: 4,
    },
    {
        msg_type: 2,
        msg_name: 'READ_T_amb',
        data_type: DataType.FLOAT,
        size_bytes: 4,
    },
    {
        msg_type: 3,
        msg_name: 'READ_T_c',
        data_type: DataType.FLOAT,
        size_bytes: 4,
    },
    {
        msg_type: 4,
        msg_name: 'READ_T_h',
        data_type: DataType.FLOAT,
        size_bytes: 4,
    },
    {
        msg_type: 5,
        msg_name: 'P_HEATER',
        data_type: DataType.FLOAT,
        size_bytes: 4,
    },
    {
        msg_type: 6,
        msg_name: 'P_PELTIER',
        data_type: DataType.FLOAT,
        size_bytes: 4,
    },
    {
        msg_type: 12,
        msg_name: 'WRITE_P_HEATER',
        data_type: DataType.FLOAT,
        size_bytes: 4,
    },
    {
        msg_type: 13,
        msg_name: 'WRITE_P_PELTIER',
        data_type: DataType.FLOAT,
        size_bytes: 4,
    },
    {
        msg_type: DEVICE_ERROR_MSG_TYPE,
        msg_name: 'DEVICE_ERROR',
        data_type: DataType.UINT,
        size_bytes: 1,
    },
];
const LT_HT103_VCE_CONFIG: VceParamConfig[] = [
    // VCE_VAR
    {
        msg_type_config: {
            msg_type: 0,
            msg_name: 'READ_T1',
            data_type: DataType.FLOAT,
            size_bytes: 4,
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
        },
        param_symbol: '$T2',
        param_type: VceParamType.VCE_VAR,
        desc: 'Temprature Sensor 2',
    },
    {
        msg_type_config: {
            msg_type: 2,
            msg_name: 'READ_T_amb',
            data_type: DataType.FLOAT,
            size_bytes: 4,
        },
        param_symbol: '$T_amb',
        param_type: VceParamType.VCE_VAR,
        desc: 'Ambient Temprature',
    },
    {
        msg_type_config: {
            msg_type: 3,
            msg_name: 'READ_T_c',
            data_type: DataType.FLOAT,
            size_bytes: 4,
        },
        param_symbol: '$T_c',
        param_type: VceParamType.VCE_VAR,
        desc: 'Cooler Temprature',
    },
    {
        msg_type_config: {
            msg_type: 4,
            msg_name: 'READ_T_h',
            data_type: DataType.FLOAT,
            size_bytes: 4,
        },
        param_symbol: '$T_h',
        param_type: VceParamType.VCE_VAR,
        desc: 'Heater Temprature',
    },
    // VCE_CONST
    {
        msg_type_config: {
            msg_type: 5,
            msg_name: 'P_HEATER',
            data_type: DataType.FLOAT,
            size_bytes: 4,
        },
        param_symbol: '$P_H',
        param_type: VceParamType.VCE_CONST,
        const_init_value: 0,
        desc: 'Heater Electrical Power',
    },
    {
        msg_type_config: {
            msg_type: 6,
            msg_name: 'P_PELTIER',
            data_type: DataType.FLOAT,
            size_bytes: 4,
        },
        param_symbol: '$P_P',
        param_type: VceParamType.VCE_CONST,
        const_init_value: 0,
        desc: 'Peltier Electrical Power',
    },
    // VCE_CONST - NON-ECHO
    {
        msg_type_config: {
            msg_type: -1,
            msg_name: 'L',
            data_type: DataType.FLOAT,
            size_bytes: 4,
        },
        param_symbol: '$L',
        param_type: VceParamType.VCE_CONST,
        const_init_value: 0,
        desc: 'Sample Length',
    },
    {
        msg_type_config: {
            msg_type: -1,
            msg_name: 'C_f',
            data_type: DataType.FLOAT,
            size_bytes: 4,
        },
        param_symbol: '$C_f',
        param_type: VceParamType.VCE_CONST,
        desc: 'Correction Factor',
    },
    {
        msg_type_config: {
            msg_type: -1,
            msg_name: 'Q_L_F1',
            data_type: DataType.FLOAT,
            size_bytes: 4,
        },
        param_symbol: '$Q_L_F1',
        param_type: VceParamType.VCE_CONST,
        desc: 'Loss Linear Model Parameter 1',
    },
    {
        msg_type_config: {
            msg_type: -1,
            msg_name: 'Q_L_F2',
            data_type: DataType.FLOAT,
            size_bytes: 4,
        },
        param_symbol: '$Q_L_F2',
        param_type: VceParamType.VCE_CONST,
        desc: 'Loss Linear Model Parameter 2',
    },
];

let device_op_mode: LT_HT103_DeviceOperationMode = LT_HT103_DeviceOperationMode.CALIBRATION;
let serial_adapter: SerialAdapter | null = null;
let main_window: BrowserWindow | null = null;
let lt_ht103_vce0: VirtualComputeEngine | null = null;
let device_config: LT_HT103_DeviceConfig | null = null;

ipcMain.handle(`${DEVICE_MODEL}_get_device_config`, () => [...LT_HT103_DRIVER_CONFIG, ...(lt_ht103_vce0?.get_cps_config() ?? [])]);
ipcMain.handle(`${DEVICE_MODEL}_get_device_cmd_help`, () => LT_HT103_DEVICE_CMD_HELP);
ipcMain.handle(`${DEVICE_MODEL}_get_vce_config`, () => LT_HT103_VCE_CONFIG);
ipcMain.handle('compute_chx_equation', (_, chx_equation: CHXEquation, args_vals: number[]) => VirtualComputeEngine.compute_chx_equation(chx_equation, args_vals));
ipcMain.handle('exec_chx_script', async (_, data_points: Record<string, number>[], _script: CHXScript) => await VirtualComputeEngine.exec_chx_script(data_points, _script));

function load_vce_settings_symbols() {
    if (!lt_ht103_vce0)
        return;

    if (!device_config)
        device_config = get_chx_device_confg() as LT_HT103_DeviceConfig;

    lt_ht103_vce0.load_symbol('$C_f', device_config.C_f);
    lt_ht103_vce0.load_symbol('$Q_L_F1', device_config.Q_L_F1);
    lt_ht103_vce0.load_symbol('$Q_L_F2', device_config.Q_L_F2);
}

function mw_logger(log_msg: LogMsg) {
    main_window?.webContents.send('add_sys_log', log_msg);
}

function mw_ipc_handler(channel: string, data: any) {
    main_window?.webContents.send(channel, data);
    // inject primitive MsgTypes in the VCE: 16>0b1111 (msg_type bits)
    // console.log(`${channel} -> ${JSON.stringify(data)}`);
    const device_msg: DeviceMsg = data.device_msg;
    if (channel === `${DEVICE_MODEL}_device_msg` && device_msg.config.msg_type < 16)
        lt_ht103_vce0?.load_device_msg(data.device_msg);
}

const LT_HT103_DEVICE_CMD_HELP: string[] = [
    '=======================================================================================================',
    'SET P_HEATER <value>, Alias: SH <value>  | Control Device P_HEATER, 0 <= value <= 30',
    'SET P_PELTIER <value>, Alias: SP <value> | Control Device P_PELTIER, 0 <= value <= 120',
    '=======================================================================================================',
];

function lt_ht103_cmd_exec(cmd: string) {
    const CMD_ALIAS_LIST: Record<string, string[]> = {
        'SH': ['SET', 'P_HEATER'],
        'SP': ['SET', 'P_PELTIER'],
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
        if (!(new_set_val >= 0 && new_set_val <= 30)) {
            mw_logger({ level: 'ERROR', msg: 'Invalid P_HEATER Value: 0 <= value <= 30' });
            return;
        }
        serial_adapter?.send_packet(WRITE_P_HEATER_MSG_TYPE, new_set_val);
        return;
    }

    if (cmd_parts[0] === 'SET' && cmd_parts[1] === 'P_PELTIER' && !isNaN(new_set_val)) {
        if (!(new_set_val >= 0 && new_set_val <= 120)) {
            mw_logger({ level: 'ERROR', msg: 'Invalid P_PELTIER Value: 0 <= value <= 120' });
            return;
        }
        serial_adapter?.send_packet(WRITE_P_PELTIER_MSG_TYPE, new_set_val);
        return;
    }

    mw_logger({ level: 'ERROR', msg: 'Invalid Device Command, Type HELP to List Device Commands' });
}

export function init_lt_ht103_serial_adapter(_main_window: BrowserWindow) {
    main_window = _main_window;

    ipcMain.on(`${DEVICE_MODEL}_serial_port_connect`, (_, data) => {
        const { port_name } = data;
        serial_adapter = new SerialAdapter(port_name, new LtdDriver([0x13, 0x13], LT_HT103_DRIVER_CONFIG), DEVICE_ERROR_MSG_TYPE, DEVICE_ERROR_MSG_MAP, mw_ipc_handler, mw_logger, DEVICE_MODEL);
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
        lt_ht103_cmd_exec(cmd);
    });

    ipcMain.on(`${DEVICE_MODEL}_switch_device_op_mode`, (_, data) => {
        const _device_op_mode: LT_HT103_DeviceOperationMode = data._device_op_mode;
        if (device_op_mode === _device_op_mode)
            return;

        device_op_mode = _device_op_mode;
        lt_ht103_vce0 = new VirtualComputeEngine(LT_HT103_VCE_CONFIG, [...DEVICE_OP_MODE_CPS_MAP[device_op_mode], ...get_chx_cps()], mw_ipc_handler, DEVICE_MODEL);
        load_vce_settings_symbols();
        main_window?.webContents.send(`${DEVICE_MODEL}_device_config_ready`);
        const notif: _ToastMessageOptions = {
            severity: 'info',
            summary: 'Device Mode Switch',
            detail: 'Device Mode Changed To: ' + DEVICE_OP_MODE_LBL_MAP[device_op_mode],
            life: 3000,
        };
        main_window?.webContents.send('show_system_notif', { notif });
    });

    ipcMain.on(`${DEVICE_MODEL}_set_device_config`, (_, data) => {
        if (!device_config)
            device_config = get_chx_device_confg() as LT_HT103_DeviceConfig;
        const { config_name, config_value } = data;
        device_config[config_name] = config_value;
    });

    ipcMain.on(`${DEVICE_MODEL}_serial_port_scan`, () => SerialAdapter.scan_ports(true, DEVICE_MODEL, mw_ipc_handler, mw_logger));
    SerialAdapter.scan_ports(true, DEVICE_MODEL, mw_ipc_handler, mw_logger);

    // load VCE module with auto HMR
    lt_ht103_vce0 = new VirtualComputeEngine(LT_HT103_VCE_CONFIG, [...DEVICE_OP_MODE_CPS_MAP[device_op_mode], ...get_chx_cps()], mw_ipc_handler, DEVICE_MODEL);
    load_vce_settings_symbols();
    subscribe('chx_cps_change', `${DEVICE_MODEL}_chx_cps_change`, args => {
        const _chx_cps: CHXComputedParam[] = [...DEVICE_OP_MODE_CPS_MAP[device_op_mode], ...args._chx_cps];
        lt_ht103_vce0 = new VirtualComputeEngine(LT_HT103_VCE_CONFIG, _chx_cps, mw_ipc_handler, DEVICE_MODEL);
        load_vce_settings_symbols();
        main_window?.webContents.send(`${DEVICE_MODEL}_device_config_ready`);
    });

    main_window?.webContents.send(`${DEVICE_MODEL}_device_config_ready`);
    mw_logger({ level: 'INFO', msg: `Loaded Device Drivers: ${DEVICE_MODEL}` });
}