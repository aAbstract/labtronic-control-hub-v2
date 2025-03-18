import { ipcMain, BrowserWindow } from "electron";
import { LogMsg, _ToastMessageOptions, LTBusMsgConfig, LTBusDeviceMsg, LTBusDeviceErrorMsg } from '../../common/models';
import { get_chx_cps, get_chx_eqs, get_chx_scripts, get_chx_series, get_version_info } from "../system_settings";
import { LtBusDriver, LTBusDataType } from "./lt_bus_driver";
import { check_for_update } from '../update_service';

const DEVICE_MODEL = 'LT-MC417';
const SLAVE_ID = 0x01;

const LT_MC417_DRIVER_CONFIG = [
    'READ_PR1',
    'INPUT_REG',
    'READ_PUMP1_SPEED',
    'CTRL_REG',
    'FAULT_REG',
].map((msg_name, idx) => {
    return { msg_name, msg_type: idx } as LTBusMsgConfig;
});

const LT_MC417_DEVICE_ERRORS: LTBusDeviceErrorMsg[] = [
    {
        error_code: 0x01,
        error_text: 'Pump 1 Set Point out of Range',
        user_ack: false,
    },
    {
        error_code: 0x02,
        error_text: 'Pump 1 Overloaded',
        user_ack: true,
    },
    {
        error_code: 0x03,
        error_text: 'PR1 Exceeded the Limit',
        user_ack: true,
    },
];

const device_errors_map: Record<number, LTBusDeviceErrorMsg> = {};
LT_MC417_DEVICE_ERRORS.forEach(derm => device_errors_map[derm.error_code] = derm);

let main_window: BrowserWindow | null = null;
let lt_bus_driver: LtBusDriver | null = null;

ipcMain.handle(`${DEVICE_MODEL}_get_device_config`, () => LT_MC417_DRIVER_CONFIG);
ipcMain.handle(`${DEVICE_MODEL}_get_device_cmd_help`, () => LT_MC417_DEVICE_CMD_HELP);
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

const LT_MC417_DEVICE_CMD_HELP: string[] = [
    '================================================================================================================================',
    'READ REGISTER <address> <size>, Alias: RR <address> <size>                     | Read Register from LT Bus',
    'READ F_REGISTER <address> <type>, Alias: RFR <address> <type>                  | Read and Parse Register from LT Bus',
    'WRITE REGISTER <address> <type> <value>, Alias WR <address> <type> <value>     | Write Register to LT Bus',
    'STOP DATA_POOL, Alias SDP                                                      | Stops Data Pool Task',
    'RUN DATA_POOL, Alias RDP                                                       | Runs Data Pool Task',
    'SET MSG_ENABLE, Alias SME                                                      | Sets MSG_ENABLE Bit',
    'SET SYS_RESET, Alias SSR                                                       | Sets System Reset Bit',
    '================================================================================================================================',
];

function lt_bus_driver_cmd_exec(cmd: string) {
    let cmd_parts = cmd.split(' ');

    if (cmd_parts[0] === 'DEVICE' && cmd_parts[1] === 'INFO') {
        const version_info = get_version_info();
        const _msg = [
            `DEVICE_MODEL: ${version_info.device_model}`,
            `CHX_CORE_VERSION: ${version_info.chx_core_version}`,
            `CHX_MODULE_VERSION: ${version_info.chx_module_version}`,
        ];
        mw_logger({ level: 'INFO', msg: _msg.join('\n') });
        return;
    }

    if (cmd_parts[0] === 'CHECK' && cmd_parts[1] === 'UPDATE') {
        mw_logger({ level: 'INFO', msg: 'Checking for Software Updates' });
        check_for_update().then(ucheck_res => {
            if (ucheck_res.err)
                mw_logger({ level: 'ERROR', msg: ucheck_res.err });

            if (ucheck_res.ok)
                mw_logger({ level: 'INFO', msg: ucheck_res.ok });
        });
        return;
    }

    if (!lt_bus_driver) {
        mw_logger({ level: 'ERROR', msg: 'No LT-Bus Connected' });
        return;
    }

    const CMD_ALIAS_LIST: Record<string, string[]> = {
        'RR': ['READ', 'REGISTER'],
        'RFR': ['READ', 'F_REGISTER'],
        'WR': ['WRITE', 'REGISTER'],
        'SDP': ['STOP', 'DATA_POOL'],
        'RDP': ['RUN', 'DATA_POOL'],
        'SME': ['SET', 'MSG_ENABLE'],
        'SSR': ['SET', 'SYS_RESET'],
    };

    // substitute command alias
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

            const response_packet: Uint8Array = request_result.ok as Uint8Array;
            const data_buffer = response_packet.slice(LtBusDriver.LT_BUS_PACKET_DATA_START, LtBusDriver.LT_BUS_PACKET_DATA_START + reg_size);
            const hex_str: string = Array.from(data_buffer).map(x => '0x' + x.toString(16).toUpperCase().padStart(2, '0')).join(' ');
            mw_logger({ level: 'DEBUG', msg: `DATA: ${hex_str}` });
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

            const response_packet: Uint8Array = request_result.ok as Uint8Array;
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
        lt_bus_driver.write_register(reg_addr, reg_type as LTBusDataType, reg_value).then(write_result => {
            if (write_result.err) {
                mw_logger({ level: 'ERROR', msg: write_result.err });
                return;
            }

            const sent_packet = write_result.ok as Uint8Array;
            mw_logger({ level: 'DEBUG', msg: `SENT: ${LtBusDriver.fmt_packet_hex_str(sent_packet)}` });
        });

        return;
    }

    if (cmd_parts[0] === 'STOP' && cmd_parts[1] === 'DATA_POOL') {
        __enable_pool = false;
        return;
    }

    if (cmd_parts[0] === 'RUN' && cmd_parts[1] === 'DATA_POOL') {
        __enable_pool = true;
        __pool_task().then(() => mw_logger({ level: 'WARN', msg: 'Data Pool Task Stopped' }));
        return;
    }

    if (cmd_parts[0] === 'SET' && cmd_parts[1] === 'MSG_ENABLE') {
        lt_bus_driver.write_register(0xA004, 'U16', 4).then(write_result => {
            if (write_result.err) {
                mw_logger({ level: 'ERROR', msg: write_result.err });
                return;
            }

            const sent_packet = write_result.ok as Uint8Array;
            mw_logger({ level: 'DEBUG', msg: `SENT: ${LtBusDriver.fmt_packet_hex_str(sent_packet)}` });
        });

        return;
    }

    if (cmd_parts[0] === 'SET' && cmd_parts[1] === 'SYS_RESET') {
        lt_bus_driver.write_register(0xA004, 'U16', 2).then(write_result => {
            if (write_result.err) {
                mw_logger({ level: 'ERROR', msg: write_result.err });
                return;
            }

            const sent_packet = write_result.ok as Uint8Array;
            mw_logger({ level: 'DEBUG', msg: `SENT: ${LtBusDriver.fmt_packet_hex_str(sent_packet)}` });
        });

        return;
    }

    mw_logger({ level: 'ERROR', msg: 'Invalid Device Command, Type HELP to List Device Commands' });
}

let __enable_pool: boolean = false;
let __sn = 0;
const __pool_freq_ms = 100;
const __pool_data_size = 2 * 4 + 3 * 2;
const __pool_filter_set = new Set(['INPUT_REG', 'CTRL_REG', 'FAULT_REG']);
const __f32_pool_msg_config = LT_MC417_DRIVER_CONFIG.filter(x => !__pool_filter_set.has(x.msg_name));
const __u16_pool_msg_config = LT_MC417_DRIVER_CONFIG.filter(x => __pool_filter_set.has(x.msg_name));
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

        const response_packet: Uint8Array = request_result.ok as Uint8Array;
        const data_buffer = response_packet.slice(LtBusDriver.LT_BUS_PACKET_DATA_START, LtBusDriver.LT_BUS_PACKET_DATA_START + __pool_data_size);

        // parse f32 sequence
        const f32_seq_data_buffer = LtBusDriver.concat_uint8_arrays([data_buffer.slice(0, 4), data_buffer.slice(6, 10)]); // OFFSET_CALC_LT-MC417
        const f32_seq_decode_result = LtBusDriver.decode_f32_seq(f32_seq_data_buffer, __f32_pool_msg_config);
        if (f32_seq_decode_result.err) {
            mw_logger({ level: 'ERROR', msg: f32_seq_decode_result.err });
            continue;
        }
        const f32_seq_decoded_msg_list = f32_seq_decode_result.ok as LTBusDeviceMsg[];
        for (const device_msg of f32_seq_decoded_msg_list) {
            device_msg.seq_number = __sn;
            mw_ipc_handler(`${DEVICE_MODEL}_device_msg`, { device_msg });
        }

        // parse u16 sequence
        const u16_data_buffer = LtBusDriver.concat_uint8_arrays([data_buffer.slice(4, 6), data_buffer.slice(10, 14)]); // OFFSET_CALC_LT-MC417
        const u16_decode_result = LtBusDriver.decode_u16_seq(u16_data_buffer, __u16_pool_msg_config);
        if (u16_decode_result.err) {
            mw_logger({ level: 'ERROR', msg: u16_decode_result.err });
            continue;
        }
        const u16_decoded_msg_list = u16_decode_result.ok as LTBusDeviceMsg[];
        for (const device_msg of u16_decoded_msg_list) {
            device_msg.seq_number = __sn;
            mw_ipc_handler(`${DEVICE_MODEL}_device_msg`, { device_msg });
        }

        __sn++;

        // handle device error msgs
        const dermcr_result = await lt_bus_driver.read_registers(0xA006, 1);
        if (dermcr_result.err) {
            mw_logger({ level: 'ERROR', msg: dermcr_result.err });
            continue;
        }
        const dermcr_packet = dermcr_result.ok as Uint8Array;
        const dermc = dermcr_packet[LtBusDriver.LT_BUS_PACKET_DATA_START];
        if (dermc > 0) {
            const derm_buffer_result = await lt_bus_driver.read_registers(0xA007, dermc);
            if (derm_buffer_result.err) {
                mw_logger({ level: 'ERROR', msg: derm_buffer_result.err });
                continue;
            }
            const derm_packet = derm_buffer_result.ok as Uint8Array;
            const derm_buffer = derm_packet.slice(LtBusDriver.LT_BUS_PACKET_DATA_START, LtBusDriver.LT_BUS_PACKET_DATA_START + dermc);
            for (let i = 0; i < derm_buffer.length; i++) {
                const error_code = derm_buffer[i];
                if (!(error_code in device_errors_map))
                    continue;

                const device_error_msg = device_errors_map[error_code];
                mw_ipc_handler(`${DEVICE_MODEL}_device_error_msg`, { device_error_msg });
                if (!device_error_msg.user_ack)
                    await lt_bus_driver.write_register(0xA007 + i, 'U8', 0x00);
            }
        }

        await LtBusDriver.async_sleep(__pool_freq_ms);
    }
}

export function init_lt_mc417_serial_adapter(_main_window: BrowserWindow) {
    main_window = _main_window;

    ipcMain.on(`${DEVICE_MODEL}_serial_port_connect`, (_, data) => {
        const { port_name } = data;
        lt_bus_driver = new LtBusDriver(port_name, SLAVE_ID, DEVICE_MODEL, mw_ipc_handler, mw_logger);
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