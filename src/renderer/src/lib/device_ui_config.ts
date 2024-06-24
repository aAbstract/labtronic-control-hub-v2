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
                const _color = DeviceUIConfig.ROT_COLOR_LIST[_config.msg_type % DeviceUIConfig.ROT_COLOR_LIST.length];
                this.chart_params_map[_config.msg_type] = new ChartParams(msg_name, _color);
            });
        });
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
    {
        3: { // READ_TEMPERATURE
            pos: { x: 63.30, y: 11.70 },
            cell_count: 2,
        },
        2: { // READ_WEIGHT
            pos: { x: 16.75, y: 78.75 },
            cell_count: 3,
        },
        4: { // READ_PRESSURE
            pos: { x: 16.75, y: 28.25 },
            cell_count: 2,
        },
        0: { // PISTON_PUMP
            pos: { x: 74.40, y: 86.75 },
            cell_count: 3,
        },
        1: { // PERISTALTIC_PUMP
            pos: { x: 90.75, y: 57.60 },
            cell_count: 1,
        },
    },
    {
        'TANK': {
            pos: { x: 44.70, y: 16.00 },
            shape: 'rect',
            shape_params: { w: 60, h: 100 },
            color: 'red',
        },
    },
    {
        3: new ChartParams('TEMPERATURE', '#FFAB00'), // READ_TEMPERATURE
        2: new ChartParams('WEIGHT', '#64DD17'), // READ_WEIGHT
        4: new ChartParams('PRESSURE', '#6200EA'), // READ_PRESSURE
    },
    'LT-CH000',
);

export const DEVICE_UI_CONFIG_MAP: Record<string, DeviceUIConfig> = {
    'LT-CH000': LT_CH000_DUIC,
};