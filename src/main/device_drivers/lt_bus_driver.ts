import { SerialPort } from 'serialport';
import { LogMsg, Result, SerialPortMetaData, LTBusDeviceMsg, LTBusMsgConfig } from '../../common/models';

enum LtBusFunctionCode {
    READ = 0xAA,
    READ_RESP = 0xAB,
    WRITE = 0xEA,
    WRITE_ACK = 0xEB,
    WRITE_ACK_RESP = 0xEC,
};

export type LTBusDataType = 'U8' | 'U16' | 'U32' | 'U64' | 'I8' | 'I16' | 'I32' | 'I64' | 'F32' | 'F64';

export class LtBusDriver {
    static readonly LT_BUS_PACKET_DATA_START = 7;
    static readonly BINARY_PARSERS: Record<LTBusDataType, [any, number]> = {
        'U8': [Uint8Array, 1],
        'U16': [Uint16Array, 2],
        'U32': [Uint32Array, 4],
        'U64': [BigUint64Array, 8],

        'I8': [Int8Array, 1],
        'I16': [Int16Array, 2],
        'I32': [Int32Array, 4],
        'I64': [BigInt64Array, 8],

        'F32': [Float32Array, 4],
        'F64': [Float64Array, 8],
    };

    private static readonly BAUD_RATE = 115200;
    private static readonly REQUEST_PACKET_MIN_SIZE = 10;

    is_connected: boolean;

    private device_model: string;
    private slave_id: number;
    private serial_port: SerialPort;
    private request_pool_freq_ms: number;
    private request_timeout: number;
    private ipc_handler: (channel: string, data: any) => void;
    private logger: (log_msg: LogMsg) => void;

    constructor(
        port_name: string,
        slave_id: number,

        _device_model: string = '',
        _request_pool_freq_ms: number = 10,
        _request_timeout: number = 1000,
        _ipc_handler: (channel: string, data: any) => void,
        _logger: (log_msg: LogMsg) => void = (log_msg) => console.log(log_msg.msg),

    ) {
        this.is_connected = false;

        this.device_model = _device_model;
        this.slave_id = slave_id;
        this.request_pool_freq_ms = _request_pool_freq_ms;
        this.request_timeout = _request_timeout;
        this.ipc_handler = _ipc_handler;
        this.logger = _logger;

        this.on_serial_port_open = this.on_serial_port_open.bind(this);
        this.on_serial_port_close = this.on_serial_port_close.bind(this);
        this.on_serial_port_open_error = this.on_serial_port_open_error.bind(this);

        this.serial_port = new SerialPort({ path: port_name, baudRate: LtBusDriver.BAUD_RATE, autoOpen: false });
        this.serial_port.on('open', this.on_serial_port_open);
        this.serial_port.on('close', this.on_serial_port_close);
    }

    // events
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

    // static
    static compute_crc16(buffer: Uint8Array): number {
        const CRC16_POLYNOMIAL = new Uint16Array([
            0x0000, 0x1189, 0x2312, 0x329B, 0x4624, 0x57AD, 0x6536, 0x74BF,
            0x8C48, 0x9DC1, 0xAF5A, 0xBED3, 0xCA6C, 0xDBE5, 0xE97E, 0xF8F7,
            0x1081, 0x0108, 0x3393, 0x221A, 0x56A5, 0x472C, 0x75B7, 0x643E,
            0x9CC9, 0x8D40, 0xBFDB, 0xAE52, 0xDAED, 0xCB64, 0xF9FF, 0xE876,
            0x2102, 0x308B, 0x0210, 0x1399, 0x6726, 0x76AF, 0x4434, 0x55BD,
            0xAD4A, 0xBCC3, 0x8E58, 0x9FD1, 0xEB6E, 0xFAE7, 0xC87C, 0xD9F5,
            0x3183, 0x200A, 0x1291, 0x0318, 0x77A7, 0x662E, 0x54B5, 0x453C,
            0xBDCB, 0xAC42, 0x9ED9, 0x8F50, 0xFBEF, 0xEA66, 0xD8FD, 0xC974,
            0x4204, 0x538D, 0x6116, 0x709F, 0x0420, 0x15A9, 0x2732, 0x36BB,
            0xCE4C, 0xDFC5, 0xED5E, 0xFCD7, 0x8868, 0x99E1, 0xAB7A, 0xBAF3,
            0x5285, 0x430C, 0x7197, 0x601E, 0x14A1, 0x0528, 0x37B3, 0x263A,
            0xDECD, 0xCF44, 0xFDDF, 0xEC56, 0x98E9, 0x8960, 0xBBFB, 0xAA72,
            0x6306, 0x728F, 0x4014, 0x519D, 0x2522, 0x34AB, 0x0630, 0x17B9,
            0xEF4E, 0xFEC7, 0xCC5C, 0xDDD5, 0xA96A, 0xB8E3, 0x8A78, 0x9BF1,
            0x7387, 0x620E, 0x5095, 0x411C, 0x35A3, 0x242A, 0x16B1, 0x0738,
            0xFFCF, 0xEE46, 0xDCDD, 0xCD54, 0xB9EB, 0xA862, 0x9AF9, 0x8B70,
            0x8408, 0x9581, 0xA71A, 0xB693, 0xC22C, 0xD3A5, 0xE13E, 0xF0B7,
            0x0840, 0x19C9, 0x2B52, 0x3ADB, 0x4E64, 0x5FED, 0x6D76, 0x7CFF,
            0x9489, 0x8500, 0xB79B, 0xA612, 0xD2AD, 0xC324, 0xF1BF, 0xE036,
            0x18C1, 0x0948, 0x3BD3, 0x2A5A, 0x5EE5, 0x4F6C, 0x7DF7, 0x6C7E,
            0xA50A, 0xB483, 0x8618, 0x9791, 0xE32E, 0xF2A7, 0xC03C, 0xD1B5,
            0x2942, 0x38CB, 0x0A50, 0x1BD9, 0x6F66, 0x7EEF, 0x4C74, 0x5DFD,
            0xB58B, 0xA402, 0x9699, 0x8710, 0xF3AF, 0xE226, 0xD0BD, 0xC134,
            0x39C3, 0x284A, 0x1AD1, 0x0B58, 0x7FE7, 0x6E6E, 0x5CF5, 0x4D7C,
            0xC60C, 0xD785, 0xE51E, 0xF497, 0x8028, 0x91A1, 0xA33A, 0xB2B3,
            0x4A44, 0x5BCD, 0x6956, 0x78DF, 0x0C60, 0x1DE9, 0x2F72, 0x3EFB,
            0xD68D, 0xC704, 0xF59F, 0xE416, 0x90A9, 0x8120, 0xB3BB, 0xA232,
            0x5AC5, 0x4B4C, 0x79D7, 0x685E, 0x1CE1, 0x0D68, 0x3FF3, 0x2E7A,
            0xE70E, 0xF687, 0xC41C, 0xD595, 0xA12A, 0xB0A3, 0x8238, 0x93B1,
            0x6B46, 0x7ACF, 0x4854, 0x59DD, 0x2D62, 0x3CEB, 0x0E70, 0x1FF9,
            0xF78F, 0xE606, 0xD49D, 0xC514, 0xB1AB, 0xA022, 0x92B9, 0x8330,
            0x7BC7, 0x6A4E, 0x58D5, 0x495C, 0x3DE3, 0x2C6A, 0x1EF1, 0x0F78,
        ]);

        let res = 0xffff;
        for (let b of buffer) {
            res = (res >> 8) ^ CRC16_POLYNOMIAL[(res ^ b) & 0xff];
        }
        return (~res) & 0xffff;
    }

    static concat_uint8_arrays(arrays: Uint8Array[]): Uint8Array {
        let total_len = 0;
        for (const arr of arrays) {
            total_len += arr.length;
        }
        const out_arr = new Uint8Array(total_len);
        let offset = 0;
        for (const arr of arrays) {
            out_arr.set(arr, offset);
            offset += arr.length;
        }
        return out_arr;
    }

    private static u16_to_2u8(num: number): Uint8Array {
        const lsb = num & 0xFF;
        const msb = (num >> 8) & 0xFF;
        return new Uint8Array([lsb, msb]);
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

    static decode_f32_seq(f32_seq_buffer: Uint8Array, f32_seq_msg_config: LTBusMsgConfig[]): Result<LTBusDeviceMsg[]> {
        if (f32_seq_msg_config.length !== f32_seq_buffer.length / 4)
            return { err: 'Invalid Float32 Sequence Buffer Size' };

        const device_msg_list: LTBusDeviceMsg[] = [];
        for (let i = 0; i < f32_seq_msg_config.length; i++) {
            const ith_buffer_seg_offset = i * 4;
            const ith_buffer_seg_end = ith_buffer_seg_offset + 4;
            const buffer_seg = f32_seq_buffer.slice(ith_buffer_seg_offset, ith_buffer_seg_end);
            const msg_value = Number(new Float32Array(buffer_seg.buffer)[0].toFixed(2));
            const b64_msg_value = msg_value === -9999 ? '' : btoa(String.fromCharCode.apply(null, Array.from(buffer_seg)));
            device_msg_list.push({
                config: f32_seq_msg_config[i],
                seq_number: -1,
                msg_value: msg_value === -9999 ? NaN : msg_value,
                b64_msg_value,
            });
        }

        return { ok: device_msg_list };
    }

    static decode_u16_seq(u16_seq_buffer: Uint8Array, u16_seq_msg_config: LTBusMsgConfig[]): Result<LTBusDeviceMsg[]> {
        if (u16_seq_msg_config.length !== u16_seq_buffer.length / 2)
            return { err: 'Invalid Uint16 Sequence Buffer Size' };

        const device_msg_list: LTBusDeviceMsg[] = [];
        for (let i = 0; i < u16_seq_msg_config.length; i++) {
            const ith_buffer_seg_offset = i * 2;
            const ith_buffer_seg_end = ith_buffer_seg_offset + 2;
            const buffer_seg = u16_seq_buffer.slice(ith_buffer_seg_offset, ith_buffer_seg_end);
            const msg_value = new Uint16Array(buffer_seg.buffer)[0];
            device_msg_list.push({
                config: u16_seq_msg_config[i],
                seq_number: -1,
                msg_value,
                b64_msg_value: '',
            });
        }

        return { ok: device_msg_list };
    }

    static async async_sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static fmt_packet_hex_str(packet: Uint8Array): string {
        return Array.from(packet).map(x => '0x' + x.toString(16).toUpperCase().padStart(2, '0')).join(' ');
    }

    private async lt_bus_request(request_packet: Uint8Array, response_data_size: number): Promise<Result<Uint8Array>> {
        const response_packet_size = LtBusDriver.REQUEST_PACKET_MIN_SIZE + response_data_size;
        const buffer: number[] = [];
        let __resolve: (value: Result<Uint8Array>) => void = (_x) => { };
        let __iid: NodeJS.Timeout | null = null;
        let __t = 0;
        const __this = this;

        function __pool() {
            __t += __this.request_pool_freq_ms;
            if (__t >= __this.request_timeout) {
                if (__iid)
                    clearInterval(__iid);

                __resolve({ err: 'LT_BUS REQUEST TIMEOUT' });
            }

            let byte = __this.serial_port.read(1);
            if (byte === null)
                return;
            byte = byte[0];
            buffer.push(byte);

            if (buffer.length === response_packet_size) {
                if (__iid)
                    clearInterval(__iid);

                if (buffer[0] === 0x7B && buffer[buffer.length - 1] === 0x7D)
                    __resolve({ ok: Uint8Array.from(buffer) });
                else
                    debugger;
                __resolve({ err: 'Invalid Response Packet Format' });
            }
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

    // API
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

    async read_registers(base_address: number, size: number): Promise<Result<Uint8Array>> {
        const packet_header = new Uint8Array([0x7B, this.slave_id, LtBusFunctionCode.READ]);
        const base_address_bytes = LtBusDriver.u16_to_2u8(base_address);
        const size_bytes = LtBusDriver.u16_to_2u8(size);
        const packet = LtBusDriver.concat_uint8_arrays([packet_header, base_address_bytes, size_bytes]);
        const crc16_bytes = LtBusDriver.u16_to_2u8(LtBusDriver.compute_crc16(packet));
        const packet_to_send = LtBusDriver.concat_uint8_arrays([packet, crc16_bytes, new Uint8Array([0x7D])]);
        return await this.lt_bus_request(packet_to_send, size);
    }

    async write_register(reg_address: number, reg_type: LTBusDataType, value: number): Promise<Result<Uint8Array>> {
        const packet_header = new Uint8Array([0x7B, this.slave_id, LtBusFunctionCode.WRITE]);
        const reg_address_bytes = LtBusDriver.u16_to_2u8(reg_address);
        const [BinaryParser, reg_size] = LtBusDriver.BINARY_PARSERS[reg_type];
        const size_bytes = LtBusDriver.u16_to_2u8(reg_size);
        const data_raw_buffer = new ArrayBuffer(reg_size);
        const data_parsed_buffer = new BinaryParser(data_raw_buffer);
        const data_u8_buffer = new Uint8Array(data_raw_buffer);
        data_parsed_buffer[0] = value;
        const packet = LtBusDriver.concat_uint8_arrays([packet_header, reg_address_bytes, size_bytes, data_u8_buffer]);
        const crc16_bytes = LtBusDriver.u16_to_2u8(LtBusDriver.compute_crc16(packet));
        const packet_to_send = LtBusDriver.concat_uint8_arrays([packet, crc16_bytes, new Uint8Array([0x7D])]);

        return new Promise((resolve, reject) => {
            this.serial_port.write(packet_to_send, err => {
                if (err)
                    reject({ err });
                resolve({ ok: packet_to_send });
            });
        });
    }
};