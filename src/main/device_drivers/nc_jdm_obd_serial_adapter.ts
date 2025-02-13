import { SerialPort } from 'serialport';
import { DeviceMsg, LogMsg, SerialPortMetaData, DataType, OBDCONFIG } from '../../common/models';

import { Result } from '../../common/models';




async function readUntil(
    port: SerialPort,
    stopCondition: string = '\r\r>',
    timeout: number = 5000
): Promise<string> {
    return new Promise((resolve, reject) => {
        let receivedData = "";
        let resolved = false; // Prevent multiple calls to resolve/reject

        const timer = setTimeout(() => {
            if (!resolved) {
                resolved = true;
                port.removeAllListeners("data");
                port.removeAllListeners("error");
                reject(new Error("Timeout reached"));
            }
        }, timeout);

        port.on("data", (data: Buffer) => {
            if (resolved) return; // Ignore if already resolved
            receivedData += data.toString("utf-8");

            if (receivedData.includes(stopCondition)) {
                resolved = true;
                clearTimeout(timer);
                port.removeAllListeners("data");
                port.removeAllListeners("error");
                resolve(receivedData);
            }
        });

        port.once("error", (err) => {
            if (!resolved) {
                resolved = true;
                clearTimeout(timer);
                port.removeAllListeners("data");
                port.removeAllListeners("error");
                reject(err);
            }
        });
    });
}



const header = '7E8'

export const obd_config: OBDCONFIG[] = [
    {
        name: 'abs_pedal_pos_d',
        command: '2149',
        msg_type: 20,
        response_size: 3,
        min: 0,
        max: 100,
        unit: '%',
        equation_weights: {
            a: 100 / 255,
            b: 0,
            abs: 0
        }
    },
    {
        name: 'abs_pedal_pos_e',
        command: '214A',
        msg_type: 21,
        response_size: 3,
        min: 0,
        max: 100,
        unit: '%',
        equation_weights: {
            a: 100 / 255,
            b: 0,
            abs: 0
        }
    },
    {
        name: 'fuel_rail_pressure',
        command: '2123',
        msg_type: 22,
        response_size: 4,
        min: 0,
        max: 655350,
        unit: 'kPa',
        equation_weights: {
            a: 2560,
            b: 10,
            abs: 0
        }
    },
    {
        name: 'engine_load',
        command: '2104',
        msg_type: 23,
        response_size: 3,
        min: 0,
        max: 100,
        unit: '%',
        equation_weights:
        {
            a: 100 / 255,
            b: 0,
            abs: 0
        }
    },
    {
        name: 'engine_rpm',
        command: '210C',
        msg_type: 24,
        response_size: 4,
        min: 0,
        max: 16383.75,
        unit: 'rpm',
        equation_weights: {
            a: 64,
            b: 0.25,
            abs: 0
        }
    },
    {
        name: 'engine_coolant_temp',
        command: '2105',
        msg_type: 25,
        response_size: 3,
        min: -40,
        max: 215,
        unit: 'C',
        equation_weights: {
            a: 1,
            b: 0,
            abs: -40
        }
    },
    {
        name: 'intake_air_temp',
        command: '210F',
        msg_type: 26,
        response_size: 3,
        min: -40,
        max: 215,
        unit: 'C',
        equation_weights: {
            a: 1,
            b: 0,
            abs: -40
        }
    },
    {
        name: 'intake_abs_manifold_abs_press',
        command: '210b',
        msg_type: 27,
        response_size: 3,
        min: 0,
        max: 255,
        unit: 'kPa',
        equation_weights: {
            a: 1,
            b: 0,
            abs: 0
        }
    }]
class NC_JDM_OBD_driver {

    public header: string;
    public config: OBDCONFIG[];

    constructor() {
        this.header = header
        this.config = obd_config
    }

    encode(command: string, value: number): Result<string> {
        const command_config = this.config.find((conf) => { return conf.command == command })
        if (!command_config)
            return { err: 'no such cammand' }
        if (value > command_config.max || value < command_config.min)
            return { err: 'value out of range' }

        const command_return = (0x40 + parseInt(command_config.command.slice(0, 2), 16)).toString(16)
        const sub_command_return = command_config.command.slice(2, 4)
        const a = Math.floor((value - command_config.equation_weights.abs) / command_config.equation_weights.a)
        const b = command_config.equation_weights.b ? Math.floor((value - a * command_config.equation_weights.a) / command_config.equation_weights.b) : 0
        let response_bytes = this.header + command_config.response_size.toString(16).padStart(2, '0') + command_return + sub_command_return + a.toString(16).padStart(2, '0')
        if (command_config.equation_weights.b)
            response_bytes = response_bytes + b.toString(16).padStart(2, '0')
        response_bytes = response_bytes + '\r\r>'
        return { ok: response_bytes }
    }
    decode(data: string, sent_command: string): Result<number> {
        // const expected_length = parseInt(data.slice(3, 5), 16)
        // if (data.slice(5, data.length).length / 2 != expected_length)
        //     return { err: 'length error' }
        // const command = (parseInt(data.slice(5, 7), 16) - 0x40).toString(16) + data.slice(7, 9)
        // if (command != sent_command)
        //     return { err: 'unexpected command return' }
        const command_config = this.config.find((conf) => { return conf.command == sent_command })
        if (!(command_config?.equation_weights.a))
            return { err: 'command config error' }

        const value = command_config?.equation_weights.a * parseInt(data.slice(9, 11), 16)
            + (command_config?.equation_weights.b ? command_config?.equation_weights.b * parseInt(data.slice(11, 13), 16) : 0)
            + command_config?.equation_weights.abs
        return { ok: value }
    }
}




export class NC_JDM_OBD_SerialAdapter {

    private static readonly BAUD_RATE = 38400;

    is_connected: boolean;

    private serial_port: SerialPort;
    //private stream_parser: DelimiterParser;
    private device_model: string;
    private device_driver: NC_JDM_OBD_driver;
    private seq_num: number
    private sent_command: string

    private ipc_handler: (channel: string, data: any) => void;
    private logger: (log_msg: LogMsg) => void;

    constructor(
        port_name: string,
        _ipc_handler: (channel: string, data: any) => void,
        _logger: (log_msg: LogMsg) => void = (log_msg) => console.log(log_msg.msg),
        _device_model: string = ''
    ) {
        this.seq_num = 0
        this.device_model = _device_model;
        this.device_driver = new NC_JDM_OBD_driver();
        this.ipc_handler = _ipc_handler;
        this.logger = _logger;
        this.is_connected = false;
        this.sent_command = ''

        //this.on_data = this.on_data.bind(this);
        this.on_serial_port_open = this.on_serial_port_open.bind(this);
        this.on_serial_port_close = this.on_serial_port_close.bind(this);
        this.on_serial_port_open_error = this.on_serial_port_open_error.bind(this);

        this.serial_port = new SerialPort({ path: port_name, baudRate: NC_JDM_OBD_SerialAdapter.BAUD_RATE, autoOpen: false });
        this.serial_port.on('open', this.on_serial_port_open);
        this.serial_port.on('close', this.on_serial_port_close);
    }

    set_sent_command(command: string) {
        this.sent_command = command
    }

    on_serial_port_open() {
        this.logger({ level: 'INFO', msg: 'Connected to OBD Device Serial Port' });
        this.ipc_handler(`${this.device_model}_OBD_device_connected`, {});
        this.is_connected = true;
    }

    private on_serial_port_close() {
        this.logger({ level: 'WARN', msg: 'OBD Device Disconnected' });
        this.disconnect();
    }

    private on_serial_port_open_error(err: Error | null) {
        if (!err)
            return;
        this.logger({ level: 'ERROR', msg: `Could not Connect to OBD Device Serial Port, ${err.message}` });
        this.ipc_handler(`${this.device_model}_OBD_device_disconnected`, {});
    }

    static async scan_ports(
        enable_emulation: boolean,
        _device_model: string,
        _ipc_handler: (channel: string, data: any) => void,
        _logger: (log_msg: LogMsg) => void,
    ):Promise<Result<string>> {
        try {
            const ports = await SerialPort.list()
            let devices_ports = ports.filter(x => (x.path.includes('COM') || x.path.includes('ttyUSB') || x.path.includes('ttyACM')));
            if (enable_emulation) {
                devices_ports.push({ path: '/dev/ttyS100', manufacturer: 'OBD Emulation' } as any);
            }

            if (devices_ports.length === 0) {
                return {err:'No Ports Connected'}; 
            }
            const detected_ports = devices_ports.map(x => {
                return {
                    port_name: x.path,
                    manufacturer: x.manufacturer,
                } as SerialPortMetaData;
            });
            for (let i = 0; i < detected_ports.length; i++) {
                const portPath = detected_ports[i].port_name
                const port = new SerialPort({ path: portPath, baudRate: this.BAUD_RATE, autoOpen: false });

                port.open(async (err) => {
                    if (err) {
                        return;
                    }
                    port.write('ATZ\r');
                    const response = await readUntil(port)
                    _logger({ level: 'INFO', msg: response })

                    if (response.includes('ELM327 v1.5')) {
                        const init_commands = ['ATE0', 'ATH1', 'ATS0']
                        for (let j = 0; j < init_commands.length; j++) {
                            port.write(init_commands[j] + '\r')
                            const res = await readUntil(port)
                            _logger({ level: 'INFO', msg: res })
                            if (res.includes('OK')) {
                                return {ok: detected_ports[i].port_name}
                            }
                        }
                    }
                    port.close();
                    return  {err: 'No Ports Found'}
                });

            }
        }
        catch{
            return {err: 'Error While Scanning Ports'}
        }
        return {err: 'Error While Scanning Ports'}
    }

    connect() {
        this.logger({ level: 'INFO', msg: `Connecting to Port: ${this.serial_port.path}, Baud Rate: ${NC_JDM_OBD_SerialAdapter.BAUD_RATE}` });
        this.serial_port.open(this.on_serial_port_open_error);

    }

    disconnect() {
        if (!this.serial_port) {
            this.logger({ level: 'ERROR', msg: 'No Connected Device' });
            return;
        }

        if (this.serial_port.isOpen)
            this.serial_port.close(() => { });
        this.ipc_handler(`${this.device_model}_OBD_device_disconnected`, {});
    }

    send_packet(command: string) {

        const command_config = this.device_driver.config.find((conf) => { return conf.command == command })
        if (!command_config) {
            this.logger({ level: 'ERROR', msg: 'Command Not Found' + command })
            return
        }
        this.sent_command = command
        const uint8_command = new Uint8Array(new TextEncoder().encode(command + '\r'))
        this.serial_port.write(uint8_command);
        this.seq_num = (this.seq_num + 1) % 0xFFFF;
        this.logger({ level: 'INFO', msg: command + ' r' })
    }
    async read_untill(delimiter: string = '\r\r>') {

        await readUntil(this.serial_port, delimiter, 1000).then(res => {
            const decode_res = this.device_driver.decode(res.slice(0, -1), this.sent_command);
            this.logger({ level: 'INFO', msg: res })
            if (decode_res.err) {
                this.logger({ level: 'ERROR', msg: JSON.stringify(decode_res.err) });
                return;
            }
            this.logger({ level: 'INFO', msg: JSON.stringify(decode_res.ok) });
            const command_config = this.device_driver.config.find((conf) => { return conf.command == this.sent_command })
            if (!(command_config && decode_res.ok))
                return;
            const device_msg: DeviceMsg = {
                config: {
                    msg_type: command_config?.msg_type,
                    msg_name: command_config?.name,
                    data_type: DataType.FLOAT,
                    size_bytes: 0,
                    cfg2: 0,
                },
                seq_number: this.seq_num,
                msg_value: decode_res.ok,
                b64_msg_value: '',
            }
            this.ipc_handler(`${this.device_model}_device_msg`, { device_msg });


        }).catch(() => {
            this.logger({ level: 'ERROR', msg: "Error While Reading Data" })
        })

    }

    get_port_name(): string {
        return this.serial_port.path;
    }
    get_driver_config(): OBDCONFIG[] {
        return this.device_driver.config
    }
    async loop_commands() {

        for (const command of this.device_driver.config) {
            this.send_packet(command.command);
            await this.read_untill();
        }
    }
}