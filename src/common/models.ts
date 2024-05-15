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