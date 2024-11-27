import { ipcMain, BrowserWindow } from "electron";
import { SerialAdapter } from "./serial_adapter";
import { LtdDriver } from "./ltd_driver";
import { VirtualComputeEngine } from "../vce";
import { DataType, MsgTypeConfig, VceParamConfig, VceParamType, LogMsg, LT_TO101_DeviceMode, _ToastMessageOptions, DeviceMsg, CHXComputedParam, CHXSeries } from "../../common/models";
import { get_chx_cps, get_chx_series, get_chx_eqs, get_chx_scripts } from "../system_settings";

const DEVICE_MODEL = 'LT-TO101';
const DEVICE_ERROR_MSG_TYPE = 14;
const DEVICE_MODE_LBL_MAP: Record<LT_TO101_DeviceMode, string> = {
    [LT_TO101_DeviceMode.BOYLE]: 'BOYLE',
    [LT_TO101_DeviceMode.GLUSS]: 'GLUSS',
};
const DEVICE_ERROR_MSG_MAP: Record<number, string> = {
    0xF0: 'Temperature {TC1} OTP',
    0xF1: 'Temperature {TC2} OTP',
    0xF2: 'Temperature {TC3} OTP',
    0xF3: 'Level Sensor out of range',
    0xF4: 'Pressure {PR1} out of range',
    0xF5: 'Pressure {PR2} out of range',
    0xF6: 'Pressure {PR3} out of range',
    0xFF: 'Invalid Packet',
};
const DEVICE_MODE_SERIES_MAP: Record<LT_TO101_DeviceMode, CHXSeries[]> = {
    [LT_TO101_DeviceMode.BOYLE]: [
        {
            series_name: 'L - PR1',
            x_param: 3,
            y_param: 4,
        },
        {
            series_name: 'time - P_times_V',
            x_param: -1,
            y_param: 16,
        },
    ],
    [LT_TO101_DeviceMode.GLUSS]: [
        {
            series_name: 'T_avg - PR2',
            x_param: 17,
            y_param: 5,
        },
        {
            series_name: 'time - P_over_T',
            x_param: -1,
            y_param: 18,
        },
    ],
};
const LT_TO101_DRIVER_CONFIG: MsgTypeConfig[] = [
    {
        msg_type: 0,
        msg_name: 'READ_TC1',
        data_type: DataType.FLOAT,
        size_bytes: 4,
        cfg2: 0,
    },
    {
        msg_type: 1,
        msg_name: 'READ_TC2',
        data_type: DataType.FLOAT,
        size_bytes: 4,
        cfg2: 0,
    },
    {
        msg_type: 2,
        msg_name: 'READ_TC3',
        data_type: DataType.FLOAT,
        size_bytes: 4,
        cfg2: 0,
    },
    {
        msg_type: 3,
        msg_name: 'READ_LVL',
        data_type: DataType.FLOAT,
        size_bytes: 4,
        cfg2: 0,
    },
    {
        msg_type: 4,
        msg_name: 'READ_PR1',
        data_type: DataType.FLOAT,
        size_bytes: 4,
        cfg2: 0,
    },
    {
        msg_type: 5,
        msg_name: 'READ_PR2',
        data_type: DataType.FLOAT,
        size_bytes: 4,
        cfg2: 0,
    },
    {
        msg_type: 6,
        msg_name: 'READ_PR3',
        data_type: DataType.FLOAT,
        size_bytes: 4,
        cfg2: 0,
    },
    {
        msg_type: 7,
        msg_name: 'CLS',
        data_type: DataType.UINT,
        size_bytes: 1,
        cfg2: 0,
    },
    {
        msg_type: 8,
        msg_name: 'HLS',
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

const LT_TO101_VCE_CONFIG: VceParamConfig[] = [
    // VCE VAR
    {
        msg_type_config: {
            msg_type: 0,
            msg_name: 'READ_TC1',
            data_type: DataType.FLOAT,
            size_bytes: 4,
            cfg2: 0,
        },
        param_symbol: '$TC1',
        param_type: VceParamType.VCE_VAR,
        desc: 'Thermocouple 1',
    },
    {
        msg_type_config: {
            msg_type: 1,
            msg_name: 'READ_TC2',
            data_type: DataType.FLOAT,
            size_bytes: 4,
            cfg2: 0,
        },
        param_symbol: '$TC2',
        param_type: VceParamType.VCE_VAR,
        desc: 'Thermocouple 2',
    },
    {
        msg_type_config: {
            msg_type: 2,
            msg_name: 'READ_TC3',
            data_type: DataType.FLOAT,
            size_bytes: 4,
            cfg2: 0,
        },
        param_symbol: '$TC3',
        param_type: VceParamType.VCE_VAR,
        desc: 'Thermocouple 3',
    },
    {
        msg_type_config: {
            msg_type: 3,
            msg_name: 'READ_LVL',
            data_type: DataType.FLOAT,
            size_bytes: 4,
            cfg2: 0,
        },
        param_symbol: '$LVL',
        param_type: VceParamType.VCE_VAR,
        desc: 'Level Sensor',
    },
    {
        msg_type_config: {
            msg_type: 4,
            msg_name: 'READ_PR1',
            data_type: DataType.FLOAT,
            size_bytes: 4,
            cfg2: 0,
        },
        param_symbol: '$PR1',
        param_type: VceParamType.VCE_VAR,
        desc: 'Pressure 1',
    },
    {
        msg_type_config: {
            msg_type: 5,
            msg_name: 'READ_PR2',
            data_type: DataType.FLOAT,
            size_bytes: 4,
            cfg2: 0,
        },
        param_symbol: '$PR2',
        param_type: VceParamType.VCE_VAR,
        desc: 'Pressure 2',
    },
    {
        msg_type_config: {
            msg_type: 6,
            msg_name: 'READ_PR3',
            data_type: DataType.FLOAT,
            size_bytes: 4,
            cfg2: 0,
        },
        param_symbol: '$PR3',
        param_type: VceParamType.VCE_VAR,
        desc: 'Pressure 3',
    },
    // VCE_CONST
    {
        msg_type_config: {
            msg_type: 7,
            msg_name: 'CLS',
            data_type: DataType.UINT,
            size_bytes: 1,
            cfg2: 0,
        },
        param_symbol: '$CLS',
        param_type: VceParamType.VCE_CONST,
        const_init_value: 0,
        desc: 'Compressor Led State',
    },
    {
        msg_type_config: {
            msg_type: 8,
            msg_name: 'HLS',
            data_type: DataType.UINT,
            size_bytes: 1,
            cfg2: 0,
        },
        param_symbol: '$HLS',
        param_type: VceParamType.VCE_CONST,
        const_init_value: 0,
        desc: 'Heater Led State',
    },
];
const DEVICE_MODE_CPS_MAP: Record<LT_TO101_DeviceMode, CHXComputedParam[]> = {
    [LT_TO101_DeviceMode.BOYLE]: [
        { param_name: 'P_times_V', expr: '$LVL * $PR1', unit: '[bar * L]', msg_type: 16 },
    ],
    [LT_TO101_DeviceMode.GLUSS]: [
        { param_name: 'T_avg', expr: '($TC2 + $TC3) / 2', msg_type: 17 },
        { param_name: 'P_over_T', expr: '$PR2 * 100 / (($TC2 + $TC3) / 2 + 273.15)', unit: '[Kpa / K]', msg_type: 18 },
    ],
};

function filter_driver_config(_driver_config: MsgTypeConfig[]): MsgTypeConfig[] {
    if (device_mode === LT_TO101_DeviceMode.BOYLE) {
        _driver_config.forEach(_conifg => _conifg.cfg2 = 0xA1)
        return _driver_config.filter(x => new Set([0, 4, 3]).has(x.msg_type));
    }
    else if (device_mode === LT_TO101_DeviceMode.GLUSS) {
        _driver_config.forEach(_conifg => _conifg.cfg2 = 0xA2)
        return _driver_config.filter(x => new Set([1, 2, 5]).has(x.msg_type));
    }
    else { return []; }
}

function device_mode_switch(new_device_mode: LT_TO101_DeviceMode) {
    if (device_mode === new_device_mode)
        return;
    device_mode = new_device_mode;
    lt_to101_vce0 = new VirtualComputeEngine(LT_TO101_VCE_CONFIG, [...DEVICE_MODE_CPS_MAP[device_mode]], mw_ipc_handler, DEVICE_MODEL);
    main_window?.webContents.send(`${DEVICE_MODEL}_device_config_ready`);
    const notif: _ToastMessageOptions = {
        severity: 'info',
        summary: 'Device Mode Switch',
        detail: 'Device Mode Changed To: ' + DEVICE_MODE_LBL_MAP[device_mode],
        life: 3000,
    };
    main_window?.webContents.send('show_system_notif', { notif });
}

let device_mode: LT_TO101_DeviceMode = LT_TO101_DeviceMode.GLUSS;
let serial_adapter: SerialAdapter | null = null;
let main_window: BrowserWindow | null = null;
let lt_to101_vce0: VirtualComputeEngine | null = null;

ipcMain.handle(`${DEVICE_MODEL}_get_device_config`, () => [...filter_driver_config(LT_TO101_DRIVER_CONFIG), ...(lt_to101_vce0?.get_cps_config() ?? [])]);
ipcMain.handle(`${DEVICE_MODEL}_get_device_cmd_help`, () => LT_TO101_DEVICE_CMD_HELP);
ipcMain.handle(`${DEVICE_MODEL}_get_vce_config`, () => LT_TO101_VCE_CONFIG);

ipcMain.handle(`${DEVICE_MODEL}_get_chx_cps`, () => get_chx_cps());
ipcMain.handle(`${DEVICE_MODEL}_get_chx_series`, () => [...DEVICE_MODE_SERIES_MAP[device_mode], ...get_chx_series()]);
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
            lt_to101_vce0?.load_device_msg(data.device_msg);

        if (device_msg.config.cfg2 === 0xA1)
            device_mode_switch(LT_TO101_DeviceMode.BOYLE);
        else if (device_msg.config.cfg2 === 0xA2)
            device_mode_switch(LT_TO101_DeviceMode.GLUSS);
    }
}

const LT_TO101_DEVICE_CMD_HELP: string[] = [
    '=======================================================================================================',
    '=======================================================================================================',
];
function lt_to101_cmd_exec(cmd: string) {
    console.log(`${DEVICE_MODEL} | Exec CMD: ${cmd}`);
}

export function init_lt_to101_serial_adapter(_main_window: BrowserWindow) {
    main_window = _main_window;

    ipcMain.on(`${DEVICE_MODEL}_serial_port_connect`, (_, data) => {
        const { port_name } = data;
        serial_adapter = new SerialAdapter(port_name, new LtdDriver([0x24, 0x24], LT_TO101_DRIVER_CONFIG), DEVICE_ERROR_MSG_TYPE, DEVICE_ERROR_MSG_MAP, mw_ipc_handler, mw_logger, DEVICE_MODEL);
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
        lt_to101_cmd_exec(cmd);
    });

    ipcMain.on(`${DEVICE_MODEL}_serial_port_scan`, () => SerialAdapter.scan_ports(true, DEVICE_MODEL, mw_ipc_handler, mw_logger));
    SerialAdapter.scan_ports(true, DEVICE_MODEL, mw_ipc_handler, mw_logger);

    lt_to101_vce0 = new VirtualComputeEngine(LT_TO101_VCE_CONFIG, [...DEVICE_MODE_CPS_MAP[device_mode]], mw_ipc_handler, DEVICE_MODEL);

    main_window?.webContents.send(`${DEVICE_MODEL}_device_config_ready`);
    mw_logger({ level: 'INFO', msg: `Loaded Device Drivers: ${DEVICE_MODEL}` });
}