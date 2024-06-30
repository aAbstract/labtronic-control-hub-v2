import { ipcMain, BrowserWindow } from "electron";
import { SerialAdapter } from "./serial_adapter";
import { LtdDriver_0x87 } from "./ltd_driver_0x87";
import { DataType, MsgTypeConfig, LogMsg, VceParamConfig, VceParamType, CHXComputedParam, CHXEquation } from '../../common/models';
import { VirtualComputeEngine } from '../vce';
import { subscribe } from '../../common/mediator';
//@ts-ignore
import { DeviceMsg } from '../../common/models';
//@ts-ignore
import { get_chx_cps } from "../system_settings";

const DEVICE_MODEL = 'LT-CH000';
const DEVICE_ERROR_MSG_TYPE = 14;
const WRITE_RESET_SCALE_MSG_TYPE = 15;
const WRITE_PISTON_PUMP_MSG_TYPE = 12;
const WRITE_PERISTALTIC_PUMP_MSG_TYPE = 13;
const DEVICE_ERROR_MSG_MAP: Record<number, string> = {
    0xF0: 'Low Liquid in the tank',
    0xF1: 'Stepper Motor Failed',
    0xF2: 'Pressure Sensor Failed',
    0xF3: 'Weight Meter Failed',
    0xF4: 'Invalid Packet',
    0xF5: 'Peristaltic Pump Failed',
};
const LT_CH000_DRIVER_CONFIG: MsgTypeConfig[] = [
    {
        msg_type: 0,
        msg_name: 'PISTON_PUMP',
        data_type: DataType.UINT,
        size_bytes: 4,
    },
    {
        msg_type: 1,
        msg_name: 'PERISTALTIC_PUMP',
        data_type: DataType.UINT,
        size_bytes: 1,
    },
    {
        msg_type: 2,
        msg_name: 'READ_WEIGHT',
        data_type: DataType.FLOAT,
        size_bytes: 4,
    },
    {
        msg_type: 3,
        msg_name: 'READ_TEMPERATURE',
        data_type: DataType.FLOAT,
        size_bytes: 4,
    },
    {
        msg_type: 4,
        msg_name: 'READ_PRESSURE',
        data_type: DataType.FLOAT,
        size_bytes: 4,
    },
    {
        msg_type: WRITE_PISTON_PUMP_MSG_TYPE,
        msg_name: 'WRITE_PISTON_PUMP',
        data_type: DataType.UINT,
        size_bytes: 4,
    },
    {
        msg_type: WRITE_PERISTALTIC_PUMP_MSG_TYPE,
        msg_name: 'WRITE_PERISTALTIC_PUMP',
        data_type: DataType.UINT,
        size_bytes: 1,
    },
    {
        msg_type: WRITE_RESET_SCALE_MSG_TYPE,
        msg_name: 'WRITE_RESET_SCALE',
        data_type: DataType.COMMAND,
        size_bytes: 1,
    },
    {
        msg_type: DEVICE_ERROR_MSG_TYPE,
        msg_name: 'DEVICE_ERROR',
        data_type: DataType.UINT,
        size_bytes: 1,
    },
];

// main -> renderer ipc signals
//      [x] `${DEVICE_MODEL}_device_connected`
//      [x] `${DEVICE_MODEL}_device_disconnected`
//      [x] `${DEVICE_MODEL}_device_msg`
//      [x] `${DEVICE_MODEL}_device_error`
// renderer -> main ipc signals
//      [x] `${DEVICE_MODEL}_get_device_config`
//      [x] `${DEVICE_MODEL}_get_device_cmd_help`
//      [x] `${DEVICE_MODEL}_serial_port_connect`
//      [x] `${DEVICE_MODEL}_serial_port_disconnect`
//      [x] `${DEVICE_MODEL}_exec_device_cmd`
//      [x] `${DEVICE_MODEL}_serial_port_scan`

const LT_CH000_DEVICE_CMD_HELP: string[] = [
    '=======================================================================================================',
    'CALIBRATE, Alias: CAB                           | Calibrates Device Scale',
    'SET PISTON_PUMP <value>, Alias: SI <value>      | Control Device PISTON_PUMP, 0 <= value <= 200',
    'SET PERISTALTIC_PUMP <value>, Alias: SE <value> | Control Device PERISTALTIC_PUMP, value = [0, 1, 2, 3]',
    'RECOVER, Alias: RV                              | Reover from Device Error',
    'ALARM, Alias: AL                                | Turn off Device Alarm',
    '=======================================================================================================',
];

const LT_CH000_VCE_CONFIG: VceParamConfig[] = [
    {
        msg_type_config: {
            msg_type: 0,
            msg_name: 'PISTON_PUMP',
            data_type: DataType.UINT,
            size_bytes: 4,
        },
        param_symbol: '$I',
        param_type: VceParamType.VCE_CONST,
        const_init_value: 1,
        desc: 'Current Piston Pump Control Parameter',
    },
    {
        msg_type_config: {
            msg_type: 1,
            msg_name: 'PERISTALTIC_PUMP',
            data_type: DataType.UINT,
            size_bytes: 1,
        },
        param_symbol: '$E',
        param_type: VceParamType.VCE_CONST,
        const_init_value: 1,
        desc: 'Current Peristaltic Pump Control Parameter',
    },
    {
        msg_type_config: {
            msg_type: 2,
            msg_name: 'READ_WEIGHT',
            data_type: DataType.FLOAT,
            size_bytes: 4,
        },
        param_symbol: '$W',
        param_type: VceParamType.VCE_VAR,
        desc: 'Weight of the Liquid in the Tank',
    },
    {
        msg_type_config: {
            msg_type: 3,
            msg_name: 'READ_TEMPERATURE',
            data_type: DataType.FLOAT,
            size_bytes: 4,
        },
        param_symbol: '$T',
        param_type: VceParamType.VCE_VAR,
        desc: 'Temperature of the Liquid in the Tank',
    },
    {
        msg_type_config: {
            msg_type: 4,
            msg_name: 'READ_PRESSURE',
            data_type: DataType.FLOAT,
            size_bytes: 4,
        },
        param_symbol: '$P',
        param_type: VceParamType.VCE_VAR,
        desc: 'Pressure of the Liquid in the Tank',
    },
];

ipcMain.handle(`${DEVICE_MODEL}_get_device_config`, () => [...LT_CH000_DRIVER_CONFIG, ...(lt_ch000_vce0?.get_cps_config() ?? [])]);
ipcMain.handle(`${DEVICE_MODEL}_get_device_cmd_help`, () => LT_CH000_DEVICE_CMD_HELP);
ipcMain.handle(`${DEVICE_MODEL}_get_vce_config`, () => LT_CH000_VCE_CONFIG);

let serial_adapter: SerialAdapter | null = null;
let main_window: BrowserWindow | null = null;
let lt_ch000_vce0: VirtualComputeEngine | null = null;

ipcMain.handle('compute_chx_equation', (_, chx_equation: CHXEquation, args_vals: number[]) => VirtualComputeEngine.compute_chx_equation(chx_equation, args_vals));

function mw_logger(log_msg: LogMsg) {
    main_window?.webContents.send('add_sys_log', log_msg);
}

function mw_ipc_handler(channel: string, data: any) {
    main_window?.webContents.send(channel, data);
    // inject primitive MsgTypes in the VCE: 16>0b1111 (msg_type bits)
    // console.log(`${channel} -> ${JSON.stringify(data)}`);
    const device_msg: DeviceMsg = data.device_msg;
    if (channel === `${DEVICE_MODEL}_device_msg` && device_msg.config.msg_type < 16)
        lt_ch000_vce0?.load_device_msg(data.device_msg);
}

function lt_ch000_cmd_exec(cmd: string) {
    const CMD_ALIAS_LIST: Record<string, string[]> = {
        'CAB': ['CALIBRATE'],
        'SI': ['SET', 'PISTON_PUMP'],
        'SE': ['SET', 'PERISTALTIC_PUMP'],
        'RV': ['RECOVER'],
        'AL': ['ALARM'], // not implemented
    };

    // substitute command alias
    let cmd_parts = cmd.split(' ');
    const cmd_part_1 = cmd_parts[0];
    if (cmd_part_1 in CMD_ALIAS_LIST)
        cmd_parts = [...CMD_ALIAS_LIST[cmd_part_1], ...cmd_parts.slice(1)];

    if (cmd_parts[0] === 'CALIBRATE') {
        serial_adapter?.send_packet(WRITE_RESET_SCALE_MSG_TYPE, 0xFF);
        return;
    }

    if (cmd_parts[0] === 'RECOVER') {
        // disconnect
        if (!serial_adapter) {
            mw_logger({ level: 'ERROR', msg: 'Undefined Serial Adapter' });
            return;
        }
        const port_name = serial_adapter.get_port_name();
        serial_adapter.disconnect();
        serial_adapter = null;

        // connect
        setTimeout(() => {
            serial_adapter = new SerialAdapter(port_name, new LtdDriver_0x87(LT_CH000_DRIVER_CONFIG), DEVICE_ERROR_MSG_TYPE, DEVICE_ERROR_MSG_MAP, mw_ipc_handler, mw_logger, DEVICE_MODEL);
            serial_adapter.connect();
        }, 1000);
        return;
    }

    if (cmd_parts.length !== 3) {
        mw_logger({ level: 'ERROR', msg: 'Invalid Device Command, Type HELP to List Device Commands' });
        return;
    }

    const new_set_val = Number(cmd_parts[2]);
    if (cmd_parts[0] === 'SET' && cmd_parts[1] === 'PISTON_PUMP' && !isNaN(new_set_val)) {
        if (!(new_set_val >= 0 && new_set_val <= 200)) {
            mw_logger({ level: 'ERROR', msg: 'Invalid PISTON_PUMP Value: 0 <= value <= 200' });
            return;
        }
        serial_adapter?.send_packet(WRITE_PISTON_PUMP_MSG_TYPE, new_set_val);
        return;
    }

    if (cmd_parts[0] === 'SET' && cmd_parts[1] === 'PERISTALTIC_PUMP' && !isNaN(new_set_val)) {
        if (![0, 1, 2, 3].includes(new_set_val)) {
            mw_logger({ level: 'ERROR', msg: 'Invalid PERISTALTIC_PUMP Value: value = [0, 1, 2, 3]' });
            return;
        }
        serial_adapter?.send_packet(WRITE_PERISTALTIC_PUMP_MSG_TYPE, new_set_val);
        return;
    }

    mw_logger({ level: 'ERROR', msg: 'Invalid Device Command, Type HELP to List Device Commands' });
}

export function init_lt_ch000_serial_adapter(_main_window: BrowserWindow) {
    main_window = _main_window;

    ipcMain.on(`${DEVICE_MODEL}_serial_port_connect`, (_, data) => {
        const { port_name } = data;
        serial_adapter = new SerialAdapter(port_name, new LtdDriver_0x87(LT_CH000_DRIVER_CONFIG), DEVICE_ERROR_MSG_TYPE, DEVICE_ERROR_MSG_MAP, mw_ipc_handler, mw_logger, DEVICE_MODEL);
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
        lt_ch000_cmd_exec(cmd);
    });

    ipcMain.on(`${DEVICE_MODEL}_serial_port_scan`, () => SerialAdapter.scan_ports(true, DEVICE_MODEL, mw_ipc_handler, mw_logger));
    SerialAdapter.scan_ports(true, DEVICE_MODEL, mw_ipc_handler, mw_logger);

    // load VCE module with auto HMR
    lt_ch000_vce0 = new VirtualComputeEngine(LT_CH000_VCE_CONFIG, get_chx_cps(), mw_ipc_handler, DEVICE_MODEL);
    subscribe('chx_cps_change', `${DEVICE_MODEL}_chx_cps_change`, args => {
        const _chx_cps: CHXComputedParam[] = args._chx_cps;
        lt_ch000_vce0 = new VirtualComputeEngine(LT_CH000_VCE_CONFIG, _chx_cps, mw_ipc_handler, DEVICE_MODEL);
        main_window?.webContents.send(`${DEVICE_MODEL}_device_config_ready`);
    });

    main_window?.webContents.send(`${DEVICE_MODEL}_device_config_ready`);
    mw_logger({ level: 'INFO', msg: `Loaded Device Drivers: ${DEVICE_MODEL}` });
}