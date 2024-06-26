export interface Result<T> {
    ok?: T;
    err?: any;
};

export enum DataType {
    INT = 0,
    UINT = 1,
    FLOAT = 2,
    COMMAND = 3,
};

export interface MsgTypeConfig {
    msg_type: number;
    msg_name: string;
    data_type: DataType;
    size_bytes: number;
};

export interface DeviceMsg {
    seq_number: number;
    msg_value: number;
    b64_msg_value: string;
    config: MsgTypeConfig;
};

export interface ILtdDriver {
    readonly PROTOCOL_VERSION: number;
    encode_packet(msg_seq_number: number, msg_type: number, msg_value: number): Result<Uint8Array>;
    decode_packet(packet: Uint8Array): Result<DeviceMsg>;
};

export type LogLevel = 'INFO' | 'DEBUG' | 'WARN' | 'ERROR' | '';

export interface LogMsg {
    datetime?: string;
    source?: string;
    level: LogLevel;
    msg: string;
};

export interface NavMenuItem {
    label: string;
    icon: any;
    menu_action: () => void;
};

export interface DropdownOption<T> {
    label: string;
    value: T;
};

export interface SerialPortMetaData {
    port_name: string;
    manufacturer: string;
};

export interface SerialPortMetaData {
    port_name: string;
    manufacturer: string;
};

export interface Vec2D {
    x: number,
    y: number,
};

export interface DevicePartGfxData {
    pos: Vec2D,
    shape: string,
    shape_params: any,
    color: string,
};

export interface InfoCardGfxData {
    pos: Vec2D,
    cell_count: number,
};

export interface PlotSeries {
    x: number[],
    y: number[],
};

export interface DmtbRow {
    sn: number;
    datetime: string;
    msg_type: number;
    msg_name: string;
    msg_value: number;
    b64_msg_value: string;
};

export interface CHXComputedParam {
    param_name: string;
    expr: string;
};

export interface CHXSettings {
    labtronic_cdn_base_url: string;
};

export interface AlertButtonConfig {
    btn_text: string;
    btn_type: 'info' | 'warning' | 'danger' | 'secondary';
    btn_action: () => void;
};

export interface AlertConfig {
    title: string;
    msg_severity: "warn" | "success" | "info" | "error" | "secondary" | "contrast";
    msg_body: string;
    btns_config: AlertButtonConfig[];
};

export type DeviceStatus = 'OK' | 'ERROR' | 'UNKNOWN';

export enum VceParamType {
    VCE_CONST = 0,
    VCE_VAR = 1,
};

export interface VceParamConfig {
    msg_type_config: MsgTypeConfig;
    param_symbol: string;
    param_type: VceParamType;
    const_init_value?: number;
    desc: string;
};

export interface _ToastMessageOptions {
    severity: 'success' | 'info' | 'warn' | 'error' | 'secondary';
    summary: string;
    detail: string;
    life: number;
};

export interface CHXSeries {
    series_name: string;
    x_param: number;
    y_param: number;
};

export interface CHXEquation {
    func_name: string;
    args_list: string[];
    expr: string;
    result_unit: string;
};