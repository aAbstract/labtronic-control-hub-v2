import struct
import random
import machine  # type: ignore

from lt_bus_utils import (
    READ_RESP_FC,
    fc_set,
    DATA_TYPES,
    compute_crc16,
    u16_to_2u8,
)

from zeos_debugger import zeos_breakpoint


REQUEST_PACKET_MIN_SIZE = 8
SLAVE_ID = 0x00


class DataGenerator:
    # points generation modes
    RANDOM_MODE = 0
    SINEWAVE_MODE = 1
    LINEAR_MODE = 2
    CONST_MODE = 3

    registers_config: dict
    generation_mode: int
    generation_clock: float
    state: dict

    def _update_state_random(self):
        self.state = {}
        for reg_addr, reg_config in self.registers_config.items():
            data_type = reg_config['data_type']
            if data_type[0] in ['u', 'i']:
                bits_count = int(data_type[1:])
                upper_limit = int('1' * (bits_count - 1), 2)
                self.state[reg_addr] = random.choice(range(upper_limit))

            elif data_type[0] == 'f':
                self.state[reg_addr] = random.uniform(0, 100)

    def _update_state_const(self):
        self.state = {}
        for reg_addr, reg_config in self.registers_config.items():
            data_type = reg_config['data_type']
            if data_type[0] in ['u', 'i']:
                self.state[reg_addr] = 99

            elif data_type[0] == 'f':
                self.state[reg_addr] = 24.6

    def __init__(self, _registers_config: dict, _generation_mode: int = RANDOM_MODE):
        self.registers_config = _registers_config
        self.generation_mode = _generation_mode
        self.generation_clock = 0

    def next_state(self) -> dict:
        if self.generation_mode == DataGenerator.RANDOM_MODE:
            self._update_state_random()

        elif self.generation_mode == DataGenerator.CONST_MODE:
            self._update_state_const()

        return self.state.copy()

    def current_state(self) -> dict:
        return self.state.copy()

    def reset(self):
        self.generation_clock = 0


lt_bus_uart = machine.UART(2, baudrate=115200, rx=22, tx=23)
registers_config: dict = {
    0xD000: {
        'reg_name': 'Flow',
        'data_type': 'f32',
        'size': DATA_TYPES['f32']['size'],
        'bin_decoder': DATA_TYPES['f32']['bin_decoder'],
    },
}
data_generator = DataGenerator(registers_config, DataGenerator.CONST_MODE)


def encode_READ_RESP_packet(reg_addr: int, reg_value: int | float) -> bytes:
    # header
    READ_RESP_packet = bytes([SLAVE_ID, READ_RESP_FC])
    READ_RESP_packet += reg_addr.to_bytes(2, 'big')
    reg_conf = registers_config[reg_addr]
    READ_RESP_packet += reg_conf['size'].to_bytes(2, 'big')

    # data
    READ_RESP_packet += struct.pack(reg_conf['bin_decoder'], reg_value)

    # crc16 + delimiter
    READ_RESP_packet += u16_to_2u8(compute_crc16(READ_RESP_packet))
    READ_RESP_packet += b'\r\n'

    return READ_RESP_packet


def handle_lt_bus_read_request(request_packet: bytes):
    reg_addr = int.from_bytes(bytes(request_packet[2:4]), 'big')
    reg_offset = int.from_bytes(bytes(request_packet[4:6]), 'big')
    if reg_addr not in registers_config:
        print('ERROR', f"Unknown Register Address: {reg_addr}")
        return

    reg_conf = registers_config[reg_addr]
    if reg_conf['size'] != reg_offset:
        print('ERROR', 'Invalid Register Size')
        return

    registers_data = data_generator.next_state()
    response_value = registers_data[reg_addr]
    packet = encode_READ_RESP_packet(reg_addr, response_value)
    # TODO
    lt_bus_uart.write(packet)


def handle_lt_bus_request(request_packet: bytes):
    if len(request_packet) < REQUEST_PACKET_MIN_SIZE:
        print('ERROR', 'Request Packet too Small')
        return

    # CRC-16 check
    packet_crc16_bytes = request_packet[-4:-2]
    packet_crc16 = int.from_bytes(packet_crc16_bytes, 'little')
    computed_crc16 = compute_crc16(request_packet[:-4])
    if packet_crc16 != computed_crc16:
        print('ERROR', f"Invalid CRC-16: packet_crc16={packet_crc16}, computed_crc16={computed_crc16}")
        return

    # check lt_bus_slave_id
    packet_slave_id = request_packet[0]
    if packet_slave_id != SLAVE_ID:
        print('WARN', 'Slave ID Mismatch, Ignoring Packet')
        return

    # check packet_fc
    packet_fc = request_packet[1]
    if packet_fc not in fc_set:
        print('ERROR', 'Unknown Function Code')

    if packet_fc == 0xAA:
        handle_lt_bus_read_request(request_packet)


def lt_bus_loop():
    request_buffer = b''
    while True:
        byte = lt_bus_uart.read(1)
        if not byte:
            continue

        request_buffer += byte
        if request_buffer[-2:] == b'\r\n':
            handle_lt_bus_request(request_buffer)
            request_buffer = b''


if __name__ == '__main__':
    lt_bus_loop()
