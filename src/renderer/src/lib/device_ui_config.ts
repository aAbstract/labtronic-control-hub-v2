import { InfoCardGfxData, DevicePartGfxData, MsgTypeConfig } from '@common/models';
import { subscribe } from '@common/mediator';

export class ChartParams {
    label: string;
    data: number[];
    fill: boolean;
    tension: number;
    borderColor: string;
    pointRadius: number;

    constructor(_label: string, _borderColor: string) {
        this.label = _label;
        this.data = [];
        this.fill = false;
        this.tension = 0.4;
        this.borderColor = _borderColor;
        this.pointRadius = 0;
    }
};

export class DeviceUIConfig {
    static ROT_COLOR_LIST = [
        '#9c27b0',
        '#f44336',
        '#2196f3',
        '#3f51b5',
        '#673ab7',
        '#009688',
        '#00bcd4',
        '#03a9f4',
        '#cddc39',
        '#8bc34a',
        '#4caf50',
        '#ff9800',
        '#ffc107',
        '#ffeb3b',
        '#9e9e9e',
        '#795548',
        '#ff5722',
        '#607d8b',
    ];

    private cards_pos_map: Record<number, InfoCardGfxData>;
    private parts_pos_map: Record<string, DevicePartGfxData>;
    private chart_params_map: Record<number, ChartParams>;
    private rot_color_idx: number;

    constructor(
        _cards_pos_map: Record<number, InfoCardGfxData>,
        _parts_pos_map: Record<string, DevicePartGfxData>,
        _chart_params_map: Record<number, ChartParams>,
        device_model: string,
    ) {
        this.cards_pos_map = _cards_pos_map;
        this.parts_pos_map = _parts_pos_map;
        this.chart_params_map = _chart_params_map;
        this.rot_color_idx = 0;

        // update ui params for dynamic msg_types like computed parameters
        subscribe(`${device_model}_update_ui_params`, `${device_model}_update_ui_params`, (args) => {
            const device_config: MsgTypeConfig[] = args.device_config;
            device_config.forEach(_config => {
                if (!_config.msg_name.startsWith('READ_'))
                    return;
                const fixed_msg_names = Object.values(_chart_params_map).map(x => x.label);
                const msg_name = _config.msg_name.replace('READ_', '');
                if (fixed_msg_names.includes(msg_name))
                    return;
                // assign colors to device computed parameters 
                const _color = DeviceUIConfig.ROT_COLOR_LIST[_config.msg_type % DeviceUIConfig.ROT_COLOR_LIST.length];
                this.chart_params_map[_config.msg_type] = new ChartParams(msg_name, _color);
            });
        });
    }

    static get_rot_color(idx: number): string {
        return DeviceUIConfig.ROT_COLOR_LIST[idx];
    }

    get_rot_chart_params(series_name: string): ChartParams {
        return new ChartParams(series_name, DeviceUIConfig.ROT_COLOR_LIST[this.rot_color_idx++]);
    }

    get_chart_params(msg_type: number): ChartParams | null {
        if (msg_type in this.chart_params_map)
            return this.chart_params_map[msg_type];
        else
            return null;
    }

    get_info_card_pos(msg_type: number): InfoCardGfxData | null {
        if (msg_type in this.cards_pos_map)
            return this.cards_pos_map[msg_type];
        else
            return null;
    }

    get_all_info_card_pos(): InfoCardGfxData[] {
        return Object.values(this.cards_pos_map);
    }

    get_device_part_pos(part_name: string) {
        if (part_name in this.parts_pos_map)
            return this.parts_pos_map[part_name];
        else
            return null;
    }
};

const LT_CH000_DUIC = new DeviceUIConfig(
    {},
    {},
    {
        3: new ChartParams('TEMP', '#FFAB00'), // READ_TEMP
        2: new ChartParams('WGHT', '#64DD17'), // READ_WGHT
        4: new ChartParams('PRES', '#6200EA'), // READ_PRES
    },
    'LT-CH000',
);

const LT_HT103_DUIC = new DeviceUIConfig(
    {},
    {},
    {
        // readings
        0: new ChartParams('T1', '#00bcd4'), // READ_T1
        1: new ChartParams('T2', '#9c27b0'), // READ_T2
        2: new ChartParams('T_amb', '#3f51b5'), // READ_T_amb
        3: new ChartParams('T_c', '#795548'), // READ_T_c
        4: new ChartParams('T_h', '#4caf50'), // READ_T_h

        // control parameters
        5: new ChartParams('P_HEATER', '#f44336'), // READ_P_HEATER
        6: new ChartParams('P_PELTIER', '#2196f3'), // READ_P_PELTIER

        // compute parameters
        16: new ChartParams('Q_L', '#cddc39'), // VCE: Q_L
        17: new ChartParams('Q_Cond', '#ff9800'), // VCE: Q_Cond
        18: new ChartParams('Lambda', '#9e9e9e'), // VCE: Lambda

        // conditional compute parameters
        19: new ChartParams('Delta_T', '#009688'), // VCE: Delta_T
    },
    'LT-HT103',
);

const LT_HT107_DUIC = new DeviceUIConfig(
    {},
    {},
    {
        0: new ChartParams('T1', '#4CAF50'), // READ_T1
        1: new ChartParams('T2', '#9E9E9E'), // READ_T2
        2: new ChartParams('T3', '#3F51B5'), // READ_T3
        3: new ChartParams('T4', '#2196F3'), // READ_T4
        4: new ChartParams('T5', '#FF9800'), // READ_T5
        5: new ChartParams('T6', '#9C27B0'), // READ_T6
        6: new ChartParams('T7', '#009688'), // READ_T7
        7: new ChartParams('T8', '#CDDC39'), // READ_T8
        8: new ChartParams('T9', '#795548'), // READ_T9
        9: new ChartParams('T_H', '#F44336'), // READ_T_H
    },
    'LT-HT107',
);

const LT_HT113_DUIC = new DeviceUIConfig(
    {},
    {},
    {
        0: new ChartParams('T_sam', '#9C27B0'), // READ_T_sam
        1: new ChartParams('T_amb', '#00BCD4'), // READ_T_amb
        2: new ChartParams('T_ref', '#009688'), // READ_T_ref
        3: new ChartParams('W_flw', '#2196F3'), // READ_W_flw
    },
    'LT-HT113',
);

const LT_HT004_DUIC = new DeviceUIConfig(
    {},
    {},
    {
        0: new ChartParams('PT1000_In', '#9C27B0'), // READ_PT1000_In
        1: new ChartParams('PT1000_Out', '#FF9800'), // READ_PT1000_Out
        2: new ChartParams('PT1000_Heater', '#DD2C00'), // READ_PT1000_Heater
        3: new ChartParams('TC_Surface', '#00BCD4'), // READ_TC_Surface
        4: new ChartParams('P_Heater', '#2196F3'), // READ_P_Heater
        5: new ChartParams('AirFlow', '#009688'), // READ_AirFlow
    },
    'LT-HT004',
);

const LT_TO101_DUIC = new DeviceUIConfig(
    {},
    {},
    {
        0: new ChartParams('TC1', '#9C27B0'), // READ_TC1
        1: new ChartParams('TC2', '#DD2C00'), // READ_TC2
        2: new ChartParams('TC3', '#FF9800'), // READ_TC3
        3: new ChartParams('LVL', '#00BCD4'), // READ_LVL
        4: new ChartParams('PR1', '#2196F3'), // READ_PR1
        5: new ChartParams('PR2', '#009688'), // READ_PR2
        6: new ChartParams('PR3', '#9E9E9E'), // READ_PR3

        // compute parameters
        16: new ChartParams('P_times_V', '#cddc39'), // VCE: P_times_V
        17: new ChartParams('T_avg', '#4CAF50'), // VCE: T_avg
        18: new ChartParams('P_over_T', '#3F51B5'), // VCE: P_over_T
    },
    'LT-TO101',
);

const LT_TO202_DUIC = new DeviceUIConfig(
    {},
    {},
    {
        0: new ChartParams('PT1000', '#9C27B0'), // READ_PT1000
        1: new ChartParams('PT1000_Heater', '#FF9800'), // READ_PT1000_Heater
        2: new ChartParams('NTC', '#DD2C00'), // READ_NTC
        3: new ChartParams('TC_K_Type', '#00BCD4'), // READ_TC_K_Type
    },
    'LT-TO202',
);

const LT_RE600_DUIC = new DeviceUIConfig(
    {},
    {},
    {},
    'LT-RE600',
);

export const DEVICE_UI_CONFIG_MAP: Record<string, DeviceUIConfig> = {
    'LT-CH000': LT_CH000_DUIC,

    'LT-HT103': LT_HT103_DUIC,
    'LT-HT107': LT_HT107_DUIC,
    'LT-HT113': LT_HT113_DUIC,
    'LT-HT004': LT_HT004_DUIC,

    'LT-TO101': LT_TO101_DUIC,
    'LT-TO202': LT_TO202_DUIC,

    'LT-RE600': LT_RE600_DUIC,
};