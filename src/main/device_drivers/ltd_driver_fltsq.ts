import { LtdDriver } from "./ltd_driver";
import { ILtdDriver } from "../../common/models";
import { MsgTypeConfig, Result, DeviceMsg, DataType } from "../../common/models";

export class LtdDriverFloatSequence implements ILtdDriver {
    private static readonly DATA_START = 3;

    protocol_version: [number, number];
    driver_config: MsgTypeConfig[];
    private packet_size: number;

    constructor(_protocol_version: [number, number], _driver_config: MsgTypeConfig[]) {
        this.protocol_version = _protocol_version;
        this.driver_config = _driver_config;
        this.packet_size = 7 + _driver_config.length * 4;
    }

    encode_packet(_msg_seq_number: number, _msg_type: number, _msg_value: number): Result<Uint8Array> {
        throw new Error('Not Implemented');
    }

    decode_packet(packet: Uint8Array): Result<DeviceMsg[]> {
        // check packet size
        if (packet.length !== this.packet_size)
            return { err: 'Invalid Packet Size' };
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

        // check crc16
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

        // decode data payload
        const device_msg_list: DeviceMsg[] = [];
        for (let i = 0; i < this.driver_config.length; i++) {
            const ith_buffer_seg_offset = LtdDriverFloatSequence.DATA_START + i * 4;
            const ith_buffer_seg_end = ith_buffer_seg_offset + 4;
            const buffer_seg = packet.slice(ith_buffer_seg_offset, ith_buffer_seg_end);
            const msg_value_res = LtdDriver.bin_parse(buffer_seg, DataType.FLOAT);
            if (msg_value_res.err)
                return { err: msg_value_res.err }
            const msg_value = Number(msg_value_res.ok?.toFixed(2));
            const b64_msg_value = btoa(String.fromCharCode.apply(null, Array.from(buffer_seg)));
            device_msg_list.push({
                config: this.driver_config[i],
                seq_number: 0,
                msg_value,
                b64_msg_value,
            });
        }

        return { ok: device_msg_list };
    }
};