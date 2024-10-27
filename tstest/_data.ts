import {
    MsgTypeConfig,
    DataType,
    VceParamConfig,
    VceParamType,
    CHXComputedParam,
} from '../src/common/models.ts';

export const test_data_points: Record<string, number>[] = [
    {
        "2": 2.0914978981018066,
        "3": 9.683697700500488,
        "4": 3.1024787425994873,
        "16": 13.5265810597094,
        "17": 15.877674341201782,
        "seq_number": 740,
        "time_ms": 1000
    },
    {
        "2": 12.449482917785645,
        "3": 7.781712055206299,
        "4": 3.7693498134613037,
        "16": 22.16267631811512,
        "17": 25.000544786453247,
        "seq_number": 840,
        "time_ms": 2000
    },
    {
        "2": 14.704611778259277,
        "3": 9.60412311553955,
        "4": 1.1542682647705078,
        "16": 25.373103668833966,
        "17": 26.463003158569336,
        "seq_number": 930,
        "time_ms": 3000
    },
    {
        "2": 5.627810478210449,
        "3": 6.477298736572266,
        "4": 2.9566049575805664,
        "16": 13.814587320947654,
        "17": 16.06171417236328,
        "seq_number": 1030,
        "time_ms": 4000
    },
    {
        "2": 13.079941749572754,
        "3": 9.318120002746582,
        "4": 2.8276405334472656,
        "16": 24.069620711573297,
        "17": 26.2257022857666,
        "seq_number": 1130,
        "time_ms": 5000
    },
    {
        "2": 11.860058784484863,
        "3": 7.537190914154053,
        "4": 1.3712438344955444,
        "16": 20.558250908926738,
        "17": 21.76849353313446,
        "seq_number": 1230,
        "time_ms": 6000
    },
    {
        "2": 7.267297267913818,
        "3": 7.004546642303467,
        "4": 2.980517864227295,
        "16": 15.988261549210613,
        "17": 18.25236177444458,
        "seq_number": 1330,
        "time_ms": 7000
    },
    {
        "2": 3.605724811553955,
        "3": 5.319634914398193,
        "4": 1.9543519020080566,
        "16": 10.313341092783643,
        "17": 11.879711627960205,
        "seq_number": 1420,
        "time_ms": 8000
    },
    {
        "2": 4.835154056549072,
        "3": 3.987598180770874,
        "4": 2.041581869125366,
        "16": 10.241591580677122,
        "17": 11.864334106445312,
        "seq_number": 1520,
        "time_ms": 9000
    },
    {
        "2": 5.169301986694336,
        "3": 4.8976874351501465,
        "4": 4.17399787902832,
        "16": 12.10002585789459,
        "17": 15.240987300872803,
        "seq_number": 1620,
        "time_ms": 10000
    },
    {
        "2": 6.574839115142822,
        "3": 6.724250316619873,
        "4": 2.9914355278015137,
        "16": 15.018666122112538,
        "17": 17.29052495956421,
        "seq_number": 1710,
        "time_ms": 11000
    },
    {
        "2": 7.7398762702941895,
        "3": 1.8729149103164673,
        "4": 4.298742771148682,
        "16": 11.676132148987223,
        "17": 14.911533951759338,
        "seq_number": 1810,
        "time_ms": 12000
    },
    {
        "2": 4.573716640472412,
        "3": 6.833441734313965,
        "4": 3.8024511337280273,
        "16": 13.347145844932795,
        "17": 16.209609508514404,
        "seq_number": 1910,
        "time_ms": 13000
    },
    {
        "2": 4.470827102661133,
        "3": 9.23927116394043,
        "4": 2.2496516704559326,
        "16": 15.199982152259361,
        "17": 16.959749937057495,
        "seq_number": 2010,
        "time_ms": 14000
    },
    {
        "2": 9.85258960723877,
        "3": 6.088119029998779,
        "4": 4.970434188842773,
        "16": 18.160155696228358,
        "17": 21.911142826080322,
        "seq_number": 2100,
        "time_ms": 15000
    },
    {
        "2": 7.468754291534424,
        "3": 8.769800186157227,
        "4": 3.226053237915039,
        "16": 18.024676199044364,
        "17": 20.46460771560669,
        "seq_number": 2200,
        "time_ms": 16000
    },
    {
        "2": 9.067133903503418,
        "3": 2.6410839557647705,
        "4": 4.460153579711914,
        "16": 13.810125428200104,
        "17": 17.168371438980103,
        "seq_number": 2300,
        "time_ms": 17000
    },
    {
        "2": 12.953147888183594,
        "3": 8.743406295776367,
        "4": 1.2750872373580933,
        "16": 22.815751791714284,
        "17": 23.971641421318054,
        "seq_number": 2400,
        "time_ms": 18000
    },
    {
        "2": 9.513306617736816,
        "3": 5.235440254211426,
        "4": 2.4682869911193848,
        "16": 16.309825161251286,
        "17": 18.217033863067627,
        "seq_number": 2490,
        "time_ms": 19000
    },
    {
        "2": 10.18838119506836,
        "3": 4.146376132965088,
        "4": 2.4301273822784424,
        "16": 15.883643912194861,
        "17": 17.76488471031189,
        "seq_number": 2590,
        "time_ms": 20000
    }
];

export const TEST_DRIVER_CONFIG: MsgTypeConfig[] = [
    {
        msg_type: 0,
        msg_name: 'PISTON_PUMP',
        data_type: DataType.UINT,
        size_bytes: 4,
        cfg2: 0,
    },
    {
        msg_type: 1,
        msg_name: 'PERISTALTIC_PUMP',
        data_type: DataType.UINT,
        size_bytes: 1,
        cfg2: 0,
    },
    {
        msg_type: 2,
        msg_name: 'READ_WEIGHT',
        data_type: DataType.FLOAT,
        size_bytes: 4,
        cfg2: 0,
    },
    {
        msg_type: 3,
        msg_name: 'READ_TEMPERATURE',
        data_type: DataType.FLOAT,
        size_bytes: 4,
        cfg2: 0,
    },
    {
        msg_type: 4,
        msg_name: 'READ_PRESSURE',
        data_type: DataType.FLOAT,
        size_bytes: 4,
        cfg2: 0,
    },
    {
        msg_type: 12,
        msg_name: 'WRITE_PISTON_PUMP',
        data_type: DataType.UINT,
        size_bytes: 4,
        cfg2: 0,
    },
    {
        msg_type: 13,
        msg_name: 'WRITE_PERISTALTIC_PUMP',
        data_type: DataType.UINT,
        size_bytes: 1,
        cfg2: 0,
    },
    {
        msg_type: 15,
        msg_name: 'WRITE_RESET_SCALE',
        data_type: DataType.COMMAND,
        size_bytes: 1,
        cfg2: 0,
    },
    {
        msg_type: 14,
        msg_name: 'DEVICE_ERROR',
        data_type: DataType.UINT,
        size_bytes: 1,
        cfg2: 0,
    },
];

export const TEST_LT_RE600_PACKET = new Uint8Array([
    0x99, 0x99, 0x7F, 0x00,
    0x00, 0xC8, 0x42, 0x00,
    0x00, 0x5C, 0x43, 0x00,
    0x00, 0x5C, 0x43, 0x00,
    0x00, 0x5C, 0x43, 0x00,
    0x00, 0x5C, 0x43, 0xCD,
    0xCC, 0x8C, 0x3F, 0x66,
    0x66, 0x66, 0x3F, 0x00,
    0x00, 0x00, 0x3F, 0x00,
    0x00, 0xA0, 0x3F, 0x00,
    0x00, 0xA0, 0x3F, 0x00,
    0x00, 0x20, 0x41, 0x00,
    0x00, 0x16, 0x43, 0x66,
    0x66, 0x66, 0x3F, 0x00,
    0x00, 0x48, 0x42, 0x00,
    0x00, 0x5C, 0x43, 0x00,
    0x00, 0x80, 0x3F, 0x00,
    0x00, 0x5C, 0x43, 0x00,
    0x00, 0x5C, 0x43, 0x00,
    0x00, 0x5C, 0x43, 0x66,
    0x66, 0x66, 0x3F, 0x00,
    0x00, 0x40, 0x41, 0x00,
    0x00, 0x40, 0x40, 0x00,
    0x00, 0x10, 0x42, 0x00,
    0x00, 0x40, 0x41, 0x00,
    0x00, 0x80, 0x3F, 0x00,
    0x00, 0x40, 0x41, 0x00,
    0x80, 0xBB, 0x44, 0x00,
    0x00, 0x40, 0x40, 0x00,
    0x00, 0x00, 0x42, 0x00,
    0x00, 0xC0, 0x42, 0x24,
    0xEB, 0x0D, 0x0A,
]);

export const TEST_LT_RE600_PACKET_VALUES = [
    100,    // TPH_Freq
    220,    // TPH_V12
    220,    // TPH_V32
    220,    // TPH_V31
    220,    // TPH_Ull_avg
    1.1,    // TPH_I1
    0.9,    // TPH_I2
    0.5,    // TPH_I3
    1.25,   // TPH_L_avg
    1.25,   // TPH_Sys_P
    10,     // TPH_Sys_Q
    150,    // TPH_Sys_S
    0.9,    // TPH_Sys_PF

    50,     // SPH_Freq
    220,    // SPH_V1
    1,      // SPH_I1
    220,    // Sys_P
    220,    // Sys_Q
    220,    // Sys_S
    0.9,    // Sys_PF

    12,     // BAT_V
    3,      // BAT_I
    36,     // BAT_P

    12,     // DCL_V
    1,      // DCL_I
    12,     // DCL_P

    1500,   // ACD_Freq
    3,      // ACD_I
    32,     // ACD_V
    96,     // ACD_P
];

const LT_RE600_TPH_MSG_LIST = [
    'Freq',
    'V12',
    'V23',
    'V31',
    'Ull_avg', // hide
    'I1',
    'I2',
    'I3',
    'L_avg', // hide
    'Sys_P',
    'Sys_Q',
    'Sys_S', // hide
    'Sys_PF',
];

const LT_RE600_SPH_MSG_LIST = [
    'Freq',
    'V1',
    'I1',
    'Sys_P',
    'Sys_Q',
    'Sys_S', // hide
    'Sys_PF',
];

const LT_RE600_BAT_MSG_LIST = [
    'V',
    'I',
    'P',
];

const LT_RE600_DCL_MSG_LIST = [
    'V',
    'I',
    'P',
];

const LT_RE600_ACD_MSG_LIST = [
    'Freq',
    'I', // hide
    'V', // hide
    'P', // hide
];

const LT_RE600_MSG_LIST = [
    ...LT_RE600_TPH_MSG_LIST.map(x => 'READ_TPH_' + x),
    ...LT_RE600_SPH_MSG_LIST.map(x => 'READ_SPH_' + x),
    ...LT_RE600_BAT_MSG_LIST.map(x => 'READ_BAT_' + x),
    ...LT_RE600_DCL_MSG_LIST.map(x => 'READ_DCL_' + x),
    ...LT_RE600_ACD_MSG_LIST.map(x => 'READ_ACD_' + x),
];

export const LT_RE600_DRIVER_CONFIG = LT_RE600_MSG_LIST.map((msg_name, idx) => {
    return {
        msg_type: idx,
        msg_name,
        data_type: DataType.FLOAT,
        size_bytes: 4,
        cfg2: 0,
    } as MsgTypeConfig;
});

export const TEST_VCE_CONFIG: VceParamConfig[] = [
    {
        msg_type_config: {
            msg_type: 0,
            msg_name: 'PISTON_PUMP',
            data_type: DataType.UINT,
            size_bytes: 4,
            cfg2: 0,
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
            cfg2: 0,
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
            cfg2: 0,
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
            cfg2: 0,
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
            cfg2: 0,
        },
        param_symbol: '$P',
        param_type: VceParamType.VCE_VAR,
        desc: 'Pressure of the Liquid in the Tank',
    },
];

export const TEST_CHX_CPS: CHXComputedParam[] = [
    {
        param_name: "TEST_CP1",
        expr: "$W + $T + Math.sqrt($P) - ($I / $E) * 0.01",
    },
    {
        param_name: "TEST_CP2",
        expr: "$E + (($W + $T + $P) / $I)",
    },
];