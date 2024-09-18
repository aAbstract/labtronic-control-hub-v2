import { SerialPort, DelimiterParser } from 'serialport';

import { DeviceMsg, LogMsg, SerialPortMetaData, ILtdDriver } from '../../common/models';

export class SerialAdapter {

    private static readonly BAUD_RATE = 115200;

    private serial_port: SerialPort;
    private stream_parser: DelimiterParser;
    private device_model: string;
    private device_driver: ILtdDriver;
    private device_error_msg_type: number;
    private device_error_msg_map: Record<number, string>;
    private seq_number: number;
    private ipc_handler: (channel: string, data: any) => void;
    private logger: (log_msg: LogMsg) => void;

    constructor(
        port_name: string,
        _device_driver: ILtdDriver,
        _device_error_msg_type: number,
        _device_error_msg_map: Record<number, string>,
        _ipc_handler: (channel: string, data: any) => void,
        _logger: (log_msg: LogMsg) => void = (log_msg) => console.log(log_msg.msg),
        _device_model: string = ''
    ) {
        this.seq_number = 0;
        this.device_model = _device_model;
        this.device_driver = _device_driver;
        this.device_error_msg_type = _device_error_msg_type;
        this.device_error_msg_map = _device_error_msg_map;
        this.ipc_handler = _ipc_handler;
        this.logger = _logger;

        this.on_data = this.on_data.bind(this);
        this.on_serial_port_open = this.on_serial_port_open.bind(this);
        this.on_serial_port_close = this.on_serial_port_close.bind(this);
        this.on_serial_port_open_error = this.on_serial_port_open_error.bind(this);

        this.serial_port = new SerialPort({ path: port_name, baudRate: SerialAdapter.BAUD_RATE, autoOpen: false });
        this.serial_port.on('open', this.on_serial_port_open);
        this.serial_port.on('close', this.on_serial_port_close);

        this.stream_parser = new DelimiterParser({ delimiter: Buffer.from([0x0D, 0x0A]), includeDelimiter: true });
        this.serial_port.pipe(this.stream_parser);
        this.stream_parser.on('data', this.on_data);
    }

    private on_data(data: number[]) {
        if (data[0] !== this.device_driver.protocol_version[0] || data[1] !== this.device_driver.protocol_version[1])
            return;

        const packet = new Uint8Array(data);
        const decode_res = this.device_driver.decode_packet(packet);
        if (decode_res.err) {
            this.logger({ level: 'ERROR', msg: JSON.stringify(decode_res.err) });
            return;
        }

        const device_msg_list: DeviceMsg[] = decode_res.ok as DeviceMsg[];
        device_msg_list.forEach(device_msg => {
            if (device_msg.config.msg_type === this.device_error_msg_type) {
                const error_code = device_msg.msg_value;
                if (!Object.keys(this.device_error_msg_map).includes(String(error_code))) {
                    this.logger({ level: 'ERROR', msg: `Unknown Device Error Code: ${error_code}` });
                    return;
                }
                (device_msg as any).error_msg = this.device_error_msg_map[device_msg.msg_value];
                this.ipc_handler(`${this.device_model}_device_error`, { device_msg });
            } else { this.ipc_handler(`${this.device_model}_device_msg`, { device_msg }) }
        });
    }

    on_serial_port_open() {
        this.logger({ level: 'INFO', msg: 'Connected to Device Serial Port' });
        this.ipc_handler(`${this.device_model}_device_connected`, {});
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

    static scan_ports(
        enable_emulation: boolean,
        _device_model: string,
        _ipc_handler: (channel: string, data: any) => void,
        _logger: (log_msg: LogMsg) => void,
    ) {
        SerialPort.list().then(ports => {
            let devices_ports = ports.filter(x => (x.path.includes('COM') || x.path.includes('ttyUSB') || x.path.includes('ttyACM')));
            if (enable_emulation)
                devices_ports.push({ path: '/dev/ttyS90', manufacturer: 'Emulation' } as any);
            if (devices_ports.length === 0) {
                _logger({ level: 'ERROR', msg: 'No Devices Detected' });
                _ipc_handler(`${_device_model}_detected_ports`, { detected_ports: [] });
                return;
            }

            _logger({ level: 'INFO', msg: `Detected Ports: ${devices_ports.map(x => x.path).join(', ')}` });
            const detected_ports = devices_ports.map(x => {
                return {
                    port_name: x.path,
                    manufacturer: x.manufacturer,
                } as SerialPortMetaData;
            });
            _ipc_handler(`${_device_model}_detected_ports`, { detected_ports });

        }).catch(err => _logger({ level: 'ERROR', msg: `Can not Scan Devices, Error: ${err}` }));
    }

    connect() {
        this.logger({ level: 'INFO', msg: `Connecting to Port: ${this.serial_port.path}, Baud Rate: ${SerialAdapter.BAUD_RATE}` });
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

    send_packet(msg_type: number, msg_value: number) {
        const encode_res = this.device_driver.encode_packet(this.seq_number, msg_type, msg_value);
        if (encode_res.err) {
            this.logger({ level: 'ERROR', msg: JSON.stringify(encode_res.err) });
            return;
        }

        const device_packet = encode_res.ok;
        this.logger({ level: 'DEBUG', msg: `Writing: ${device_packet}` });
        this.serial_port.write(device_packet);
        this.seq_number = (this.seq_number + 1) % 0xFFFF;
    }

    get_port_name(): string {
        return this.serial_port.path;
    }
}