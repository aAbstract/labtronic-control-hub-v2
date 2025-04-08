import { Result, DataType, MsgTypeConfig, DeviceMsg, ILtdDriver } from '../../common/models';

export class LtdDriver implements ILtdDriver {
    // 4(start, end) + length + 2(seq_number) + 2(cfg) + 2(crc)
    private static readonly PACKET_MIN_SIZE = 11;
    private static readonly DATA_START = 7;

    protocol_version: [number, number];
    private driver_msg_type_config_map: any = {};

    // for search optimization
    private msg_type_set: Set<number>;
    private msg_name_set: Set<string>;
    private data_type_set: Set<number>;

    constructor(_protocol_version: [number, number], _driver_msg_types: MsgTypeConfig[]) {
        this.protocol_version = _protocol_version;
        this.msg_type_set = new Set(_driver_msg_types.map(x => x.msg_type));
        this.msg_name_set = new Set(_driver_msg_types.map(x => x.msg_name));
        _driver_msg_types.forEach(config => this.driver_msg_type_config_map[config.msg_type] = config);
        this.data_type_set = new Set(Object.values(DataType).filter(x => typeof x === 'number')) as Set<number>;
    }

    private static get_binary_parser(size_bytes: number, data_type: DataType): Result<any> {
        const PARSERS_MAP = {
            1: {
                [DataType.INT]: Int8Array,
                [DataType.UINT]: Uint8Array,
                [DataType.COMMAND]: Uint8Array,
            },
            2: {
                [DataType.INT]: Int16Array,
                [DataType.UINT]: Uint16Array,
            },
            4: {
                [DataType.INT]: Int32Array,
                [DataType.UINT]: Uint32Array,
                [DataType.FLOAT]: Float32Array,
            },
            8: {
                [DataType.INT]: BigInt64Array,
                [DataType.UINT]: BigUint64Array,
                [DataType.FLOAT]: Float64Array,
            },
        };

        if (!Object.keys(PARSERS_MAP).includes(String(size_bytes)))
            return { err: `Data Size: ${size_bytes} Bytes is not Supported` }
        const map_lvl_2 = PARSERS_MAP[size_bytes];
        if (!Object.keys(map_lvl_2).includes(String(data_type)))
            return { err: `No Binary Parser was Found for: data_type=${data_type}, size_bytes=${size_bytes}` };
        return { ok: PARSERS_MAP[size_bytes][data_type] };
    }

    private static bin_byte(byte: number): string {
        const _bin_byte = byte.toString(2);
        const padded_bin_byte = _bin_byte.padStart(8, '0');
        return padded_bin_byte;
    }

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
        for (let b of buffer)
            res = (res >> 8) ^ CRC16_POLYNOMIAL[(res ^ b) & 0xff];

        return (~res) & 0xffff;
    }

    static bin_parse(buffer: Uint8Array, data_type: DataType): Result<number> {
        if (data_type === DataType.FLOAT && (buffer.length === 1 || buffer.length === 2))
            return { err: `Can not Parse Buffer of Size [${buffer.length}] to FLOAT` };

        const bin_parser_res = LtdDriver.get_binary_parser(buffer.length, data_type);
        if (bin_parser_res.err)
            return bin_parser_res;
        const bin_parser = bin_parser_res.ok;

        const parsed_value: number = new bin_parser(buffer.buffer)[0];
        return { ok: parsed_value };
    }

    private static u16_to_2u8(num: number): Result<Uint8Array> {
        if (num < 0 || num > 65535)
            return { err: 'Number Is not Valid u16' };

        const lsb = num & 0xFF;
        const msb = (num >> 8) & 0xFF;
        return { ok: new Uint8Array([lsb, msb]) };
    }

    private gen_cfg1(data_type: DataType, size_bytes: number, msg_type: number): Result<number> {
        // data type bits
        const data_type_bits = data_type.toString(2).padStart(2, '0');

        // data length bits
        if (LtdDriver.get_binary_parser(size_bytes, DataType.INT).err)
            return { err: 'Invalid Data Length Bits' };
        const data_length_bits = Math.log2(size_bytes).toString(2).padStart(2, '0');

        // msg type bits
        if (!this.msg_type_set.has(msg_type))
            return { err: 'Invalid Msg Type Bits' };
        const msg_type_bits = msg_type.toString(2).padStart(4, '0');

        const cfg1_bits = data_type_bits + data_length_bits + msg_type_bits;
        return { ok: parseInt(cfg1_bits, 2) };
    }

    static concat_uint8_arrays(arrays: Uint8Array[]): Uint8Array {
        let total_len = 0;
        for (const arr of arrays)
            total_len += arr.length;

        const out_arr = new Uint8Array(total_len);
        let offset = 0;
        for (const arr of arrays) {
            out_arr.set(arr, offset);
            offset += arr.length;
        }
        return out_arr;
    }

    static gen_data_payload(data_type: DataType, size_bytes: number, msg_value: number): Result<Uint8Array> {
        // data length bits
        const bin_parser_res = LtdDriver.get_binary_parser(size_bytes, data_type);
        if (bin_parser_res.err)
            return bin_parser_res;

        const parser = bin_parser_res.ok;
        const raw_buffer = new ArrayBuffer(size_bytes);
        const data_buffer = new parser(raw_buffer);
        const ui8_buffer = new Uint8Array(raw_buffer);
        data_buffer[0] = msg_value;
        return { ok: ui8_buffer };
    }

    static cmp_buffers(buffer_1: Uint8Array, buffer_2: Uint8Array): boolean {
        if (buffer_1.length !== buffer_2.length)
            return false;
        for (let i = 0; i < buffer_1.length; i++)
            if (buffer_1[i] !== buffer_2[i])
                return false;
        return true;
    }

    /** do not use this function extensively, complexity = O(N) */
    get_msg_type_by_name(msg_name: string): number {
        if (!this.msg_name_set.has(msg_name))
            return -1;
        const msg_type_config_list = Object.values(this.driver_msg_type_config_map) as MsgTypeConfig[];
        const target_config = msg_type_config_list.find(x => x.msg_name === msg_name);
        if (!target_config)
            return -1;
        return target_config.msg_type;
    }

    encode_packet(msg_seq_number: number, msg_type: number, msg_value: number): Result<Uint8Array> {
        if (!this.msg_type_set.has(msg_type))
            return { err: 'Unknown msg_type' };

        const { size_bytes, data_type, cfg2 } = this.driver_msg_type_config_map[msg_type] as MsgTypeConfig;
        const start_seg = new Uint8Array([this.protocol_version[0], this.protocol_version[1], (LtdDriver.PACKET_MIN_SIZE + size_bytes)]);

        const sn_res = LtdDriver.u16_to_2u8(msg_seq_number);
        if (sn_res.err)
            return { err: sn_res.err };
        const seq_number_seg = sn_res.ok as Uint8Array;

        const cfg1_res = this.gen_cfg1(data_type, size_bytes, msg_type);
        if (cfg1_res.err)
            return { err: cfg1_res.err };
        const cfg_seg = new Uint8Array([cfg1_res.ok as number, cfg2]);

        const data_payload_res = LtdDriver.gen_data_payload(data_type, size_bytes, msg_value);
        if (data_payload_res.err)
            return { err: data_payload_res.err };
        const data_payload = data_payload_res.ok as Uint8Array;

        const seg_1 = LtdDriver.concat_uint8_arrays([start_seg, seq_number_seg, cfg_seg, data_payload]);
        // compute crc16
        const crc16 = LtdDriver.compute_crc16(seg_1);
        const crc16_res = LtdDriver.u16_to_2u8(crc16);
        if (crc16_res.err)
            return { err: crc16_res.err };
        const crc16_bytes = crc16_res.ok as Uint8Array;
        // construct final packet
        const end_seg = new Uint8Array([0x0D, 0x0A]);
        const packet = LtdDriver.concat_uint8_arrays([seg_1, crc16_bytes, end_seg]);
        return { ok: packet }
    }

    decode_packet(packet: Uint8Array): Result<DeviceMsg[]> {
        // check packet size
        if (packet.length <= LtdDriver.PACKET_MIN_SIZE)
            return { err: 'Packet Too Small' };
        if (packet.length !== packet[2])
            return {
                err: {
                    msg: 'Invalid Packet Size Byte',
                    detail: `packet[2]=${packet[2]}, packet.length=${packet.length}`,
                }
            };

        // check packet header
        if (this.protocol_version[0] !== packet[0] || this.protocol_version[1] !== packet[1])
            return { err: 'Invalid Version Bytes' };

        // crc16 check
        const packet_crc16_bytes = packet.slice(packet.length - 4, packet.length - 2);
        const packet_crc16 = new Uint16Array(packet_crc16_bytes.buffer)[0];
        const computed_crc16 = LtdDriver.compute_crc16(packet.slice(0, packet.length - 4));
        if (packet_crc16 !== computed_crc16)
            return {
                err: {
                    msg: 'Invalid CRC-16',
                    detail: `packet_crc16=${packet_crc16}, computed_crc16=${computed_crc16}`,
                }
            };

        // packet sequence number
        const seq_number_bytes = packet.slice(3, 5);
        const sn_bin_parse_res = LtdDriver.bin_parse(seq_number_bytes, DataType.UINT);
        if (sn_bin_parse_res.err)
            return { err: sn_bin_parse_res.err };
        let device_msg = { config: {} } as DeviceMsg;
        device_msg.seq_number = sn_bin_parse_res.ok as number;

        // decode config byte 1
        const cfg1_bits = LtdDriver.bin_byte(packet[5]);
        // data_type
        const data_type_bits = cfg1_bits.slice(0, 2);
        const data_type = parseInt(data_type_bits, 2);
        if (!this.data_type_set.has(data_type))
            return {
                err: {
                    msg: 'Invalid Data Type Bits',
                    detail: `data_type_bits=${data_type_bits}`,
                }
            };
        device_msg.config.data_type = data_type;
        // data_length
        const size_bytes_bits = cfg1_bits.slice(2, 4);
        const size_bytes = 2 ** parseInt(size_bytes_bits, 2);
        if (size_bytes !== (packet.length - LtdDriver.PACKET_MIN_SIZE))
            return {
                err: {
                    msg: 'Invalid Data Length Bits',
                    detail: `data_length_bits=${size_bytes}, Packet Data Size: ${packet.length - LtdDriver.PACKET_MIN_SIZE}`,
                }
            };
        device_msg.config.size_bytes = size_bytes;
        // msg_type
        const msg_type_bits = cfg1_bits.slice(4, 8);
        const msg_type = parseInt(msg_type_bits, 2);
        if (!this.msg_type_set.has(msg_type))
            return {
                err: {
                    msg: 'Invalid Msg Type Bits',
                    detail: `msg_type_bits=${msg_type_bits}`,
                }
            };
        device_msg.config.msg_type = msg_type;
        device_msg.config.msg_name = this.driver_msg_type_config_map[msg_type].msg_name;

        // decode config byte 2
        device_msg.config.cfg2 = packet[6];

        // parse data payload
        const data_payload = packet.slice(LtdDriver.DATA_START, LtdDriver.DATA_START + size_bytes);
        // base64 encode data payload
        device_msg.b64_msg_value = btoa(String.fromCharCode.apply(null, Array.from(data_payload)));
        const data_payload_bin_parse_res = LtdDriver.bin_parse(data_payload, data_type);
        if (data_payload_bin_parse_res.err)
            return { err: data_payload_bin_parse_res.err };
        device_msg.msg_value = data_payload_bin_parse_res.ok as number;
        return { ok: [device_msg] };
    }
}