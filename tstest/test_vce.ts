import { assertEquals, assertExists } from "jsr:@std/assert";

import { VirtualComputeEngine } from '../src/main/vce.ts';
import { DeviceMsg, CHXEquation, CHXScript } from '../src/common/models.ts';
import { test_data_points, TEST_VCE_CONFIG, TEST_CHX_CPS } from './_data.ts';

const DEVICE_MODEL = 'LT-CH000';

Deno.test('VirtualComputeEngine_patch_sequence_number_mismatch', () => {
    const vce = new VirtualComputeEngine(TEST_VCE_CONFIG, TEST_CHX_CPS, (_1, _2) => { }, DEVICE_MODEL);

    // load VCE_CONSTs
    const vce_consts_device_msgs: DeviceMsg[] = [
        {
            config: TEST_VCE_CONFIG[0].msg_type_config,
            seq_number: 0,
            msg_value: 100,
            b64_msg_value: '',
        },
        {
            config: TEST_VCE_CONFIG[1].msg_type_config,
            seq_number: 1,
            msg_value: 2,
            b64_msg_value: '',
        },
    ];
    vce_consts_device_msgs.forEach(dmsg => {
        const vce_res = vce.load_device_msg(dmsg);
        assertExists(vce_res.err);
        assertEquals(vce_res.err, 'Loaded Const into VM Context');
    });

    // load VCE_VARs
    const vce_vars_device_msgs: DeviceMsg[] = [
        {
            config: TEST_VCE_CONFIG[2].msg_type_config,
            seq_number: 2,
            msg_value: 10,
            b64_msg_value: '',
        },
        {
            config: TEST_VCE_CONFIG[3].msg_type_config,
            seq_number: 2,
            msg_value: 12,
            b64_msg_value: '',
        },
        {
            config: TEST_VCE_CONFIG[4].msg_type_config,
            seq_number: 3,
            msg_value: 36,
            b64_msg_value: '',
        },
    ];
    const vce_res_0 = vce.load_device_msg(vce_vars_device_msgs[0]);
    assertExists(vce_res_0.err);
    assertEquals(vce_res_0.err, 'Started New VCE Cycle');

    const vce_res_1 = vce.load_device_msg(vce_vars_device_msgs[1]);
    assertExists(vce_res_1.err);
    assertEquals(vce_res_1.err, 'Loaded Var into VM Context');

    const vce_res_2 = vce.load_device_msg(vce_vars_device_msgs[2]);
    assertExists(vce_res_2.err);
    assertEquals(vce_res_2.err, 'Started New VCE Cycle');
});

Deno.test('VirtualComputeEngine_invalid_MsgType_sequence', () => {
    const vce = new VirtualComputeEngine(TEST_VCE_CONFIG, TEST_CHX_CPS, (_1, _2) => { }, DEVICE_MODEL);

    // load VCE_CONSTs
    const vce_consts_device_msgs: DeviceMsg[] = [
        {
            config: TEST_VCE_CONFIG[0].msg_type_config,
            seq_number: 0,
            msg_value: 100,
            b64_msg_value: '',
        },
        {
            config: TEST_VCE_CONFIG[1].msg_type_config,
            seq_number: 1,
            msg_value: 2,
            b64_msg_value: '',
        },
    ];
    vce_consts_device_msgs.forEach(dmsg => {
        const vce_res = vce.load_device_msg(dmsg);
        assertExists(vce_res.err);
        assertEquals(vce_res.err, 'Loaded Const into VM Context');
    });

    // load VCE_VARs
    const vce_vars_device_msgs: DeviceMsg[] = [
        {
            config: TEST_VCE_CONFIG[2].msg_type_config,
            seq_number: 2,
            msg_value: 10,
            b64_msg_value: '',
        },
        {
            config: TEST_VCE_CONFIG[3].msg_type_config,
            seq_number: 2,
            msg_value: 12,
            b64_msg_value: '',
        },
        {
            config: TEST_VCE_CONFIG[3].msg_type_config,
            seq_number: 2,
            msg_value: 36,
            b64_msg_value: '',
        },
    ];

    const vce_res_0 = vce.load_device_msg(vce_vars_device_msgs[0]);
    assertExists(vce_res_0.err);
    assertEquals(vce_res_0.err, 'Started New VCE Cycle');

    const vce_res_1 = vce.load_device_msg(vce_vars_device_msgs[1]);
    assertExists(vce_res_1.err);
    assertEquals(vce_res_1.err, 'Loaded Var into VM Context');

    const vce_res_2 = vce.load_device_msg(vce_vars_device_msgs[2]);
    assertExists(vce_res_2.err);
    assertEquals(vce_res_2.err, 'Invalid MsgType Sequence');
});

Deno.test('VirtualComputeEngine_success', () => {
    // deno-lint-ignore no-explicit-any
    const tmp_ipc_bus: [string, any][] = [];
    // deno-lint-ignore no-explicit-any
    function test_ipc_handler(channel: string, data: any) {
        tmp_ipc_bus.push([channel, data]);
    }
    const vce = new VirtualComputeEngine(TEST_VCE_CONFIG, TEST_CHX_CPS, test_ipc_handler, DEVICE_MODEL);

    // load VCE_CONSTs
    const vce_consts_device_msgs: DeviceMsg[] = [
        {
            config: TEST_VCE_CONFIG[0].msg_type_config,
            seq_number: 0,
            msg_value: 100,
            b64_msg_value: '',
        },
        {
            config: TEST_VCE_CONFIG[1].msg_type_config,
            seq_number: 1,
            msg_value: 2,
            b64_msg_value: '',
        },
    ];
    vce_consts_device_msgs.forEach(dmsg => {
        const vce_res = vce.load_device_msg(dmsg);
        assertExists(vce_res.err);
        assertEquals(vce_res.err, 'Loaded Const into VM Context');
    });

    // load VCE_VARs
    const vce_vars_device_msgs: DeviceMsg[] = [
        {
            config: TEST_VCE_CONFIG[2].msg_type_config,
            seq_number: 2,
            msg_value: 10,
            b64_msg_value: '',
        },
        {
            config: TEST_VCE_CONFIG[3].msg_type_config,
            seq_number: 2,
            msg_value: 12,
            b64_msg_value: '',
        },
        {
            config: TEST_VCE_CONFIG[4].msg_type_config,
            seq_number: 2,
            msg_value: 36,
            b64_msg_value: '',
        },
    ];

    const vce_res_0 = vce.load_device_msg(vce_vars_device_msgs[0]);
    assertExists(vce_res_0.err);
    assertEquals(vce_res_0.err, 'Started New VCE Cycle');

    const vce_res_1 = vce.load_device_msg(vce_vars_device_msgs[1]);
    assertExists(vce_res_1.err);
    assertEquals(vce_res_1.err, 'Loaded Var into VM Context');

    const vce_res_2 = vce.load_device_msg(vce_vars_device_msgs[2]);
    // validate vm output
    assertExists(vce_res_2.ok);
    assertEquals(vce_res_2.ok, {
        'TEST_CP1': 27.5,
        'TEST_CP2': 2.58,
    });

    // validate ipc bus
    assertEquals(tmp_ipc_bus.length, 2);
    assertEquals(tmp_ipc_bus[0][0], 'LT-CH000_device_msg');
    assertEquals(tmp_ipc_bus[1][0], 'LT-CH000_device_msg');
    assertExists(tmp_ipc_bus[0][1].device_msg);
    assertExists(tmp_ipc_bus[1][1].device_msg);
    assertEquals(tmp_ipc_bus[0][1].device_msg, {
        config: {
            msg_type: 16,
            msg_name: "READ_TEST_CP1",
            data_type: 2,
            size_bytes: 4,
            cfg2: 0,
        },
        seq_number: 2,
        msg_value: 27.5,
        b64_msg_value: "",
    });
    assertEquals(tmp_ipc_bus[1][1].device_msg, {
        config: {
            msg_type: 17,
            msg_name: "READ_TEST_CP2",
            data_type: 2,
            size_bytes: 4,
            cfg2: 0,
        },
        seq_number: 2,
        msg_value: 2.58,
        b64_msg_value: "",
    });
});

Deno.test('VirtualComputeEngine_context_init_success', () => {
    // deno-lint-ignore no-explicit-any
    const tmp_ipc_bus: any[] = [];
    // deno-lint-ignore no-explicit-any
    function test_ipc_handler(channel: string, data: any) {
        tmp_ipc_bus.push([channel, data]);
    }
    const vce = new VirtualComputeEngine(TEST_VCE_CONFIG, TEST_CHX_CPS, test_ipc_handler, DEVICE_MODEL);

    // load VCE_VARs
    const vce_vars_device_msgs: DeviceMsg[] = [
        {
            config: TEST_VCE_CONFIG[2].msg_type_config,
            seq_number: 2,
            msg_value: 10,
            b64_msg_value: '',
        },
        {
            config: TEST_VCE_CONFIG[3].msg_type_config,
            seq_number: 2,
            msg_value: 12,
            b64_msg_value: '',
        },
        {
            config: TEST_VCE_CONFIG[4].msg_type_config,
            seq_number: 2,
            msg_value: 36,
            b64_msg_value: '',
        },
    ];

    const vce_res_0 = vce.load_device_msg(vce_vars_device_msgs[0]);
    assertExists(vce_res_0.err);
    assertEquals(vce_res_0.err, 'Started New VCE Cycle');

    const vce_res_1 = vce.load_device_msg(vce_vars_device_msgs[1]);
    assertExists(vce_res_1.err);
    assertEquals(vce_res_1.err, 'Loaded Var into VM Context');

    const vce_res_2 = vce.load_device_msg(vce_vars_device_msgs[2]);
    // validate vm output
    assertExists(vce_res_2.ok);
    assertEquals(vce_res_2.ok, {
        'TEST_CP1': 27.99,
        'TEST_CP2': 59,
    });

    // validate ipc bus
    assertEquals(tmp_ipc_bus.length, 2);
    assertEquals(tmp_ipc_bus[0][0], 'LT-CH000_device_msg');
    assertEquals(tmp_ipc_bus[1][0], 'LT-CH000_device_msg');
    assertExists(tmp_ipc_bus[0][1].device_msg);
    assertExists(tmp_ipc_bus[1][1].device_msg);
    assertEquals(tmp_ipc_bus[0][1].device_msg, {
        config: {
            msg_type: 16,
            msg_name: "READ_TEST_CP1",
            data_type: 2,
            size_bytes: 4,
            cfg2: 0,
        },
        seq_number: 2,
        msg_value: 27.99,
        b64_msg_value: "",
    });
    assertEquals(tmp_ipc_bus[1][1].device_msg, {
        config: {
            msg_type: 17,
            msg_name: "READ_TEST_CP2",
            data_type: 2,
            size_bytes: 4,
            cfg2: 0,
        },
        seq_number: 2,
        msg_value: 59,
        b64_msg_value: "",
    });
});

Deno.test('VirtualComputeEngine_rc_39218', () => {
    const RC_SN = 39218;
    // deno-lint-ignore no-explicit-any
    const tmp_ipc_bus: any[] = [];
    // deno-lint-ignore no-explicit-any
    function test_ipc_handler(channel: string, data: any) {
        tmp_ipc_bus.push([channel, data]);
    }
    const vce = new VirtualComputeEngine(TEST_VCE_CONFIG, TEST_CHX_CPS, test_ipc_handler, DEVICE_MODEL);

    // load VCE_CONSTs
    const vce_consts_device_msgs: DeviceMsg[] = [
        {
            config: TEST_VCE_CONFIG[0].msg_type_config,
            seq_number: 0,
            msg_value: 100,
            b64_msg_value: '',
        },
        {
            config: TEST_VCE_CONFIG[1].msg_type_config,
            seq_number: 1,
            msg_value: 2,
            b64_msg_value: '',
        },
    ];
    vce_consts_device_msgs.forEach(dmsg => {
        const vce_res = vce.load_device_msg(dmsg);
        assertExists(vce_res.err);
        assertEquals(vce_res.err, 'Loaded Const into VM Context');
    });

    // load VCE_VARs
    const vce_vars_device_msgs: DeviceMsg[] = [
        {
            config: TEST_VCE_CONFIG[2].msg_type_config,
            seq_number: RC_SN,
            msg_value: 10,
            b64_msg_value: '',
        },
        {
            config: TEST_VCE_CONFIG[3].msg_type_config,
            seq_number: RC_SN,
            msg_value: 12,
            b64_msg_value: '',
        },
        {
            config: TEST_VCE_CONFIG[4].msg_type_config,
            seq_number: RC_SN,
            msg_value: 36,
            b64_msg_value: '',
        },
    ];

    const vce_res_0 = vce.load_device_msg(vce_vars_device_msgs[0]);
    assertExists(vce_res_0.err);
    assertEquals(vce_res_0.err, 'Started New VCE Cycle');

    const vce_res_1 = vce.load_device_msg(vce_vars_device_msgs[1]);
    assertExists(vce_res_1.err);
    assertEquals(vce_res_1.err, 'Loaded Var into VM Context');

    const vce_res_2 = vce.load_device_msg(vce_vars_device_msgs[2]);
    // validate vm output
    assertExists(vce_res_2.ok);
    assertEquals(vce_res_2.ok, {
        'TEST_CP1': 27.5,
        'TEST_CP2': 2.58,
    });

    // validate ipc bus
    assertEquals(tmp_ipc_bus.length, 2);
    assertEquals(tmp_ipc_bus[0][0], 'LT-CH000_device_msg');
    assertEquals(tmp_ipc_bus[1][0], 'LT-CH000_device_msg');
    assertExists(tmp_ipc_bus[0][1].device_msg);
    assertExists(tmp_ipc_bus[1][1].device_msg);
    assertEquals(tmp_ipc_bus[0][1].device_msg, {
        config: {
            msg_type: 16,
            msg_name: "READ_TEST_CP1",
            data_type: 2,
            size_bytes: 4,
            cfg2: 0,
        },
        seq_number: RC_SN,
        msg_value: 27.5,
        b64_msg_value: "",
    });
    assertEquals(tmp_ipc_bus[1][1].device_msg, {
        config: {
            msg_type: 17,
            msg_name: "READ_TEST_CP2",
            data_type: 2,
            size_bytes: 4,
            cfg2: 0,
        },
        seq_number: RC_SN,
        msg_value: 2.58,
        b64_msg_value: "",
    });
});

Deno.test('VirtualComputeEngine_compute_chx_equation', () => {
    const chx_eq: CHXEquation = {
        func_name: '',
        args_list: ['arg_1', 'arg_2'],
        expr: 'arg_1 + arg_2',
        result_unit: '',
    };

    let result = VirtualComputeEngine.compute_chx_equation(chx_eq, [5]);
    assertExists(result.err);
    assertEquals(result.err, 'Insufficient Arguments');

    result = VirtualComputeEngine.compute_chx_equation(chx_eq, [5, 4]);
    assertExists(result.ok);
    assertEquals(result.ok, 9);

    chx_eq.expr = 'arg_1 - arg_2';
    result = VirtualComputeEngine.compute_chx_equation(chx_eq, [5, 4]);
    assertExists(result.ok);
    assertEquals(result.ok, 1);
});

Deno.test('VirtualComputeEngine_exec_chx_script_success', () => {
    const chx_script: CHXScript = {
        script_name: '_test_chx_script',
        script_path: '/home/abstract/work/labtronic_software/control_hub_v2/temp/_test_chx_script.js',
    };

    VirtualComputeEngine.exec_chx_script(test_data_points, chx_script).then(res => {
        assertExists(res.ok);
        const ip_pn = res.ok[0].param_name as string;
        const ip_pv = res.ok[0].param_val as number;
        assertEquals(ip_pn, 'lt_ch000_test_control_value');
        assertEquals(ip_pv.toFixed(3), '104.589');
    });
});