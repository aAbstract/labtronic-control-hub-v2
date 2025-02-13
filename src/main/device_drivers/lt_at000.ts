import { ipcMain, BrowserWindow } from "electron";
import { SerialAdapter } from "./serial_adapter";
import { NC_JDM_OBD_SerialAdapter, obd_config } from "./nc_jdm_obd_serial_adapter";
import { OBDCONFIG } from "../../common/models";
import { LtdDriver } from "./ltd_driver";
import { DataType, MsgTypeConfig, LogMsg, VceParamConfig, VceParamType, _ToastMessageOptions, CHXSeries, CHXComputedParam, DeviceMsg } from '../../common/models';
import { get_chx_cps, get_chx_eqs, get_chx_scripts, get_chx_series } from "../system_settings";
import { VirtualComputeEngine } from "../vce";

const DEVICE_MODEL = 'LT-AT000';
const WRITE_DIGITAL_OUTPUTS = 8;
const DEVICE_ERROR_MSG_TYPE = 14;
const DEVICE_HEART_BEAT_MSG_TYPE = 15;

const DEVICE_ERROR_MSG_MAP: Record<number, string> = {
    0xFF: 'Invalid Packet',
};
function map_obd_config_2_lt_config(obd_config: OBDCONFIG[]): MsgTypeConfig[] {
    let mapped_configs: MsgTypeConfig[] = []
    for (const conf of obd_config) {
        mapped_configs.push({
            msg_type: conf.msg_type,
            msg_name: 'READ_' + conf.name,
            data_type: DataType.FLOAT,
            size_bytes: 4,
            cfg2: 0,
        })
    }
    return mapped_configs
}
const LT_AT000_DRIVER_CONFIG: MsgTypeConfig[] = [
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
        msg_name: 'READ_L1',
        data_type: DataType.FLOAT,
        size_bytes: 4,
        cfg2: 0,
    },
    {
        msg_type: 6,
        msg_name: 'READ_L2',
        data_type: DataType.FLOAT,
        size_bytes: 4,
        cfg2: 0,
    },
    {
        msg_type: WRITE_DIGITAL_OUTPUTS,
        msg_name: 'WRITE_DIGITAL_OUTPUTS',
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
    {
        msg_type: DEVICE_HEART_BEAT_MSG_TYPE,
        msg_name: 'DEVICE_HEART_BEAT',
        data_type: DataType.COMMAND,
        size_bytes: 1,
        cfg2: 0,
    },
];



const LT_AT000_VCE_CONFIG: VceParamConfig[] = [
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
        desc: 'Thermocouple 1',
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
        desc: 'Thermocouple 2',
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
        desc: 'Thermocouple 3',
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
        desc: 'Thermocouple 4',
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
        desc: 'Thermocouple 5',
    },
    {
        msg_type_config: {
            msg_type: 5,
            msg_name: 'READ_L1',
            data_type: DataType.FLOAT,
            size_bytes: 4,
            cfg2: 0,
        },
        param_symbol: '$L1',
        param_type: VceParamType.VCE_VAR,
        desc: 'LoadCell 1',
    },
    {
        msg_type_config: {
            msg_type: 6,
            msg_name: 'READ_L2',
            data_type: DataType.FLOAT,
            size_bytes: 4,
            cfg2: 0,
        },
        param_symbol: '$L2',
        param_type: VceParamType.VCE_VAR,
        desc: 'LoadCell 2',
    },
    
];
const DEVICE_SERIES: CHXSeries[] = [
    // {
    //     series_name: 'time [s] - T1 [C]',
    //     x_param: -1,
    //     y_param: 0,
    // },
  
];
const DEVICE_CPS: CHXComputedParam[] = [
    
];

let serial_adapter: SerialAdapter | null = null;
let nc_jdm_obd_serial_adapter: NC_JDM_OBD_SerialAdapter | null = null
let main_window: BrowserWindow | null = null;
let lt_at000_vce0: VirtualComputeEngine | null = null;

ipcMain.handle(`${DEVICE_MODEL}_get_device_config`, () => [...LT_AT000_DRIVER_CONFIG, ...(lt_at000_vce0?.get_cps_config() ?? []), ...map_obd_config_2_lt_config(obd_config)]);
ipcMain.handle(`${DEVICE_MODEL}_get_device_cmd_help`, () => LT_AT000_DEVICE_CMD_HELP);
ipcMain.handle(`${DEVICE_MODEL}_get_vce_config`, () => LT_AT000_VCE_CONFIG);

ipcMain.handle(`${DEVICE_MODEL}_get_chx_cps`, () => [...DEVICE_CPS, ...get_chx_cps()]);
ipcMain.handle(`${DEVICE_MODEL}_get_chx_series`, () => [...DEVICE_SERIES, ...get_chx_series()]);
ipcMain.handle(`${DEVICE_MODEL}_get_chx_eqs`, () => get_chx_eqs());
ipcMain.handle(`${DEVICE_MODEL}_get_chx_scripts`, () => get_chx_scripts());



ipcMain.handle(`${DEVICE_MODEL}_get_obd_congis`,()=>obd_config)
function mw_logger(log_msg: LogMsg) {
    main_window?.webContents.send('add_sys_log', log_msg);
}

function mw_ipc_handler(channel: string, data: any) {
    main_window?.webContents.send(channel, data);

    if (channel === `${DEVICE_MODEL}_device_msg`) {
        const device_msg: DeviceMsg = data.device_msg;
        if (device_msg.config.msg_type < 16)
            lt_at000_vce0?.load_device_msg(data.device_msg);
    }
}

const LT_AT000_DEVICE_CMD_HELP: string[] = [
    '=======================================================================================================',
    'SET OUTREG <value>, Alias: SDO <value> | Control Device Control_BUTTONS, 0 <= value <= 63',
    '=======================================================================================================',
];
function lt_at000_cmd_exec(cmd: string) {
    const CMD_ALIAS_LIST: Record<string, string[]> = {
        'SCB': ['SET', 'OUTREG'],
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
    if (cmd_parts[0] === 'SET' && cmd_parts[1] === 'OUTREG' && !isNaN(new_set_val)) {
        serial_adapter?.send_packet(WRITE_DIGITAL_OUTPUTS, new_set_val);
        mw_logger({ level: 'DEBUG', msg: `Set Control Buttons State: ${new_set_val}` });
        return;
    }
    mw_logger({ level: 'ERROR', msg: 'Invalid Device Command, Type HELP to List Device Commands' });
}


export function init_lt_at000_serial_adapter(_main_window: BrowserWindow) {

    main_window = _main_window;

    ipcMain.on(`${DEVICE_MODEL}_serial_port_connect`, async(_, data) => {
        const { port_name } = data;
        serial_adapter = new SerialAdapter(port_name, new LtdDriver([0xA0, 0xA0], LT_AT000_DRIVER_CONFIG), DEVICE_ERROR_MSG_TYPE, DEVICE_ERROR_MSG_MAP, mw_ipc_handler, mw_logger, DEVICE_MODEL);
        serial_adapter.connect();
            scan_connect_obd()
    });

    ipcMain.on(`${DEVICE_MODEL}_serial_port_disconnect`, () => {
        OBD_serial_port_disconnect()
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
        lt_at000_cmd_exec(cmd);
    });

    ipcMain.on(`${DEVICE_MODEL}_serial_port_scan`, () => SerialAdapter.scan_ports(true, DEVICE_MODEL, mw_ipc_handler, mw_logger));
    SerialAdapter.scan_ports(true, DEVICE_MODEL, mw_ipc_handler, mw_logger);


    lt_at000_vce0 = new VirtualComputeEngine(LT_AT000_VCE_CONFIG, [...DEVICE_CPS, ...get_chx_cps()], mw_ipc_handler, DEVICE_MODEL);

    main_window?.webContents.send(`${DEVICE_MODEL}_device_config_ready`);
    mw_logger({ level: 'INFO', msg: `Loaded Device Drivers: ${DEVICE_MODEL}` });

    //device heart beat signal
    setInterval(() => {
        if (!serial_adapter)
            return;

        if (!serial_adapter.is_connected)
            return;

        serial_adapter.send_packet(DEVICE_HEART_BEAT_MSG_TYPE, 0);

    }, 1000);





    ipcMain.on(`${DEVICE_MODEL}_OBD_serial_port_scan`, () => NC_JDM_OBD_SerialAdapter.scan_ports(true, DEVICE_MODEL, mw_ipc_handler, mw_logger));
    ipcMain.on(`${DEVICE_MODEL}_OBD_serial_port_connect`, (_, data) => {
        const { port_name } = data;
        nc_jdm_obd_serial_adapter = new NC_JDM_OBD_SerialAdapter(port_name, mw_ipc_handler, mw_logger, DEVICE_MODEL);
        nc_jdm_obd_serial_adapter.connect();
    });

    ipcMain.on(`${DEVICE_MODEL}_OBD_serial_port_disconnect`, () => {
        if (!nc_jdm_obd_serial_adapter)
            return;
        nc_jdm_obd_serial_adapter.disconnect();
        nc_jdm_obd_serial_adapter = null;
    });

   
    // device heart beat signal
    setInterval(() => {
        if (!serial_adapter)
            return;

        if (!serial_adapter.is_connected)
            return;

        serial_adapter.send_packet(DEVICE_HEART_BEAT_MSG_TYPE, 0);

    }, 1000);
    req_nc_jdm_obd_param()

}

async function req_nc_jdm_obd_param() {
    if (nc_jdm_obd_serial_adapter)
        await nc_jdm_obd_serial_adapter.loop_commands()
    setTimeout(req_nc_jdm_obd_param, 1000)

}

async function scan_connect_obd(){
    const port = await NC_JDM_OBD_SerialAdapter.scan_ports(false, DEVICE_MODEL, mw_ipc_handler, mw_logger)
    if (port.ok){
        nc_jdm_obd_serial_adapter = new NC_JDM_OBD_SerialAdapter(port.ok, mw_ipc_handler, mw_logger, DEVICE_MODEL);
        nc_jdm_obd_serial_adapter.connect();
    }
    else{
        mw_logger({level:'ERROR',msg:JSON.stringify(port)})
    }

}

function OBD_serial_port_disconnect(){
    if (!nc_jdm_obd_serial_adapter)
        return;
    nc_jdm_obd_serial_adapter.disconnect();
    nc_jdm_obd_serial_adapter = null;
}