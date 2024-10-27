import { assertEquals, assertExists } from "jsr:@std/assert";

import { DeviceMsg } from "../src/common/models.ts";
import { LtdDriverFloatSequence } from "../src/main/device_drivers/ltd_driver_fltsq.ts";
import { TEST_LT_RE600_PACKET, TEST_LT_RE600_PACKET_VALUES, LT_RE600_DRIVER_CONFIG } from "./_data.ts";

Deno.test('lt_re600_decode_packet.', () => {
    const lt_re600_driver = new LtdDriverFloatSequence([0x99, 0x99], LT_RE600_DRIVER_CONFIG);
    const lt_re600_device_msg_list_res = lt_re600_driver.decode_packet(TEST_LT_RE600_PACKET);
    assertExists(lt_re600_device_msg_list_res.ok);
    const lt_re600_device_msg_list = lt_re600_device_msg_list_res.ok as DeviceMsg[];
    lt_re600_device_msg_list.forEach((device_msg, idx) => {
        assertEquals(device_msg.config, LT_RE600_DRIVER_CONFIG[idx]);
        assertEquals(device_msg.msg_value, TEST_LT_RE600_PACKET_VALUES[idx]);
    });
})