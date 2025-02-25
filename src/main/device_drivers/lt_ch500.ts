import { ipcMain, BrowserWindow } from "electron";
import { LogMsg, _ToastMessageOptions } from '../../common/models';
import { get_chx_cps, get_chx_eqs, get_chx_scripts, get_chx_series } from "../system_settings";
import { LtBusDriver } from "./lt_bus_driver";

const DEVICE_MODEL = 'LT-CH500';
const LT_BUS_SLAVE_ID = 0x01;

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

let main_window: BrowserWindow | null = null;
let lt_bus_driver: LtBusDriver | null = null;

ipcMain.handle(`${DEVICE_MODEL}_get_device_config`, () => []);
ipcMain.handle(`${DEVICE_MODEL}_get_device_cmd_help`, () => LT_HT113_DEVICE_CMD_HELP);
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

const LT_HT113_DEVICE_CMD_HELP: string[] = [
    '=======================================================================================================',
    'REQUEST REG_NAME <register_name>, Alias: RRN <register_name>       | Request Register by Name from LT Bus',
    'REQUEST REG_ADDR <address> <size>, Alias: RRA <address> <size>     | Request Register by Address from LT Bus',
    '=======================================================================================================',
];
function lt_bus_driver_cmd_exec(cmd: string) {
    if (!lt_bus_driver) {
        mw_logger({ level: 'ERROR', msg: 'No LT-Bus Connected' });
        return;
    }

    const CMD_ALIAS_LIST: Record<string, string[]> = {
        'RRN': ['REQUEST', 'REG_NAME'],
        'RRA': ['REQUEST', 'REG_ADDR'],
    };

    // substitute command alias
    let cmd_parts = cmd.split(' ');
    const cmd_part_1 = cmd_parts[0];
    if (cmd_part_1 in CMD_ALIAS_LIST)
        cmd_parts = [...CMD_ALIAS_LIST[cmd_part_1], ...cmd_parts.slice(1)];

    if (cmd_parts[0] === 'REQUEST' && cmd_parts[1] === 'REG_NAME') {
        return;
    }

    if (cmd_parts[0] === 'REQUEST' && cmd_parts[1] === 'REG_ADDR') {
        if (cmd_parts.length !== 4) {
            mw_logger({ level: 'ERROR', msg: 'Invalid Device Command, Type HELP to List Device Commands' });
            return;
        }

        const reg_addr = Number(cmd_parts[2]);
        const reg_size = Number(cmd_parts[3]);
        lt_bus_driver.read_registers_request(reg_addr, reg_size).then(request_result => {
            if (request_result.err) {
                mw_logger({ level: 'ERROR', msg: request_result.err });
                return;
            }

            const request_packet = request_result.ok;
            debugger
        });
        return;
    }
}

export function init_lt_ch500_serial_adapter(_main_window: BrowserWindow) {
    main_window = _main_window;

    ipcMain.on(`${DEVICE_MODEL}_serial_port_connect`, (_, data) => {
        const { port_name } = data;
        lt_bus_driver = new LtBusDriver(port_name, LT_BUS_SLAVE_ID, DEVICE_MODEL, 1, 1000, mw_ipc_handler, mw_logger);
        lt_bus_driver.connect();
    });

    ipcMain.on(`${DEVICE_MODEL}_serial_port_disconnect`, () => {
        if (!lt_bus_driver)
            return;
        lt_bus_driver.disconnect();
        lt_bus_driver = null;
    });

    ipcMain.on(`${DEVICE_MODEL}_exec_device_cmd`, (_, data) => {
        const { cmd } = data;
        lt_bus_driver_cmd_exec(cmd);
    });

    ipcMain.on(`${DEVICE_MODEL}_serial_port_scan`, () => LtBusDriver.scan_ports(true, DEVICE_MODEL, mw_ipc_handler, mw_logger));
    LtBusDriver.scan_ports(true, DEVICE_MODEL, mw_ipc_handler, mw_logger);

    main_window?.webContents.send(`${DEVICE_MODEL}_device_config_ready`);
    mw_logger({ level: 'INFO', msg: 'Loaded Device Drivers: LT-BUS-DRIVER' });
}