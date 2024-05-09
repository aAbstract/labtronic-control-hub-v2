import { LtdDriver_0x87 } from "../src/main/device_drivers/ltd_driver_0x87";
import { MsgTypeConfig, DataType, DeviceMsg } from '../src/common/models';

const TEST_DRIVER_CONFIG: MsgTypeConfig[] = [
    {
        msg_type: 0,
        msg_name: 'PISTON_PUMP',
        data_type: DataType.UINT,
        size_bytes: 4,
    },
    {
        msg_type: 1,
        msg_name: 'PERISTALTIC_PUMP',
        data_type: DataType.UINT,
        size_bytes: 1,
    },
    {
        msg_type: 2,
        msg_name: 'READ_WEIGHT',
        data_type: DataType.FLOAT,
        size_bytes: 4,
    },
    {
        msg_type: 3,
        msg_name: 'READ_TEMPERATURE',
        data_type: DataType.FLOAT,
        size_bytes: 4,
    },
    {
        msg_type: 4,
        msg_name: 'READ_PRESSURE',
        data_type: DataType.FLOAT,
        size_bytes: 4,
    },
    {
        msg_type: 12,
        msg_name: 'WRITE_PISTON_PUMP',
        data_type: DataType.UINT,
        size_bytes: 4,
    },
    {
        msg_type: 13,
        msg_name: 'WRITE_PERISTALTIC_PUMP',
        data_type: DataType.UINT,
        size_bytes: 1,
    },
    {
        msg_type: 15,
        msg_name: 'WRITE_RESET_SCALE',
        data_type: DataType.COMMAND,
        size_bytes: 1,
    },
    {
        msg_type: 14,
        msg_name: 'DEVICE_ERROR',
        data_type: DataType.UINT,
        size_bytes: 1,
    },
];

test('test ltd_driver_0x87.get_msg_type_by_name', () => {
    const ltd_driver_0x87 = new LtdDriver_0x87(TEST_DRIVER_CONFIG);

    // invalid case
    const msg_type_1 = ltd_driver_0x87.get_msg_type_by_name('DUMMY_MSG');
    expect(msg_type_1).toBe(-1);

    // valid case
    const test_config = TEST_DRIVER_CONFIG[2];
    const msg_type_2 = ltd_driver_0x87.get_msg_type_by_name(test_config.msg_name);
    expect(msg_type_2).toBe(test_config.msg_type);
});

test('test ltd_driver_0x87.decode_packet', () => {
    const ltd_driver_0x87 = new LtdDriver_0x87(TEST_DRIVER_CONFIG);

    // too small packet case
    let packet = new Uint8Array([0x00]);
    let result = ltd_driver_0x87.decode_packet(packet);
    expect(result.err).toBe('Packet Too Small');

    // invalid crc16 case
    packet = new Uint8Array([0x87, 0x87, 0x0F, 0x00, 0x00, 0xA2, 0x00, 0x89, 0x41, 0x10, 0x40, 0xA5, 0x1A, 0x0D, 0x0A]);
    result = ltd_driver_0x87.decode_packet(packet);
    expect(result.err.msg).toBe('Invalid CRC-16');

    // version bytes mismatch case
    packet = new Uint8Array([0x87, 0x88, 0x0F, 0x00, 0x00, 0xA2, 0x00, 0x89, 0x41, 0x10, 0x40, 0x78, 0xB7, 0x0D, 0x0A]);
    result = ltd_driver_0x87.decode_packet(packet);
    expect(result.err).toBe('Version Bytes Mismatch');

    // packet length mismatch case
    packet = new Uint8Array([0x87, 0x87, 0x0A, 0x00, 0x00, 0xA2, 0x00, 0x89, 0x41, 0x10, 0x40, 0xBC, 0x68, 0x0D, 0x0A]);
    result = ltd_driver_0x87.decode_packet(packet);
    expect(result.err.msg).toBe('Packet Size Mismatch');

    // data size mismatch case
    packet = new Uint8Array([0x87, 0x87, 0x0F, 0x00, 0x00, 0x10, 0x00, 0x89, 0x41, 0x10, 0x40, 0x80, 0xD0, 0x0D, 0x0A]);
    result = ltd_driver_0x87.decode_packet(packet);
    expect(result.err.msg).toBe('Invalid Data Length Bits');

    // invalid msg type case
    packet = new Uint8Array([0x87, 0x87, 0x0F, 0x00, 0x00, 0x2A, 0x00, 0x89, 0x41, 0x10, 0x40, 0x5E, 0x3E, 0x0D, 0x0A]);
    result = ltd_driver_0x87.decode_packet(packet);
    expect(result.err.msg).toBe('Invalid Msg Type Bits');

    // valid case [READ_WEIGHT]
    packet = new Uint8Array([0x87, 0x87, 0x0F, 0x00, 0x00, 0xA2, 0x00, 0x89, 0x41, 0x10, 0x40, 0xA4, 0x1A, 0x0D, 0x0A]);
    result = ltd_driver_0x87.decode_packet(packet);
    expect(result.ok).toBeDefined();
    let device_msg = result.ok as DeviceMsg;
    device_msg.msg_value = Number(device_msg.msg_value.toFixed(3));
    expect(device_msg).toEqual({
        msg_value: 2.254,
        b64_msg_value: 'iUEQQA==',
        seq_number: 0,
        config: {
            data_type: DataType.FLOAT,
            msg_name: 'READ_WEIGHT',
            msg_type: ltd_driver_0x87.get_msg_type_by_name('READ_WEIGHT'),
            size_bytes: 4,
        },
    });

    // valid case [DEVICE_ERROR]
    packet = new Uint8Array([0x87, 0x87, 0x0C, 0x00, 0x00, 0x4E, 0x00, 0xF0, 0x8C, 0x45, 0x0D, 0x0A]);
    result = ltd_driver_0x87.decode_packet(packet);
    expect(result.ok).toBeDefined();
    device_msg = result.ok as DeviceMsg;
    expect(device_msg).toEqual({
        msg_value: 240,
        b64_msg_value: '8A==',
        seq_number: 0,
        config: {
            data_type: DataType.UINT,
            msg_name: 'DEVICE_ERROR',
            msg_type: ltd_driver_0x87.get_msg_type_by_name('DEVICE_ERROR'),
            size_bytes: 1,
        },
    });
});

test('test ltd_driver_0x87.encode_packet', () => {
    const ltd_driver_0x87 = new LtdDriver_0x87(TEST_DRIVER_CONFIG);

    // invalid msg type case
    const result_1 = ltd_driver_0x87.encode_packet(0, 10, 2.254);
    expect(result_1.err).toBe('Unknown msg_type');

    // encode data packet case
    const target_packet_2 = new Uint8Array([0x87, 0x87, 0x0F, 0x00, 0x00, 0xA2, 0x00, 0x89, 0x41, 0x10, 0x40, 0xA4, 0x1A, 0x0D, 0x0A]);
    const result_2 = ltd_driver_0x87.encode_packet(0, ltd_driver_0x87.get_msg_type_by_name('READ_WEIGHT'), 2.254);
    expect(result_2.ok).toBeDefined();
    expect(LtdDriver_0x87.cmp_buffers(target_packet_2, result_2.ok as Uint8Array)).toBe(true);

    // encode command packet case
    const target_packet_3 = new Uint8Array([0x87, 0x87, 0x0C, 0x00, 0x00, 0xCF, 0x00, 0xFF, 0x4B, 0xEB, 0x0D, 0x0A]);
    const result_3 = ltd_driver_0x87.encode_packet(0, ltd_driver_0x87.get_msg_type_by_name('WRITE_RESET_SCALE'), 0xFF);
    expect(result_3.ok).toBeDefined();
    expect(LtdDriver_0x87.cmp_buffers(target_packet_3, result_3.ok as Uint8Array)).toBe(true);
});