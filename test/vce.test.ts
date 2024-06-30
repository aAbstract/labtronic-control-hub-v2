import { VirtualComputeEngine } from '../src/main/vce';
import { DataType, VceParamConfig, VceParamType, DeviceMsg, CHXComputedParam, CHXEquation } from '../src/common/models';

const TEST_VCE_CONFIG: VceParamConfig[] = [
    {
        msg_type_config: {
            msg_type: 0,
            msg_name: 'PISTON_PUMP',
            data_type: DataType.UINT,
            size_bytes: 4,
        },
        param_symbol: '$I',
        param_type: VceParamType.VCE_CONST,
        const_init_value: 1,
        desc: 'Current Piston Pump Control Parameter',
    },
    {
        msg_type_config: {
            msg_type: 1,
            msg_name: 'PERISTALTIC_PUMP',
            data_type: DataType.UINT,
            size_bytes: 1,
        },
        param_symbol: '$E',
        param_type: VceParamType.VCE_CONST,
        const_init_value: 1,
        desc: 'Current Peristaltic Pump Control Parameter',
    },
    {
        msg_type_config: {
            msg_type: 2,
            msg_name: 'READ_WEIGHT',
            data_type: DataType.FLOAT,
            size_bytes: 4,
        },
        param_symbol: '$W',
        param_type: VceParamType.VCE_VAR,
        desc: 'Weight of the Liquid in the Tank',
    },
    {
        msg_type_config: {
            msg_type: 3,
            msg_name: 'READ_TEMPERATURE',
            data_type: DataType.FLOAT,
            size_bytes: 4,
        },
        param_symbol: '$T',
        param_type: VceParamType.VCE_VAR,
        desc: 'Temperature of the Liquid in the Tank',
    },
    {
        msg_type_config: {
            msg_type: 4,
            msg_name: 'READ_PRESSURE',
            data_type: DataType.FLOAT,
            size_bytes: 4,
        },
        param_symbol: '$P',
        param_type: VceParamType.VCE_VAR,
        desc: 'Pressure of the Liquid in the Tank',
    },
];

const TEST_CHX_CPS: CHXComputedParam[] = [
    {
        param_name: "TEST_CP1",
        expr: "$W + $T + Math.sqrt($P) - ($I / $E) * 0.01",
    },
    {
        param_name: "TEST_CP2",
        expr: "$E + (($W + $T + $P) / $I)",
    },
];

const DEVICE_MODEL = 'LT-CH000';

test('VirtualComputeEngine_patch_sequence_number_mismatch', () => {
    const vce = new VirtualComputeEngine(TEST_VCE_CONFIG, TEST_CHX_CPS, (_1, _2) => { }, DEVICE_MODEL);

    // load VCE_CONSTs
    const vce_consts_device_msgs: DeviceMsg[] = [
        {
            seq_number: 0,
            msg_value: 100,
            b64_msg_value: '',
            config: TEST_VCE_CONFIG[0].msg_type_config,
        },
        {
            seq_number: 1,
            msg_value: 2,
            b64_msg_value: '',
            config: TEST_VCE_CONFIG[1].msg_type_config,
        },
    ];
    vce_consts_device_msgs.forEach(dmsg => {
        const vce_res = vce.load_device_msg(dmsg);
        expect(vce_res.err).toBeDefined();
        expect(vce_res.err).toBe('Loaded Const into VM Context');
    });

    // load VCE_VARs
    const vce_vars_device_msgs: DeviceMsg[] = [
        {
            seq_number: 2,
            msg_value: 10,
            b64_msg_value: '',
            config: TEST_VCE_CONFIG[2].msg_type_config,
        },
        {
            seq_number: 2,
            msg_value: 12,
            b64_msg_value: '',
            config: TEST_VCE_CONFIG[3].msg_type_config,
        },
        {
            seq_number: 3,
            msg_value: 36,
            b64_msg_value: '',
            config: TEST_VCE_CONFIG[4].msg_type_config,
        },
    ];
    const vce_res_0 = vce.load_device_msg(vce_vars_device_msgs[0]);
    expect(vce_res_0.err).toBeDefined();
    expect(vce_res_0.err).toBe('Started New VCE Cycle');

    const vce_res_1 = vce.load_device_msg(vce_vars_device_msgs[1]);
    expect(vce_res_1.err).toBeDefined();
    expect(vce_res_1.err).toBe('Loaded Var into VM Context');

    const vce_res_2 = vce.load_device_msg(vce_vars_device_msgs[2]);
    expect(vce_res_2.err).toBeDefined();
    expect(vce_res_2.err).toBe('Started New VCE Cycle');
});

test('VirtualComputeEngine_invalid_MsgType_sequence', () => {
    const vce = new VirtualComputeEngine(TEST_VCE_CONFIG, TEST_CHX_CPS, (_1, _2) => { }, DEVICE_MODEL);

    // load VCE_CONSTs
    const vce_consts_device_msgs: DeviceMsg[] = [
        {
            seq_number: 0,
            msg_value: 100,
            b64_msg_value: '',
            config: TEST_VCE_CONFIG[0].msg_type_config,
        },
        {
            seq_number: 1,
            msg_value: 2,
            b64_msg_value: '',
            config: TEST_VCE_CONFIG[1].msg_type_config,
        },
    ];
    vce_consts_device_msgs.forEach(dmsg => {
        const vce_res = vce.load_device_msg(dmsg);
        expect(vce_res.err).toBeDefined();
        expect(vce_res.err).toBe('Loaded Const into VM Context');
    });

    // load VCE_VARs
    const vce_vars_device_msgs: DeviceMsg[] = [
        {
            seq_number: 2,
            msg_value: 10,
            b64_msg_value: '',
            config: TEST_VCE_CONFIG[2].msg_type_config,
        },
        {
            seq_number: 2,
            msg_value: 12,
            b64_msg_value: '',
            config: TEST_VCE_CONFIG[3].msg_type_config,
        },
        {
            seq_number: 2,
            msg_value: 36,
            b64_msg_value: '',
            config: TEST_VCE_CONFIG[3].msg_type_config,
        },
    ];

    const vce_res_0 = vce.load_device_msg(vce_vars_device_msgs[0]);
    expect(vce_res_0.err).toBeDefined();
    expect(vce_res_0.err).toBe('Started New VCE Cycle');

    const vce_res_1 = vce.load_device_msg(vce_vars_device_msgs[1]);
    expect(vce_res_1.err).toBeDefined();
    expect(vce_res_1.err).toBe('Loaded Var into VM Context');

    const vce_res_2 = vce.load_device_msg(vce_vars_device_msgs[2]);
    expect(vce_res_2.err).toBeDefined();
    expect(vce_res_2.err).toBe('Invalid MsgType Sequence');
});

test('VirtualComputeEngine_success', () => {
    const tmp_ipc_bus: any[] = [];
    function test_ipc_handler(channel: string, data: any) {
        tmp_ipc_bus.push([channel, data]);
    }
    const vce = new VirtualComputeEngine(TEST_VCE_CONFIG, TEST_CHX_CPS, test_ipc_handler, DEVICE_MODEL);

    // load VCE_CONSTs
    const vce_consts_device_msgs: DeviceMsg[] = [
        {
            seq_number: 0,
            msg_value: 100,
            b64_msg_value: '',
            config: TEST_VCE_CONFIG[0].msg_type_config,
        },
        {
            seq_number: 1,
            msg_value: 2,
            b64_msg_value: '',
            config: TEST_VCE_CONFIG[1].msg_type_config,
        },
    ];
    vce_consts_device_msgs.forEach(dmsg => {
        const vce_res = vce.load_device_msg(dmsg);
        expect(vce_res.err).toBeDefined();
        expect(vce_res.err).toBe('Loaded Const into VM Context');
    });

    // load VCE_VARs
    const vce_vars_device_msgs: DeviceMsg[] = [
        {
            seq_number: 2,
            msg_value: 10,
            b64_msg_value: '',
            config: TEST_VCE_CONFIG[2].msg_type_config,
        },
        {
            seq_number: 2,
            msg_value: 12,
            b64_msg_value: '',
            config: TEST_VCE_CONFIG[3].msg_type_config,
        },
        {
            seq_number: 2,
            msg_value: 36,
            b64_msg_value: '',
            config: TEST_VCE_CONFIG[4].msg_type_config,
        },
    ];

    const vce_res_0 = vce.load_device_msg(vce_vars_device_msgs[0]);
    expect(vce_res_0.err).toBeDefined();
    expect(vce_res_0.err).toBe('Started New VCE Cycle');

    const vce_res_1 = vce.load_device_msg(vce_vars_device_msgs[1]);
    expect(vce_res_1.err).toBeDefined();
    expect(vce_res_1.err).toBe('Loaded Var into VM Context');

    const vce_res_2 = vce.load_device_msg(vce_vars_device_msgs[2]);
    // validate vm output
    expect(vce_res_2.ok).toBeDefined();
    expect(vce_res_2.ok).toEqual({
        'TEST_CP1': 27.5,
        'TEST_CP2': 2.58,
    });

    // validate ipc bus
    expect(tmp_ipc_bus.length).toBe(2);
    expect(tmp_ipc_bus[0][0]).toBe('LT-CH000_device_msg');
    expect(tmp_ipc_bus[1][0]).toBe('LT-CH000_device_msg');
    expect(tmp_ipc_bus[0][1].device_msg).toBeDefined();
    expect(tmp_ipc_bus[1][1].device_msg).toBeDefined();
    expect(tmp_ipc_bus[0][1].device_msg).toEqual({
        seq_number: 2,
        msg_value: 27.5,
        b64_msg_value: "",
        config: {
            msg_type: 16,
            msg_name: "READ_TEST_CP1",
            data_type: 2,
            size_bytes: 4,
        },
    });
    expect(tmp_ipc_bus[1][1].device_msg).toEqual({
        seq_number: 2,
        msg_value: 2.58,
        b64_msg_value: "",
        config: {
            msg_type: 17,
            msg_name: "READ_TEST_CP2",
            data_type: 2,
            size_bytes: 4,
        },
    });
});

test('VirtualComputeEngine_context_init_success', () => {
    const tmp_ipc_bus: any[] = [];
    function test_ipc_handler(channel: string, data: any) {
        tmp_ipc_bus.push([channel, data]);
    }
    const vce = new VirtualComputeEngine(TEST_VCE_CONFIG, TEST_CHX_CPS, test_ipc_handler, DEVICE_MODEL);

    // load VCE_VARs
    const vce_vars_device_msgs: DeviceMsg[] = [
        {
            seq_number: 2,
            msg_value: 10,
            b64_msg_value: '',
            config: TEST_VCE_CONFIG[2].msg_type_config,
        },
        {
            seq_number: 2,
            msg_value: 12,
            b64_msg_value: '',
            config: TEST_VCE_CONFIG[3].msg_type_config,
        },
        {
            seq_number: 2,
            msg_value: 36,
            b64_msg_value: '',
            config: TEST_VCE_CONFIG[4].msg_type_config,
        },
    ];

    const vce_res_0 = vce.load_device_msg(vce_vars_device_msgs[0]);
    expect(vce_res_0.err).toBeDefined();
    expect(vce_res_0.err).toBe('Started New VCE Cycle');

    const vce_res_1 = vce.load_device_msg(vce_vars_device_msgs[1]);
    expect(vce_res_1.err).toBeDefined();
    expect(vce_res_1.err).toBe('Loaded Var into VM Context');

    const vce_res_2 = vce.load_device_msg(vce_vars_device_msgs[2]);
    // validate vm output
    expect(vce_res_2.ok).toBeDefined();
    expect(vce_res_2.ok).toEqual({
        'TEST_CP1': 27.99,
        'TEST_CP2': 59,
    });

    // validate ipc bus
    expect(tmp_ipc_bus.length).toBe(2);
    expect(tmp_ipc_bus[0][0]).toBe('LT-CH000_device_msg');
    expect(tmp_ipc_bus[1][0]).toBe('LT-CH000_device_msg');
    expect(tmp_ipc_bus[0][1].device_msg).toBeDefined();
    expect(tmp_ipc_bus[1][1].device_msg).toBeDefined();
    expect(tmp_ipc_bus[0][1].device_msg).toEqual({
        seq_number: 2,
        msg_value: 27.99,
        b64_msg_value: "",
        config: {
            msg_type: 16,
            msg_name: "READ_TEST_CP1",
            data_type: 2,
            size_bytes: 4,
        },
    });
    expect(tmp_ipc_bus[1][1].device_msg).toEqual({
        seq_number: 2,
        msg_value: 59,
        b64_msg_value: "",
        config: {
            msg_type: 17,
            msg_name: "READ_TEST_CP2",
            data_type: 2,
            size_bytes: 4,
        },
    });
});

test('VirtualComputeEngine_rc_39218', () => {
    const RC_SN = 39218;
    const tmp_ipc_bus: any[] = [];
    function test_ipc_handler(channel: string, data: any) {
        tmp_ipc_bus.push([channel, data]);
    }
    const vce = new VirtualComputeEngine(TEST_VCE_CONFIG, TEST_CHX_CPS, test_ipc_handler, DEVICE_MODEL);

    // load VCE_CONSTs
    const vce_consts_device_msgs: DeviceMsg[] = [
        {
            seq_number: 0,
            msg_value: 100,
            b64_msg_value: '',
            config: TEST_VCE_CONFIG[0].msg_type_config,
        },
        {
            seq_number: 1,
            msg_value: 2,
            b64_msg_value: '',
            config: TEST_VCE_CONFIG[1].msg_type_config,
        },
    ];
    vce_consts_device_msgs.forEach(dmsg => {
        const vce_res = vce.load_device_msg(dmsg);
        expect(vce_res.err).toBeDefined();
        expect(vce_res.err).toBe('Loaded Const into VM Context');
    });

    // load VCE_VARs
    const vce_vars_device_msgs: DeviceMsg[] = [
        {
            seq_number: RC_SN,
            msg_value: 10,
            b64_msg_value: '',
            config: TEST_VCE_CONFIG[2].msg_type_config,
        },
        {
            seq_number: RC_SN,
            msg_value: 12,
            b64_msg_value: '',
            config: TEST_VCE_CONFIG[3].msg_type_config,
        },
        {
            seq_number: RC_SN,
            msg_value: 36,
            b64_msg_value: '',
            config: TEST_VCE_CONFIG[4].msg_type_config,
        },
    ];

    const vce_res_0 = vce.load_device_msg(vce_vars_device_msgs[0]);
    expect(vce_res_0.err).toBeDefined();
    expect(vce_res_0.err).toBe('Started New VCE Cycle');

    const vce_res_1 = vce.load_device_msg(vce_vars_device_msgs[1]);
    expect(vce_res_1.err).toBeDefined();
    expect(vce_res_1.err).toBe('Loaded Var into VM Context');

    const vce_res_2 = vce.load_device_msg(vce_vars_device_msgs[2]);
    // validate vm output
    expect(vce_res_2.ok).toBeDefined();
    expect(vce_res_2.ok).toEqual({
        'TEST_CP1': 27.5,
        'TEST_CP2': 2.58,
    });

    // validate ipc bus
    expect(tmp_ipc_bus.length).toBe(2);
    expect(tmp_ipc_bus[0][0]).toBe('LT-CH000_device_msg');
    expect(tmp_ipc_bus[1][0]).toBe('LT-CH000_device_msg');
    expect(tmp_ipc_bus[0][1].device_msg).toBeDefined();
    expect(tmp_ipc_bus[1][1].device_msg).toBeDefined();
    expect(tmp_ipc_bus[0][1].device_msg).toEqual({
        seq_number: RC_SN,
        msg_value: 27.5,
        b64_msg_value: "",
        config: {
            msg_type: 16,
            msg_name: "READ_TEST_CP1",
            data_type: 2,
            size_bytes: 4,
        },
    });
    expect(tmp_ipc_bus[1][1].device_msg).toEqual({
        seq_number: RC_SN,
        msg_value: 2.58,
        b64_msg_value: "",
        config: {
            msg_type: 17,
            msg_name: "READ_TEST_CP2",
            data_type: 2,
            size_bytes: 4,
        },
    });
});

test('VirtualComputeEngine_compute_chx_equation', () => {
    const chx_eq: CHXEquation = {
        func_name: '',
        args_list: ['arg_1', 'arg_2'],
        expr: 'arg_1 + arg_2',
        result_unit: '',
    };

    let result = VirtualComputeEngine.compute_chx_equation(chx_eq, [5]);
    expect(result.err).toBeDefined();
    expect(result.err).toBe('Insufficient Arguments');

    result = VirtualComputeEngine.compute_chx_equation(chx_eq, [5, 4]);
    expect(result.ok).toBeDefined();
    expect(result.ok).toBe(9);

    chx_eq.expr = 'arg_1 - arg_2';
    result = VirtualComputeEngine.compute_chx_equation(chx_eq, [5, 4]);
    expect(result.ok).toBeDefined();
    expect(result.ok).toBe(1);
});