import { InfoCardGfxData, DevicePartGfxData } from '@common/models';

export class ChartParams {
    label: string;
    data: number[];
    fill: boolean;
    tension: number;
    borderColor: string;

    constructor(_label: string, _borderColor: string) {
        this.label = _label;
        this.data = [];
        this.fill = false;
        this.tension = 0.4;
        this.borderColor = _borderColor;
    }
};

export class DeviceUIConfig {
    private cards_pos_map: Record<number, InfoCardGfxData>;
    private parts_pos_map: Record<string, DevicePartGfxData>;
    private chart_params_map: Record<number, ChartParams>;

    constructor(
        _cards_pos_map: Record<number, InfoCardGfxData>,
        _parts_pos_map: Record<string, DevicePartGfxData>,
        _chart_params_map: Record<number, ChartParams>,
    ) {
        this.cards_pos_map = _cards_pos_map;
        this.parts_pos_map = _parts_pos_map;
        this.chart_params_map = _chart_params_map;
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
);

export const DEVICE_UI_CONFIG_MAP: Record<string, DeviceUIConfig> = {
    'LT-CH000': LT_CH000_DUIC,
};