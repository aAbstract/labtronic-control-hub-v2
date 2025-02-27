import serial
import struct
import socket
from enum import Enum

from e2e.lt_bus_vspi.lt_bus_utils import (
    DATA_TYPES,
    REQUEST_PACKET_MIN_SIZE,
    compute_crc16,
    fc_set,
    READ_RESP_FC,
    u16_to_2u8,
    READ_FC,
    WRITE_FC,
    LT_BUS_PACKET_DATA_START,
)


class LTBusVSPICommMode(Enum):
    WIRED = 0
    NETWORK = 1


class DeviceRegisterConfig:
    register_name: str
    offset: int
    data_type: str
    size: int
    binary_decoder: str

    def __init__(
        self,
        register_name: str,
        offset: int,
        data_type: str,
        size: int = 0,
    ):
        self.register_name = register_name
        self.offset = offset

        self.data_type = data_type
        if data_type == 'u8[]':
            self.size = size
            self.binary_decoder = 'B[]'

        else:
            data_type_info = DATA_TYPES[data_type]
            self.size = data_type_info['size']
            self.binary_decoder = data_type_info['bin_decoder']

    def copy(self) -> 'DeviceRegisterConfig':
        clone_object = DeviceRegisterConfig(self.register_name, self.offset, self.data_type)
        clone_object.size = self.size
        clone_object.binary_decoder = self.binary_decoder
        return clone_object


class DeviceBuffer:
    base_address: int
    registers_config: dict[str, DeviceRegisterConfig]

    buffer: bytearray

    def __init__(
        self,
        base_address: int,
        device_registers: list[DeviceRegisterConfig],
    ):
        self.base_address = base_address
        self.registers_config = {}

        buffer_size = 0
        for dr in device_registers:
            buffer_size += dr.size
            self.registers_config[dr.register_name] = dr
        self.buffer = bytearray(buffer_size)

    def read_register(self, register_name: str):
        register_config = self.registers_config.get(register_name, None)
        if not register_config:
            raise Exception('Register Name not Found')

        register_buffer = self.buffer[register_config.offset:register_config.offset + register_config.size]
        return struct.unpack(register_config.binary_decoder, register_buffer)[0]

    def read_region(self, start_address: int, size: int) -> bytes:
        offset = start_address - self.base_address
        return self.buffer[offset: offset + size]

    def write_region(self, start_address: int, data: bytes):
        offset = start_address - self.base_address
        self.buffer[offset: offset + len(data)] = data

    def write_register(self, register_name: str, value: int | float) -> int | float:
        register_config = self.registers_config.get(register_name, None)
        if not register_config:
            raise Exception('Register Name not Found')

        value_buffer = struct.pack(register_config.binary_decoder, value)
        self.buffer[register_config.offset:register_config.offset + register_config.size] = value_buffer
        return struct.unpack(register_config.binary_decoder, self.buffer[register_config.offset:register_config.offset + register_config.size])[0]

    def get_register_address(self, register_name: str) -> str:
        register_config = self.registers_config.get(register_name, None)
        if not register_config:
            raise Exception('Register Name not Found')

        register_address = self.base_address + register_config.offset
        return f"0x{register_address:04X}"


class LTBusVSPI:
    device_model: str
    debug: bool = True
    log_tag: str

    comm_mode: LTBusVSPICommMode

    v_socket_addr: tuple[str, int]
    v_socket: socket.socket

    serial_port_name: tuple[str, int]
    baud_rate: serial.Serial
    serial_port: serial.Serial

    is_connected: bool
    lt_bus_slave_id: int
    device_buffers: dict[int, DeviceBuffer]
    registers_config: dict[str, DeviceRegisterConfig]

    def __init__(
        self,
        device_model: str,
        device_buffers: list[DeviceBuffer],
        comm_mode: LTBusVSPICommMode = LTBusVSPICommMode.NETWORK,
        socket_host: str = '127.0.0.1',
        socket_port: int = 6543,
        serial_port: str = '/dev/ttyUSB0',
        baud_rate: int = 115200,
        auto_connect: bool = False,
        lt_bus_slave_id: int = 0x00,
    ):
        self.device_model = device_model
        self.comm_mode = comm_mode
        self.log_tag = f"[LT-BUS-VSPI-{self.device_model}]"
        self.v_socket_addr = (socket_host, socket_port)
        self.v_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.serial_port = serial_port
        self.baud_rate = baud_rate
        self.is_connected = False
        self.lt_bus_slave_id = lt_bus_slave_id

        self.device_buffers = {}
        self.registers_config = {}
        for d_buff in device_buffers:
            self.device_buffers[d_buff.base_address] = d_buff
            for rn, rc in d_buff.registers_config.items():
                new_rc = rc.copy()
                new_rc.offset += d_buff.base_address
                self.registers_config[rn] = new_rc

        if auto_connect:
            self.connect()
            self.lt_bus_loop()

    def connect(self):
        print(self.log_tag, 'Connecting...')
        try:
            if self.comm_mode == LTBusVSPICommMode.NETWORK:
                self.v_socket.connect(self.v_socket_addr)
            elif self.comm_mode == LTBusVSPICommMode.WIRED:
                self.serial_port = serial.Serial(self.serial_port_name, self.baud_rate)
            print(self.log_tag, 'Connecting...OK')
            self.is_connected = True

        except Exception as e:
            print(self.log_tag, 'Connecting...ERR')
            if self.debug:
                print(e)

    def disconnect(self):
        print(self.log_tag, 'Disconnecting...')
        try:
            if self.comm_mode == LTBusVSPICommMode.NETWORK:
                self.v_socket.close()
            elif self.comm_mode == LTBusVSPICommMode.WIRED:
                self.serial_port.close()
            print(self.log_tag, 'Disconnecting...OK')
            self.is_connected = False

        except Exception as e:
            print(self.log_tag, 'Disconnecting...ERR')
            if self.debug:
                print(e)

    def encode_READ_packet(self, register_address: int, size: int) -> bytes:
        # header
        READ_RESP_packet = bytes([ord('{'), self.lt_bus_slave_id, READ_FC])
        READ_RESP_packet += register_address.to_bytes(2, 'little')
        READ_RESP_packet += size.to_bytes(2, 'little')

        # crc16 + delimiter
        READ_RESP_packet += u16_to_2u8(compute_crc16(READ_RESP_packet))
        READ_RESP_packet += b'}'

        return READ_RESP_packet

    def encode_READ_RESP_packet(self, register_address: int, data: bytes) -> bytes:
        # header
        READ_RESP_packet = bytes([ord('{'), self.lt_bus_slave_id, READ_RESP_FC])
        READ_RESP_packet += register_address.to_bytes(2, 'little')
        READ_RESP_packet += len(data).to_bytes(2, 'little')

        # data
        READ_RESP_packet += data

        # crc16 + delimiter
        READ_RESP_packet += u16_to_2u8(compute_crc16(READ_RESP_packet))
        READ_RESP_packet += b'}'

        return READ_RESP_packet

    def _handle_lt_bus_read_request(self, request_packet: bytes):
        register_address = int.from_bytes(request_packet[3:5], 'little')
        buffer_base_address = register_address & 0xF000
        device_buffer = self.device_buffers.get(buffer_base_address, None)
        if not device_buffer:
            print(self.log_tag, '[ERROR]', f"Unknown Register Base Address 0x{buffer_base_address:02X}")
            return

        register_size = int.from_bytes(request_packet[5:7], 'little')
        register_data = device_buffer.read_region(register_address, register_size)

        READ_RESP_packet = self.encode_READ_RESP_packet(register_address, register_data)
        if self.comm_mode == LTBusVSPICommMode.NETWORK:
            print(self.log_tag, '[DEBUG]', f"Sending Packet: {READ_RESP_packet}")
            self.v_socket.send(READ_RESP_packet)
        elif self.comm_mode == LTBusVSPICommMode.WIRED:
            pass  # IGNORE

    def _handle_lt_bus_write_request(self, request_packet: bytes):
        register_address = int.from_bytes(request_packet[3:5], 'little')
        buffer_base_address = register_address & 0xF000
        device_buffer = self.device_buffers.get(buffer_base_address, None)
        if not device_buffer:
            print(self.log_tag, '[ERROR]', f"Unknown Register Base Address 0x{buffer_base_address:02X}")
            return

        register_size = int.from_bytes(request_packet[5:7], 'little')
        register_data = request_packet[LT_BUS_PACKET_DATA_START:LT_BUS_PACKET_DATA_START + register_size]
        device_buffer.write_region(register_address, register_data)

    def handle_lt_bus_request(self, request_packet: bytes):
        print(self.log_tag, '[DEBUG]', f"Received Packet: {request_packet}")

        if len(request_packet) < REQUEST_PACKET_MIN_SIZE:
            print(self.log_tag, '[ERROR]', 'Request Packet too Small')
            return

        # CRC-16 check
        packet_crc16_bytes = request_packet[-3:-1]
        packet_crc16 = int.from_bytes(packet_crc16_bytes, 'little')
        computed_crc16 = compute_crc16(request_packet[:-3])
        if packet_crc16 != computed_crc16:
            print(self.log_tag, '[ERROR]', f"Invalid CRC-16: packet_crc16={packet_crc16}, computed_crc16={computed_crc16}")
            return

        # check lt_bus_slave_id
        packet_slave_id = request_packet[1]
        if packet_slave_id != self.lt_bus_slave_id:
            print(self.log_tag, '[WARN]', 'Slave ID Mismatch, Ignoring Packet')
            return

        # check packet_fc
        packet_fc = request_packet[2]
        if packet_fc not in fc_set:
            print(self.log_tag, '[ERROR]', 'Unknown Function Code')
            return

        if packet_fc == 0xAA:
            self._handle_lt_bus_read_request(request_packet)

        elif packet_fc == 0xEA:
            self._handle_lt_bus_write_request(request_packet)

    def device_read_register(self, register_name: str) -> bytes:
        if self.comm_mode != LTBusVSPICommMode.WIRED:
            print(self.log_tag, '[ERROR]', 'This Function Requires LTBusVSPICommMode.WIRED')
            return

        register_config = self.registers_config.get(register_name, None)
        if not register_config:
            print(self.log_tag, '[ERROR]', 'Register Name not Found')

        register_address = register_config.offset
        READ_packet = self.encode_READ_packet(register_address, register_config.size)
        if self.is_connected:
            self.serial_port.write(READ_packet)

        return READ_packet

    def lt_bus_loop(self):
        request_buffer = b''
        while True:
            if self.comm_mode == LTBusVSPICommMode.NETWORK:
                packet_header = self.v_socket.recv(7)
            elif self.comm_mode == LTBusVSPICommMode.WIRED:
                pass  # IGNORE

            if packet_header[0] != ord('{'):
                print(self.log_tag, '[WARN]', f"Ignored Packet Header: {packet_header}")
                continue

            packet_fc = packet_header[2]
            if packet_fc == READ_FC:
                packet_remain = self.v_socket.recv(3)
                request_buffer = packet_header + packet_remain

            elif packet_fc == WRITE_FC:
                data_size = int.from_bytes(packet_header[-2:], 'little')
                packet_remain = self.v_socket.recv(data_size + 3)
                request_buffer = packet_header + packet_remain

            if request_buffer[-1] == ord('}'):
                self.handle_lt_bus_request(request_buffer)
            else:
                print(self.log_tag, '[WARN]', f"Ignored Packet: {request_buffer}")

            request_buffer = b''
