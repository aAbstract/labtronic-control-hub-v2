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
    cfg2: number;
};

export interface LTBusMsgConfig {
    msg_type: number;
    msg_name: string;
};

export interface LTBusDeviceMsg {
    config: LTBusMsgConfig;
    seq_number: number;
    msg_value: number;
    b64_msg_value: string;
};

export interface DeviceMsg {
    config: MsgTypeConfig;
    seq_number: number;
    msg_value: number;
    b64_msg_value: string;
};

export interface ILtdDriver {
    protocol_version: [number, number];
    encode_packet(msg_seq_number: number, msg_type: number, msg_value: number): Result<Uint8Array>;
    decode_packet(packet: Uint8Array): Result<DeviceMsg[]>;
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
    panel_name?: string;
    panel_pos?: 'LEFT' | 'RIGHT';
    is_active: boolean;
    menu_action?: () => void;
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

export enum DeviceStatus {
    OK = 0,
    ERROR = 1,
    UNKNOWN = 2,
};

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

// CHX Settings
export interface CHXCloudSettings {
    labtronic_cdn_base_url: string;
};

export interface CHXComputedParam {
    param_name: string;
    expr?: string;
    unit?: string;
    msg_type?: number;
};

export interface CHXEquation {
    func_name: string;
    args_list: string[];
    expr: string;
    result_unit: string;
};

export interface CHXScript {
    script_name: string;
    script_path: string;
};
export interface CHXScriptInjectedParam {
    param_name: string;
    param_val: string | number;
};

export interface CHXSeries {
    series_name: string;
    x_param: number; // -1 means time
    y_param: number;
};

export interface CHXSettings {
    device_model: string;
    chx_core_version: string;
    chx_module_version: string;
    chx_advanced: boolean;
    computed_params: CHXComputedParam[];
    equations: CHXEquation[];
    scripts: CHXScript[];
    series: CHXSeries[];
    device_config: Record<string, any>;
};

export interface CHXVersionInfo {
    device_model: string;
    chx_core_version: string;
    chx_module_version: string;
};
// CHX Settings

// device models - LT_HT103
export enum LT_HT103_DeviceOperationMode {
    CALIBRATION = 0,
    EXPERIMENT = 1,
};

export interface LT_HT103_DeviceConfig {
    C_f: number;
    Q_L_F1: number;
    Q_L_F2: number;
};
// device models - LT_HT103

// device models - LT_HT107
export enum LT_HT107_DeviceMode {
    SAMPLE_DISCONNECTED = 0,
    LINEAR_1 = 1,
    LINEAR_2 = 2,
    LINEAR_3 = 3,
    RADIAL = 4,
};
// device models - LT_HT107

// device models - LT_HT004
export enum LT_HT004_DeviceOperationMode {
    PLATE = 0,
    HEATER = 1,
    BUNDLE = 2,
};

export interface LT_HT004_DeviceConfig {
    PT1000_In: number;
    PT1000_Out: number;
    PT1000_Heater: number;
    P_Heater: number;
    AirFlow: number;
};
// device models - LT_HT004

// device models - LT_TO101
export enum LT_TO101_DeviceMode {
    BOYLE = 0,
    GLUSS = 1,
};
// device models - LT_TO101

// device models - LT_RE600
export enum LT_RE600_ScreenMode {
    W1280 = 1,
    W1920 = 2,
};

export interface LT_RE600_MeterParams {
    meter_name: string;
    top_offsets: Record<LT_RE600_ScreenMode, number>;
    left_offsets: Record<LT_RE600_ScreenMode, number>;
    meter_values: LT_RE600_MeterValue[];
};

export interface LT_RE600_MeterValue {
    msg_type: number;
    msg_name: string;
};
// device models - LT_RE600

export enum CHXChartState {
    RECORDING = 0,
    PAUSED = 1,
    STOPPED = 2,
};

export enum RecordingState {
    RUNNING = 0,
    PAUSED = 1,
    STOPPED = 2,
};

export interface LTBusDeviceErrorMsg {
    error_code: number;
    error_text: string;
    user_ack: boolean;
};