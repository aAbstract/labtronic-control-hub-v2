import { ipcMain, BrowserWindow } from "electron";
import { LogMsg, _ToastMessageOptions, LTBusMsgConfig, LTBusDeviceMsg } from '../../common/models';
import { get_chx_cps, get_chx_eqs, get_chx_scripts, get_chx_series } from "../system_settings";
import { LtBusDriver, LTBusDataType } from "./lt_bus_driver";

const DEVICE_MODEL = 'LT-RE850';
const LT_RE850_SLAVE_ID = 0x01;

const LT_RE850_DRIVER_CONFIG = [
    'READ_FLOW',
    'READ_PR1',
    'READ_PR2',
    'READ_HUMD1',
    'READ_HUMD2',
    'READ_PUMP1_CURR',
    'READ_PUMP2_CURR',
    'READ_COMP_CURR',
    ...(new Array(20).fill(0).map((_, i) => `READ_TMP${i + 1}`)),
    'READ_PR3',
    'READ_PR4',
    'INPUT_REG',
    'READ_FAN_S',
    'READ_HEATER_P',
    'READ_HEATER_SP',
    'READ_THERMO_SP',
    'CTRL_REG',
    'FAULT_REG',
].map((msg_name, idx) => {
    return { msg_name, msg_type: idx } as LTBusMsgConfig;
});

let main_window: BrowserWindow | null = null;
let lt_bus_driver: LtBusDriver | null = null;

ipcMain.handle(`${DEVICE_MODEL}_get_device_config`, () => LT_RE850_DRIVER_CONFIG);
ipcMain.handle(`${DEVICE_MODEL}_get_device_cmd_help`, () => LT_RE850_DEVICE_CMD_HELP);
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

const LT_RE850_DEVICE_CMD_HELP: string[] = [
    '================================================================================================================================',
    'READ REGISTER <address> <size>, Alias: RR <address> <size>                     | Read Register from LT Bus',
    'READ F_REGISTER <address> <type>, Alias: RFR <address> <type>                  | Read and Parse Register from LT Bus',
    'WRITE REGISTER <address> <type> <value>, Alias WR <address> <type> <value>     | Write Register to LT Bus',
    'STOP DATA_POOL, Alias SDP                                                      | Stops Data Pool Task',
    '================================================================================================================================',
];
function lt_bus_driver_cmd_exec(cmd: string) {
    if (!lt_bus_driver) {
        mw_logger({ level: 'ERROR', msg: 'No LT-Bus Connected' });
        return;
    }

    const CMD_ALIAS_LIST: Record<string, string[]> = {
        'RR': ['READ', 'REGISTER'],
        'RFR': ['READ', 'F_REGISTER'],
        'WR': ['WRITE', 'REGISTER'],
        'SDP': ['STOP', 'DATA_POOL'],
    };

    // substitute command alias
    let cmd_parts = cmd.split(' ');
    const cmd_part_1 = cmd_parts[0];
    if (cmd_part_1 in CMD_ALIAS_LIST)
        cmd_parts = [...CMD_ALIAS_LIST[cmd_part_1], ...cmd_parts.slice(1)];

    if (cmd_parts[0] === 'READ' && cmd_parts[1] === 'REGISTER') {
        if (cmd_parts.length !== 4) {
            mw_logger({ level: 'ERROR', msg: 'Invalid Device Command, Type HELP to List Device Commands' });
            return;
        }

        const reg_addr = Number(cmd_parts[2]);
        const reg_size = Number(cmd_parts[3]);
        lt_bus_driver.read_registers(reg_addr, reg_size).then(request_result => {
            if (request_result.err) {
                mw_logger({ level: 'ERROR', msg: request_result.err });
                return;
            }

            const response_sn: number = request_result.ok.response_sn;
            const response_packet: Uint8Array = request_result.ok.response_packet;
            const data_buffer = response_packet.slice(LtBusDriver.LT_BUS_PACKET_DATA_START, LtBusDriver.LT_BUS_PACKET_DATA_START + reg_size);
            const hex_str: string = Array.from(data_buffer).map(x => '0x' + x.toString(16).toUpperCase().padStart(2, '0')).join(' ');
            mw_logger({ level: 'DEBUG', msg: `SN: ${response_sn}, DATA: ${hex_str}` });
        });

        return;
    }

    if (cmd_parts[0] === 'READ' && cmd_parts[1] === 'F_REGISTER') {
        if (cmd_parts.length !== 4) {
            mw_logger({ level: 'ERROR', msg: 'Invalid Device Command, Type HELP to List Device Commands' });
            return;
        }

        const reg_addr = Number(cmd_parts[2]);
        const reg_type = cmd_parts[3];
        if (!(reg_type in LtBusDriver.BINARY_PARSERS)) {
            mw_logger({ level: 'ERROR', msg: `Invalid LT-Bus Register Type ${reg_type}` });
            return;
        }

        const [BinaryParser, reg_size] = LtBusDriver.BINARY_PARSERS[reg_type];
        lt_bus_driver.read_registers(reg_addr, reg_size).then(request_result => {
            if (request_result.err) {
                mw_logger({ level: 'ERROR', msg: request_result.err });
                return;
            }

            const response_packet: Uint8Array = request_result.ok.response_packet;
            const data_buffer = response_packet.slice(LtBusDriver.LT_BUS_PACKET_DATA_START, LtBusDriver.LT_BUS_PACKET_DATA_START + reg_size);
            const parsed_value = Number(new BinaryParser(data_buffer.buffer)[0].toFixed(2));
            mw_logger({ level: 'DEBUG', msg: `LT-Bus Response: ${parsed_value}` });
        });

        return;
    }

    if (cmd_parts[0] === 'WRITE' && cmd_parts[1] === 'REGISTER') {
        if (cmd_parts.length !== 5) {
            mw_logger({ level: 'ERROR', msg: 'Invalid Device Command, Type HELP to List Device Commands' });
            return;
        }

        const reg_type = cmd_parts[3];
        if (!(reg_type in LtBusDriver.BINARY_PARSERS)) {
            mw_logger({ level: 'ERROR', msg: `Invalid LT-Bus Register Type ${reg_type}` });
            return;
        }

        const reg_addr = Number(cmd_parts[2]);
        const reg_value = Number(cmd_parts[4]);
        const sent_packet = lt_bus_driver.write_register(reg_addr, reg_type as LTBusDataType, reg_value);
        mw_logger({ level: 'DEBUG', msg: `SENT: ${LtBusDriver.fmt_packet_hex_str(sent_packet)}` });

        return;
    }

    if (cmd_parts[0] === 'STOP' && cmd_parts[1] === 'DATA_POOL') {
        __enable_pool = false;
        return;
    }

    mw_logger({ level: 'ERROR', msg: 'Invalid Device Command, Type HELP to List Device Commands' });
}

let __enable_pool: boolean = false;
const __pool_freq_ms = 100;
const __pool_data_size = (LT_RE850_DRIVER_CONFIG.length - 3) * 4 + 6;
const __pool_filter_set = new Set(['INPUT_REG', 'CTRL_REG', 'FAULT_REG']);
const __pool_msg_config = LT_RE850_DRIVER_CONFIG.filter(x => !__pool_filter_set.has(x.msg_name));
async function __pool_task() {
    while (__enable_pool) {
        if (!lt_bus_driver) {
            mw_logger({ level: 'ERROR', msg: 'Attempt to Start Pool Task while LT-Bus is Disconnected' });
            return;
        }

        const request_result = await lt_bus_driver.read_registers(0xD000, __pool_data_size);
        if (request_result.err) {
            mw_logger({ level: 'ERROR', msg: request_result.err });
            continue;
        }

        const response_sn: number = request_result.ok.response_sn;
        const response_packet: Uint8Array = request_result.ok.response_packet;
        const data_buffer = response_packet.slice(LtBusDriver.LT_BUS_PACKET_DATA_START, LtBusDriver.LT_BUS_PACKET_DATA_START + __pool_data_size);
        const fltsq_data_buffer = LtBusDriver.concat_uint8_arrays([data_buffer.slice(0, 0x078), data_buffer.slice(0x07A, 0x08A)]); // OFFSET-CALC

        const decode_result = LtBusDriver.decode_fltsq(response_sn, fltsq_data_buffer, __pool_msg_config);
        if (decode_result.err) {
            mw_logger({ level: 'ERROR', msg: decode_result.err });
            continue;
        }

        const decoded_msg_list = decode_result.ok as LTBusDeviceMsg[];
        for (const device_msg of decoded_msg_list)
            mw_ipc_handler(`${DEVICE_MODEL}_device_msg`, { device_msg });

        await LtBusDriver.async_sleep(__pool_freq_ms);
    }
}

export function init_lt_re850_serial_adapter(_main_window: BrowserWindow) {
    main_window = _main_window;

    ipcMain.on(`${DEVICE_MODEL}_serial_port_connect`, (_, data) => {
        const { port_name } = data;
        lt_bus_driver = new LtBusDriver(port_name, LT_RE850_SLAVE_ID, DEVICE_MODEL, 1, 1000, mw_ipc_handler, mw_logger);
        lt_bus_driver.connect();
        __enable_pool = true;
        __pool_task().then(() => mw_logger({ level: 'WARN', msg: 'Data Pool Task Stopped' }));
    });

    ipcMain.on(`${DEVICE_MODEL}_serial_port_disconnect`, () => {
        if (!lt_bus_driver)
            return;
        lt_bus_driver.disconnect();
        lt_bus_driver = null;
        __enable_pool = false;
    });

    ipcMain.on(`${DEVICE_MODEL}_exec_device_cmd`, (_, data) => {
        const { cmd } = data;
        lt_bus_driver_cmd_exec(cmd);
    });

    ipcMain.on(`${DEVICE_MODEL}_serial_port_scan`, () => LtBusDriver.scan_ports(true, DEVICE_MODEL, mw_ipc_handler, mw_logger));
    LtBusDriver.scan_ports(true, DEVICE_MODEL, mw_ipc_handler, mw_logger);

    main_window?.webContents.send(`${DEVICE_MODEL}_device_config_ready`);
    mw_logger({ level: 'INFO', msg: `Loaded Device Drivers: ${DEVICE_MODEL}` });
}