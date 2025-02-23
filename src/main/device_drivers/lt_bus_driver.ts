import { SerialPort } from 'serialport';
import { Result, LogMsg } from '../../common/models';

enum LtBusFunctionCode {
    READ = 0xAA,
    READ_RESP = 0xAB,
    WRITE = 0xEA,
    WRITE_ACK = 0xEB,
    WRITE_ACK_RESP = 0xEC,
};

export interface LtBusReg {
    reg_name: string;
    reg_addr: number;
    reg_size: number;
};

export class LtBusDriver {
    private static readonly BAUD_RATE = 115200;

    is_connected: boolean;

    private seq_number: number;
    private device_model: string;
    private serial_port: SerialPort;
    private request_pool_freq_ms: number;
    private request_timeout: number;
    private ipc_handler: (channel: string, data: any) => void;
    private logger: (log_msg: LogMsg) => void;

    private reg_name_config_map: Record<string, LtBusReg> = {};

    constructor(
        port_name: string,

        _device_model: string = '',
        _request_pool_freq_ms: number = 10,
        _request_timeout: number = 1000,
        _ipc_handler: (channel: string, data: any) => void,
        _logger: (log_msg: LogMsg) => void = (log_msg) => console.log(log_msg.msg),

        _bus_config: LtBusReg[],
    ) {
        this.is_connected = false;

        this.seq_number = 0;
        this.device_model = _device_model;
        this.request_pool_freq_ms = _request_pool_freq_ms;
        this.request_timeout = _request_timeout;
        this.ipc_handler = _ipc_handler;
        this.logger = _logger;

        _bus_config.forEach(conf => this.reg_name_config_map[conf.reg_name] = conf);

        this.on_serial_port_open = this.on_serial_port_open.bind(this);
        this.on_serial_port_close = this.on_serial_port_close.bind(this);
        this.on_serial_port_open_error = this.on_serial_port_open_error.bind(this);

        this.serial_port = new SerialPort({ path: port_name, baudRate: LtBusDriver.BAUD_RATE, autoOpen: false });
        this.serial_port.on('open', this.on_serial_port_open);
        this.serial_port.on('close', this.on_serial_port_close);
    }

    on_serial_port_open() {
        this.logger({ level: 'INFO', msg: 'Connected to Device Serial Port' });
        this.ipc_handler(`${this.device_model}_device_connected`, {});
        this.is_connected = true;
    }

    private on_serial_port_close() {
        this.logger({ level: 'WARN', msg: 'Device Disconnected' });
        this.disconnect();
    }

    private on_serial_port_open_error(err: Error | null) {
        if (!err)
            return;
        this.logger({ level: 'ERROR', msg: `Could not Connect to Device Serial Port, ${err.message}` });
        this.ipc_handler(`${this.device_model}_device_disconnected`, {});
    }

    private async ltdsp_request(request_packet: Uint8Array): Promise<Result<Uint8Array>> {
        const buffer: number[] = [];
        let __resolve: (value: Result<Uint8Array>) => void = (_x) => { };
        let __iid: NodeJS.Timeout | null = null;
        let __t = 0;
        const __this = this;

        function __pool() {
            let byte = __this.serial_port.read(1);
            if (byte === null)
                return;
            byte = byte[0];
            buffer.push(byte);

            if (buffer[buffer.length - 1] === 0x0A && buffer[buffer.length - 2] === 0x0D) {
                if (__iid)
                    clearInterval(__iid);
                __resolve({ ok: Uint8Array.from(buffer) });
            }

            __t += __this.request_pool_freq_ms;
            if (__t >= __this.request_timeout)
                __resolve({ err: 'LT_BUS REQUEST TIMEOUT' });
        }

        return new Promise((resolve, _reject) => {
            __resolve = resolve;
            __this.serial_port.write(request_packet, err => {
                if (err)
                    resolve({ err });
                __iid = setInterval(__pool, __this.request_pool_freq_ms);
            });
        });
    }

    connect() {
        this.logger({ level: 'INFO', msg: `Connecting to Port: ${this.serial_port.path}, Baud Rate: ${LtBusDriver.BAUD_RATE}` });
        this.serial_port.open(this.on_serial_port_open_error);
    }

    disconnect() {
        if (!this.serial_port) {
            this.logger({ level: 'ERROR', msg: 'No Connected Device' });
            return;
        }

        if (this.serial_port.isOpen)
            this.serial_port.close(() => { });
        this.ipc_handler(`${this.device_model}_device_disconnected`, {});
    }

    request_register(reg_name: string): Result<number | number[]> {
        const reg_config = this.reg_name_config_map[reg_name] ?? null;
        if (!reg_config)
            return { err: 'Unknown reg_name' };
    }
};