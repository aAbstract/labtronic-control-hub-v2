import time
import socket
import serial
from enum import Enum
from ltd_driver import (
    LtdDriver,
    DeviceMsg,
)


class VSPICommMode(Enum):
    WIRED = 0
    NETWORK = 1


class VSPI:
    device_cfg2: int = 0
    debug: bool = True
    log_tag: str

    device_driver: LtdDriver
    control_feedback_map: dict

    vspi_mode: VSPICommMode
    vspi_socket_addr: tuple[str, int]
    vspi_socket: socket.socket

    vspi_serial_port_name: str
    vspi_baud_rate: int
    vspi_serial_port: serial.Serial

    def __init__(
        self,
        device_driver: LtdDriver,
        control_feedback_map: dict = {},
        vspi_socket_host: str = '127.0.0.1',
        vspi_socket_port: int = 6543,
        vspi_serial_port_name: str = '/dev/ttyACM0',
        vspi_baud_rate: int = 115200,
        vspi_comm_mode: VSPICommMode = VSPICommMode.NETWORK,
    ):
        self.device_driver = device_driver
        self.control_feedback_map = control_feedback_map
        self.vspi_mode = vspi_comm_mode
        self.vspi_socket_addr = (vspi_socket_host, vspi_socket_port)
        self.vspi_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.vspi_serial_port_name = vspi_serial_port_name
        self.vspi_baud_rate = vspi_baud_rate
        self.log_tag = f"[VSPI-{hex(self.device_driver.protocol_version[0])}-{hex(self.device_driver.protocol_version[1])}]"
        print(self.log_tag, 'VSPI Connecting...')
        try:
            self.connect()
            print(self.log_tag, 'VSPI Connecting...OK')
        except Exception as e:
            print(self.log_tag, 'VSPI Connecting...ERR')
            if self.debug:
                print(e)

    def connect(self):
        if self.vspi_mode == VSPICommMode.NETWORK:
            self.vspi_socket.connect(self.vspi_socket_addr)
        elif self.vspi_mode == VSPICommMode.WIRED:
            self.vspi_serial_port = serial.Serial(port=self.vspi_serial_port_name, baudrate=self.vspi_baud_rate)

    def disconnect(self):
        if self.vspi_mode == VSPICommMode.NETWORK:
            self.vspi_socket.close()
        elif self.vspi_mode == VSPICommMode.WIRED:
            self.vspi_serial_port.close()

    def write_packet(self, packet: bytes):
        self.vspi_socket.send(packet)

    def write_msg(self, msg_type: int, msg_value: int):
        self.device_driver.driver_msg_type_config_map[msg_type].cfg2 = self.device_cfg2
        packet = self.device_driver.encode_packet(0, msg_type, msg_value).ok
        if self.debug:
            print(' '.join([f"{hex(x).replace('0x', '').upper():0>2}" for x in packet]))
        if self.vspi_mode == VSPICommMode.NETWORK:
            self.vspi_socket.send(packet)
        elif self.vspi_mode == VSPICommMode.WIRED:
            self.vspi_serial_port.write(packet)

    def switch_device_mode(self, device_mode_cfg2: int):
        self.device_cfg2 = device_mode_cfg2
        self.write_msg(0, 11)

    def _handle_control_packet(self):
        print(f"Listening for LtdDriver-{self.device_driver.protocol_version} packet...")
        packet = b''
        while True:
            try:
                byte = self.vspi_socket.recv(1)
            except BlockingIOError:
                continue
            packet += byte
            if packet[-2:] == b'\r\n':
                if packet[0] == self.device_driver.protocol_version[0] and packet[1] == self.device_driver.protocol_version[1]:
                    break
                else:
                    print(f"Invalid LtdDriver-{self.device_driver.protocol_version} packet")
                    packet = b''

        device_msg_res = self.device_driver.decode_packet(packet)
        if device_msg_res.err:
            print(f"Invalid LtdDriver-{self.device_driver.protocol_version} packet")
            return
        device_msg: DeviceMsg = device_msg_res.ok
        if self.debug:
            print('MSG:', device_msg)
        if device_msg.config.msg_type in self.control_feedback_map:
            feedback_packet = self.device_driver.encode_packet(0, self.control_feedback_map[device_msg.config.msg_type], device_msg.msg_value).ok
            self.vspi_socket.send(feedback_packet)

    def start_feedback_control_loop_sync(self):
        while True:
            self._handle_control_packet()

    def _burst_const_msgs(self, offset: int = 20):
        for msg_type in self.device_driver.driver_msg_type_config_map:
            # ignore device error packet
            if msg_type == 14:
                continue
            msg_value = offset + (msg_type + 1) * 10
            self.write_msg(msg_type, msg_value)

    def stream_const_sequence_sync(self):
        while True:
            self._burst_const_msgs()
            time.sleep(0.2)
