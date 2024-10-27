import { assertEquals, assertExists } from "jsr:@std/assert";

import { LtdDriver } from "../src/main/device_drivers/ltd_driver.ts";
import { DataType, DeviceMsg } from '../src/common/models.ts';
import { TEST_DRIVER_CONFIG } from "./_data.ts";

Deno.test('ltd_driver_0x87.get_msg_type_by_name', () => {
    const ltd_driver_0x87 = new LtdDriver([0x87, 0x87], TEST_DRIVER_CONFIG);

    // invalid case
    const msg_type_1 = ltd_driver_0x87.get_msg_type_by_name('DUMMY_MSG');
    assertEquals(msg_type_1, -1);

    // valid case
    const test_config = TEST_DRIVER_CONFIG[2];
    const msg_type_2 = ltd_driver_0x87.get_msg_type_by_name(test_config.msg_name);
    assertEquals(msg_type_2, test_config.msg_type);
});

Deno.test('ltd_driver_0x87.decode_packet', () => {
    const ltd_driver_0x87 = new LtdDriver([0x87, 0x87], TEST_DRIVER_CONFIG);

    // too small packet case
    let packet = new Uint8Array([0x00]);
    let result = ltd_driver_0x87.decode_packet(packet);
    assertEquals(result.err, 'Packet Too Small');

    // invalid crc16 case
    packet = new Uint8Array([0x87, 0x87, 0x0F, 0x00, 0x00, 0xA2, 0x00, 0x89, 0x41, 0x10, 0x40, 0xA5, 0x1A, 0x0D, 0x0A]);
    result = ltd_driver_0x87.decode_packet(packet);
    assertEquals(result.err.msg, 'Invalid CRC-16');

    // invalid version bytes
    packet = new Uint8Array([0x87, 0x88, 0x0F, 0x00, 0x00, 0xA2, 0x00, 0x89, 0x41, 0x10, 0x40, 0x78, 0xB7, 0x0D, 0x0A]);
    result = ltd_driver_0x87.decode_packet(packet);
    assertEquals(result.err, 'Invalid Version Bytes');

    // packet length mismatch case
    packet = new Uint8Array([0x87, 0x87, 0x0A, 0x00, 0x00, 0xA2, 0x00, 0x89, 0x41, 0x10, 0x40, 0xBC, 0x68, 0x0D, 0x0A]);
    result = ltd_driver_0x87.decode_packet(packet);
    assertEquals(result.err.msg, 'Invalid Packet Size Byte');

    // data size mismatch case
    packet = new Uint8Array([0x87, 0x87, 0x0F, 0x00, 0x00, 0x10, 0x00, 0x89, 0x41, 0x10, 0x40, 0x80, 0xD0, 0x0D, 0x0A]);
    result = ltd_driver_0x87.decode_packet(packet);
    assertEquals(result.err.msg, 'Invalid Data Length Bits');

    // invalid msg type case
    packet = new Uint8Array([0x87, 0x87, 0x0F, 0x00, 0x00, 0x2A, 0x00, 0x89, 0x41, 0x10, 0x40, 0x5E, 0x3E, 0x0D, 0x0A]);
    result = ltd_driver_0x87.decode_packet(packet);
    assertEquals(result.err.msg, 'Invalid Msg Type Bits');

    // valid case [READ_WEIGHT]
    packet = new Uint8Array([0x87, 0x87, 0x0F, 0x00, 0x00, 0xA2, 0x00, 0x89, 0x41, 0x10, 0x40, 0xA4, 0x1A, 0x0D, 0x0A]);
    result = ltd_driver_0x87.decode_packet(packet);
    assertExists(result.ok);
    let [device_msg] = result.ok as DeviceMsg[];
    device_msg.msg_value = Number(device_msg.msg_value.toFixed(3));
    assertEquals(device_msg, {
        config: {
            data_type: DataType.FLOAT,
            msg_name: 'READ_WEIGHT',
            msg_type: ltd_driver_0x87.get_msg_type_by_name('READ_WEIGHT'),
            size_bytes: 4,
            cfg2: 0,
        },
        seq_number: 0,
        msg_value: 2.254,
        b64_msg_value: 'iUEQQA==',
    });

    // valid case [DEVICE_ERROR]
    packet = new Uint8Array([0x87, 0x87, 0x0C, 0x00, 0x00, 0x4E, 0x00, 0xF0, 0x8C, 0x45, 0x0D, 0x0A]);
    result = ltd_driver_0x87.decode_packet(packet);
    assertExists(result.ok);
    [device_msg] = result.ok as DeviceMsg[];
    assertEquals(device_msg, {
        config: {
            data_type: DataType.UINT,
            msg_name: 'DEVICE_ERROR',
            msg_type: ltd_driver_0x87.get_msg_type_by_name('DEVICE_ERROR'),
            size_bytes: 1,
            cfg2: 0,
        },
        seq_number: 0,
        msg_value: 240,
        b64_msg_value: '8A==',
    });
});

Deno.test('ltd_driver_0x87.decode_packet_rc_39218_READ_PRESSURE', () => {
    const ltd_driver_0x87 = new LtdDriver([0x87, 0x87], TEST_DRIVER_CONFIG);
    const packet = new Uint8Array([135, 135, 15, 50, 153, 164, 0, 242, 195, 178, 66, 13, 10, 13, 10]);
    const result = ltd_driver_0x87.decode_packet(packet);
    assertExists(result.ok);
    const [device_msg] = result.ok as DeviceMsg[];
    device_msg.msg_value = Number(device_msg.msg_value.toFixed(3));
    assertEquals(device_msg, {
        config: {
            data_type: DataType.FLOAT,
            msg_name: 'READ_PRESSURE',
            msg_type: ltd_driver_0x87.get_msg_type_by_name('READ_PRESSURE'),
            size_bytes: 4,
            cfg2: 0,
        },
        seq_number: 39218,
        msg_value: 89.383,
        b64_msg_value: '8sOyQg==',
    });
});

Deno.test('ltd_driver_0x87.encode_packet', () => {
    const ltd_driver_0x87 = new LtdDriver([0x87, 0x87], TEST_DRIVER_CONFIG);

    // invalid msg type case
    const result_1 = ltd_driver_0x87.encode_packet(0, 10, 2.254);
    assertEquals(result_1.err, 'Unknown msg_type');

    // encode data packet case
    const target_packet_2 = new Uint8Array([0x87, 0x87, 0x0F, 0x00, 0x00, 0xA2, 0x00, 0x89, 0x41, 0x10, 0x40, 0xA4, 0x1A, 0x0D, 0x0A]);
    const result_2 = ltd_driver_0x87.encode_packet(0, ltd_driver_0x87.get_msg_type_by_name('READ_WEIGHT'), 2.254);
    assertExists(result_2.ok);
    assertEquals(LtdDriver.cmp_buffers(target_packet_2, result_2.ok as Uint8Array), true);

    // encode command packet case
    const target_packet_3 = new Uint8Array([0x87, 0x87, 0x0C, 0x00, 0x00, 0xCF, 0x00, 0xFF, 0x4B, 0xEB, 0x0D, 0x0A]);
    const result_3 = ltd_driver_0x87.encode_packet(0, ltd_driver_0x87.get_msg_type_by_name('WRITE_RESET_SCALE'), 0xFF);
    assertExists(result_3.ok);
    assertEquals(LtdDriver.cmp_buffers(target_packet_3, result_3.ok as Uint8Array), true);
});