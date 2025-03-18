import { ipcMain, BrowserWindow } from "electron";
import { SerialAdapter } from "./serial_adapter";
import { NC_JDM_OBD_SerialAdapter, obd_config } from "./nc_jdm_obd_serial_adapter";
import { OBDCONFIG } from "../../common/models";
import { LtdDriver } from "./ltd_driver";
import { DataType, MsgTypeConfig, LogMsg, VceParamConfig, VceParamType, _ToastMessageOptions, CHXSeries, CHXComputedParam, DeviceMsg, LT_AU450_DeviceConfig } from '../../common/models';
import { VirtualComputeEngine } from "../vce";
import {
    get_chx_device_confg,
    get_chx_cps,
    get_chx_scripts,
    get_chx_series,
    get_chx_eqs,
    set_chx_device_config,
    save_chx_settings
} from "../system_settings";




const DEVICE_MODEL = 'LT-AU450';
const WRITE_DIGITAL_OUTPUTS = 8;
const DEVICE_ERROR_MSG_TYPE = 14;
const DEVICE_HEART_BEAT_MSG_TYPE = 15;

const DEVICE_ERROR_MSG_MAP: Record<number, string> = {
    0xFF: 'Invalid Packet',
};
const input_consts = ["VAVG_VMAX", "CP", "R", "DO", "SG", "Q_WATER", "C_WATER", "D", "SF", "SV", "CV", "ME"]

function map_obd_config_2_lt_vce_config(obd_config: OBDCONFIG[]): VceParamConfig[] {
    let mapped_configs: VceParamConfig[] = []
    for (const conf of obd_config) {
        mapped_configs.push({
            msg_type_config: {
                msg_type: conf.msg_type,
                msg_name: 'READ_' + conf.name,
                data_type: DataType.FLOAT,
                size_bytes: 4,
                cfg2: 0,
            },
            param_symbol: '$' + conf.name,
            param_type: VceParamType.VCE_CONST,
            desc: conf.name,

        })
    }
    return mapped_configs
}

function map_input_const_2_vce_config(): VceParamConfig[] {
    let mapped_configs: VceParamConfig[] = []
    for (const conf of input_consts) {
        mapped_configs.push({
            msg_type_config: {
                msg_type: -1,
                msg_name: conf,
                data_type: DataType.FLOAT,
                size_bytes: 4,
                cfg2: 0,
            },
            param_symbol: '$' + conf,
            param_type: VceParamType.VCE_CONST,
            desc: conf,
        })
    }
    return mapped_configs
}

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



const LT_AU450_DRIVER_CONFIG: MsgTypeConfig[] = [
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
        msg_type: 7,
        msg_name: 'READ_PR1',
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
        msg_type: 9,
        msg_name: 'WRITE_ANALOG_OUTPUT',
        data_type: DataType.UINT,
        size_bytes: 2,
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

const analog_output = {
    msg_type: 100,
    msg_name: 'READ_PISTON',
    data_type: DataType.UINT,
    size_bytes: 2,
    cfg2: 0,
}




const LT_AU450_VCE_CONFIG: VceParamConfig[] = [
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
        param_type: VceParamType.VCE_CONST,
        const_init_value: 1,
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
        param_type: VceParamType.VCE_CONST,
        const_init_value: 2,
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
        param_type: VceParamType.VCE_CONST,
        const_init_value: 3,
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
        param_type: VceParamType.VCE_CONST,
        const_init_value: 4,
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
        param_type: VceParamType.VCE_CONST,
        const_init_value: 5,
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
    {
        msg_type_config: {
            msg_type: 7,
            msg_name: 'READ_PR1',
            data_type: DataType.FLOAT,
            size_bytes: 4,
            cfg2: 0,
        },
        param_symbol: '$PR1',
        param_type: VceParamType.VCE_VAR,
        desc: 'Differential Pressure',
    },
    //OBD 20-29
    ...map_obd_config_2_lt_vce_config(obd_config),

    // VCE_CONST - NON-ECHO
    ...map_input_const_2_vce_config(),





    {
        msg_type_config: {
            msg_type: 100,
            msg_name: 'READ_PISTON',
            data_type: DataType.UINT,
            size_bytes: 2,
            cfg2: 0,
        },
        param_symbol: '$PISTON',
        param_type: VceParamType.VCE_CONST,
        desc: 'PISTON',
    },



];
const DEVICE_SERIES: CHXSeries[] = [
    // {
    //     series_name: 'time [s] - T1 [C]',
    //     x_param: -1,
    //     y_param: 0,
    // },

];

// msg_type start from 40
const DEVICE_CPS: CHXComputedParam[] = [
    { param_name: 'D_air', expr: '0.4638 * $barometric_pressure * 7.50062 / ($T1 + 273.15)', msg_type: 40, unit: '[Kg/m3]' },
    { param_name: 'V_air', expr: '44.63 * $VAVG_VMAX * $CP * Math.sqrt($PR1 / (0.4638 * $barometric_pressure * 7.50062 / ($T1 + 273.15)))', msg_type: 41, unit: '[m/s]' },
    { param_name: 'Q_air', expr: 'Math.PI * Math.sqrt($R) * (44.63 * $VAVG_VMAX * $CP * Math.sqrt($PR1 / (0.4638 * $barometric_pressure * 7.50062 / ($T1 + 273.15))))', msg_type: 42, unit: '[m3/s]' },
    { param_name: 'D_fuel', expr: '$DO * $SG', msg_type: 43, unit: '[Kg/m3]' },
    { param_name: 'Air_Fuel_Ratio', expr: '(Math.PI * Math.sqrt($R) * (44.63 * $VAVG_VMAX * $CP * Math.sqrt($PR1 / (0.4638 * $barometric_pressure * 7.50062 / ($T1 + 273.15)))) * 0.4638 * $barometric_pressure * 7.50062 / ($T1 + 273.15) * 1000) / (0.0016 * $RPM * 3.78541 / 3600 * $DO * $SG)', msg_type: 44 },
    { param_name: 'P_thermal', expr: '$Q_WATER * $DO * $C_WATER * ($ECT - $T1)  /60', msg_type: 45, unit: '[W]' },
    { param_name: 'Engine_Power', expr: '($L2 - $L1) * $D * 2 * Math.PI * $RPM / 60', msg_type: 46, unit: '[W]' },
    { param_name: 'Fuel_Consumption', expr: '(0.0016 * $RPM * 3.78541 / 3600 * $DO * $SG) / (($L2 - $L1) * $D * 2 * Math.PI * $RPM / 60)', msg_type: 47 },
    { param_name: 'Volumetric_Efficiency', expr: '(60000 * (Math.PI * Math.sqrt($R) * (44.63 * $VAVG_VMAX * $CP * Math.sqrt($PR1 / (0.4638 * $barometric_pressure * 7.50062 / ($T1 + 273.15))))) * $SF) / ($RPM * $SV)', msg_type: 48 },
    { param_name: 'Efficiency', expr: '($L2 - $L1) * $D * 2 * Math.PI * $RPM / 60 /1000000 / ($ME * $CV * (0.0016 * $RPM * 3.78541 / 3600 * $DO * $SG))', msg_type: 49 },
    { param_name: 'Load_Diff', expr: '($L2 - $L1) ', msg_type: 50, unit: '[N]' },
    { param_name: 'Fuel_Rate', expr: '0.0016 * $RPM * 3.78541 / 3600 * $DO * $SG', msg_type: 51, unit: '[g/s]' },
    { param_name: 'Engine_Torque', expr: '($L2 - $L1) * $D', msg_type: 52, unit: '[N.m]' }
];

let serial_adapter: SerialAdapter | null = null;
let nc_jdm_obd_serial_adapter: NC_JDM_OBD_SerialAdapter | null = null
let main_window: BrowserWindow | null = null;
let lt_au450_vce0: VirtualComputeEngine | null = null;
let device_config: LT_AU450_DeviceConfig | null = null;

ipcMain.handle(`${DEVICE_MODEL}_get_device_config`, () => [...LT_AU450_DRIVER_CONFIG, ...(lt_au450_vce0?.get_cps_config() ?? []), ...map_obd_config_2_lt_config(obd_config), analog_output]);
ipcMain.handle(`${DEVICE_MODEL}_get_device_cmd_help`, () => LT_AU450_DEVICE_CMD_HELP);
ipcMain.handle(`${DEVICE_MODEL}_get_vce_config`, () => LT_AU450_VCE_CONFIG);

ipcMain.handle(`${DEVICE_MODEL}_get_chx_cps`, () => [...DEVICE_CPS, ...get_chx_cps()]);
ipcMain.handle(`${DEVICE_MODEL}_get_chx_series`, () => [...DEVICE_SERIES, ...get_chx_series()]);
ipcMain.handle(`${DEVICE_MODEL}_get_chx_eqs`, () => get_chx_eqs());
ipcMain.handle(`${DEVICE_MODEL}_get_chx_scripts`, () => get_chx_scripts());



ipcMain.handle(`${DEVICE_MODEL}_get_obd_congis`, () => obd_config)
function mw_logger(log_msg: LogMsg) {
    main_window?.webContents.send('add_sys_log', log_msg);
}

let last_sn = 0
let last_analog_output = 0
let remove_list = [1, 2, 3, 4] // if any value comes with value nan => problem happens so, we filter them
let obd_cache: Record<string, DeviceMsg> = {};
function mw_ipc_handler(channel: string, data: any) {
    main_window?.webContents.send(channel, data);


    if (channel === `${DEVICE_MODEL}_device_msg`) {


        const device_msg: DeviceMsg = data.device_msg;
        if (device_msg.config.msg_type < 16) {
            last_sn = data.device_msg.seq_number
            nc_jdm_obd_serial_adapter?.set_seq_num(last_sn);

            if (!remove_list.includes(device_msg.config.data_type))
                lt_au450_vce0?.load_device_msg(data.device_msg);
        }



        if (device_msg.config.msg_type == 5) {
            for (const _k of Object.keys(obd_cache)) {
                obd_cache[_k].seq_number = last_sn;
                main_window?.webContents.send(channel, { device_msg: obd_cache[_k] });
            }
        }

        if (device_msg.config.msg_type < 16) {
            lt_au450_vce0?.load_device_msg(data.device_msg);
            last_sn = data.device_msg.seq_number
        }

        if (device_msg.config.msg_type == 5) {
            const _device_msg: DeviceMsg = {
                config: {
                    msg_type: 100,
                    msg_name: 'READ_PISTON',
                    data_type: DataType.UINT,
                    size_bytes: 2,
                    cfg2: 0,
                },
                seq_number: last_sn,
                msg_value: last_analog_output,
                b64_msg_value: '',
            }
            main_window?.webContents.send(channel, { device_msg: _device_msg });
        }


        if (device_msg.config.msg_type <= 29 && device_msg.config.msg_type >= 20) {
            let device_msg = data.device_msg as DeviceMsg
            device_msg.seq_number = last_sn
            lt_au450_vce0?.load_device_msg(device_msg);
            obd_cache[device_msg.config.msg_type] = device_msg;
        }
    }
}


function load_vce_settings_symbols() {
    if (!lt_au450_vce0)
        return;

    if (!device_config)
        device_config = get_chx_device_confg() as LT_AU450_DeviceConfig;

    for (let i = 0; i < input_consts.length; i++) {
        lt_au450_vce0.load_symbol('$' + input_consts[i], device_config[input_consts[i]]);
    }
    for (let i = 0; i < obd_config.length; i++) {
        lt_au450_vce0.load_symbol('$' + obd_config[i].name, 0);
    }


}



function set_commands_list(): string[] {
    let commands: string[] = []
    for (let i = 0; i < input_consts.length; i++) {
        commands.push(`SET ${input_consts[i]} <value>`)
        commands.push(`GET ${input_consts[i]}`)
    }
    return commands
}
const LT_AU450_DEVICE_CMD_HELP: string[] = [
    '=======================================================================================================',
    'SET OUTREG <value>',
    'SET ANALOG <value>',
    ...set_commands_list(),
    'GET ALL CONSTS',
    'SECRET PANEL',
    'SECRET CONTROLS',
    '=======================================================================================================',
];

function lt_au450_cmd_exec(cmd: string) {
    let cmd_parts = cmd.split(' ');

    if (cmd_parts.length !== 3 && cmd_parts.length !== 2) {
        mw_logger({ level: 'ERROR', msg: 'Invalid Device Command, Type HELP to List Device Commands' });
        return;
    }
    const new_set_val = Number(cmd_parts[2]);
    if (cmd_parts[0] === 'SET' && cmd_parts[1] === 'OUTREG' && !isNaN(new_set_val)) {
        serial_adapter?.send_packet(WRITE_DIGITAL_OUTPUTS, new_set_val);
        mw_logger({ level: 'DEBUG', msg: `Set Control Buttons State: ${new_set_val}` });
        return;
    }
    if (cmd_parts[0] === 'SET' && cmd_parts[1] === 'ANALOG' && !isNaN(new_set_val)) {
        serial_adapter?.send_packet(9, new_set_val * 65);
        last_analog_output = new_set_val
        mw_logger({ level: 'DEBUG', msg: `Set ANALOG OUTPUT : ${new_set_val * 65}` });
        mw_ipc_handler(`${DEVICE_MODEL}_ANALOG`, { piston: new_set_val });
        return;
    }

    if (cmd_parts[0] === 'GET' && input_consts.includes(cmd_parts[1])) {
        if (!device_config)
            device_config = get_chx_device_confg() as LT_AU450_DeviceConfig;
        mw_logger({ level: 'DEBUG', msg: ` ${cmd_parts[1]}: ${device_config[cmd_parts[1]]}` });
        if (cmd_parts[1] == 'CV')
            mw_ipc_handler(`${DEVICE_MODEL}_CV`, { CV: device_config.CV });
        if (cmd_parts[1] == 'SG')
            mw_ipc_handler(`${DEVICE_MODEL}_SG`, { SG: device_config.SG });
        return;
    }

    if (cmd_parts[0] === 'SET' && input_consts.includes(cmd_parts[1]) && !isNaN(new_set_val)) {
        if (!device_config)
            device_config = get_chx_device_confg() as LT_AU450_DeviceConfig;
        device_config[cmd_parts[1]] = Number(cmd_parts[2]);
        set_chx_device_config(device_config);
        save_chx_settings()
        mw_logger({ level: 'DEBUG', msg: `Set ${cmd_parts[1]}: ${new_set_val}` });
        return;
    }

    if (cmd_parts[0] === 'GET' && cmd_parts[1] == 'ALL' && cmd_parts[2] == 'CONSTS') {
        if (!device_config)
            device_config = get_chx_device_confg() as LT_AU450_DeviceConfig;
        for (let i = 0; i < input_consts.length; i++) {
            mw_logger({ level: 'DEBUG', msg: `${input_consts[i]}: ${device_config[input_consts[i]]}` });

        }
        return;
    }


    if (cmd_parts[0] === 'OBD') {
        const device_msg: DeviceMsg = {
            config: {
                msg_type: Number(cmd_parts[1]),
                msg_name: LT_AU450_VCE_CONFIG.find(conf => { return conf.msg_type_config.msg_type == Number(cmd_parts[1]) })?.msg_type_config.msg_name ?? '',
                data_type: DataType.FLOAT,
                size_bytes: 0,
                cfg2: 0,
            },
            seq_number: 0,
            msg_value: new_set_val,
            b64_msg_value: '',
        }
        mw_logger({ level: 'DEBUG', msg: `Set ${cmd_parts[1]}: ${new_set_val}` });
        mw_ipc_handler(`${DEVICE_MODEL}_device_msg`, { device_msg });
        return;
    }
    if (cmd_parts[0] === 'SECRET' && cmd_parts[1] === 'PANEL') {
        mw_ipc_handler(`${DEVICE_MODEL}_secret_panel`, { input_consts, device_config });
        return
    }
    if (cmd_parts[0] === 'SECRET' && cmd_parts[1] === 'CONTROLS') {
        mw_ipc_handler(`${DEVICE_MODEL}_secret_controls`, {});
        return
    }

    mw_logger({ level: 'ERROR', msg: 'Invalid Device Command, Type HELP to List Device Commands' });
}


export function init_lt_au450_serial_adapter(_main_window: BrowserWindow) {

    main_window = _main_window;

    ipcMain.on(`${DEVICE_MODEL}_serial_port_connect`, async (_, data) => {
        const { port_name } = data;
        serial_adapter = new SerialAdapter(port_name, new LtdDriver([0xA0, 0xA0], LT_AU450_DRIVER_CONFIG), DEVICE_ERROR_MSG_TYPE, DEVICE_ERROR_MSG_MAP, mw_ipc_handler, mw_logger, DEVICE_MODEL);
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
        // if (!serial_adapter) {
        //     mw_logger({ level: 'ERROR', msg: 'No Connected Device' });
        //     return;
        // }

        const { cmd } = data;
        lt_au450_cmd_exec(cmd);
    });

    ipcMain.on(`${DEVICE_MODEL}_serial_port_scan`, () => SerialAdapter.scan_ports(true, DEVICE_MODEL, mw_ipc_handler, mw_logger));
    SerialAdapter.scan_ports(true, DEVICE_MODEL, mw_ipc_handler, mw_logger);


    lt_au450_vce0 = new VirtualComputeEngine(LT_AU450_VCE_CONFIG, [...DEVICE_CPS, ...get_chx_cps()], mw_ipc_handler, DEVICE_MODEL);

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



    load_vce_settings_symbols()

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



    req_nc_jdm_obd_param()

}

async function req_nc_jdm_obd_param() {
    if (nc_jdm_obd_serial_adapter)
        await nc_jdm_obd_serial_adapter.loop_commands()
    setTimeout(req_nc_jdm_obd_param, 1)
}

async function scan_connect_obd() {
    const port = await NC_JDM_OBD_SerialAdapter.scan_ports(false, DEVICE_MODEL, mw_ipc_handler, mw_logger)
    if (port.ok) {
        nc_jdm_obd_serial_adapter = new NC_JDM_OBD_SerialAdapter(port.ok, mw_ipc_handler, mw_logger, DEVICE_MODEL);
        nc_jdm_obd_serial_adapter.connect();
    }
    else if (port.err) {
        mw_logger({ level: 'ERROR', msg: port.err })
    }

}

function OBD_serial_port_disconnect() {
    if (!nc_jdm_obd_serial_adapter)
        return;
    nc_jdm_obd_serial_adapter.disconnect();
    nc_jdm_obd_serial_adapter = null;
}