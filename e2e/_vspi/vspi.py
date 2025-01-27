import time
import socket
import random
import serial
from enum import Enum
from threading import Thread
from e2e._vspi.ltd_driver import (
    LtdDriver,
    DeviceMsg,
    MsgTypeConfig
)


class VSPICommMode(Enum):
    WIRED = 0
    NETWORK = 1


class VSPI:
    device_cfg2: int = 0
    debug: bool = True
    log_tag: str

    device_model: str
    device_driver: LtdDriver
    control_feedback_map: dict

    vspi_mode: VSPICommMode
    vspi_socket_addr: tuple[str, int]
    vspi_socket: socket.socket

    vspi_serial_port_name: str
    vspi_baud_rate: int
    vspi_serial_port: serial.Serial

    control_loop_running: bool = False
    control_loop_thread: Thread

    def __init__(
        self,
        device_model: str,
        device_driver: LtdDriver,
        control_feedback_map: dict = {},
        vspi_socket_host: str = '127.0.0.1',
        vspi_socket_port: int = 6543,
        vspi_serial_port_name: str = '/dev/ttyACM0',
        vspi_baud_rate: int = 115200,
        vspi_comm_mode: VSPICommMode = VSPICommMode.NETWORK,
        auto_connect: bool = False,
    ):
        self.device_model = device_model
        self.device_driver = device_driver
        self.device_cfg2 = device_driver.driver_msg_type_config_map.get(0, MsgTypeConfig(cfg2=0)).cfg2
        self.control_feedback_map = control_feedback_map
        self.vspi_mode = vspi_comm_mode
        self.vspi_socket_addr = (vspi_socket_host, vspi_socket_port)
        self.vspi_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.vspi_serial_port_name = vspi_serial_port_name
        self.vspi_baud_rate = vspi_baud_rate
        self.log_tag = f"[VSPI-{self.device_model}]"
        if auto_connect:
            self.connect()

    def connect(self):
        print(self.log_tag, 'VSPI Connecting...')
        try:
            if self.vspi_mode == VSPICommMode.NETWORK:
                self.vspi_socket.connect(self.vspi_socket_addr)
            elif self.vspi_mode == VSPICommMode.WIRED:
                self.vspi_serial_port = serial.Serial(port=self.vspi_serial_port_name, baudrate=self.vspi_baud_rate)
            print(self.log_tag, 'VSPI Connecting...OK')

        except Exception as e:
            print(self.log_tag, 'VSPI Connecting...ERR')
            if self.debug:
                print(e)

    def disconnect(self):
        print(self.log_tag, 'VSPI Disconnecting...')
        try:
            if self.vspi_mode == VSPICommMode.NETWORK:
                self.vspi_socket.close()
            elif self.vspi_mode == VSPICommMode.WIRED:
                self.vspi_serial_port.close()
            print(self.log_tag, 'VSPI Disconnecting...OK')

        except Exception as e:
            print(self.log_tag, 'VSPI Disconnecting...ERR')
            if self.debug:
                print(e)

    def write_packet(self, packet: bytes):
        self.vspi_socket.send(packet)

    def write_msg(self, msg_type: int, msg_value: int, sn: int = 0):
        self.device_driver.driver_msg_type_config_map[msg_type].cfg2 = self.device_cfg2
        packet = self.device_driver.encode_packet(sn, msg_type, msg_value).ok
        if self.debug:
            print(' '.join([f"{hex(x).replace('0x', '').upper():0>2}" for x in packet]))
        if self.vspi_mode == VSPICommMode.NETWORK:
            self.vspi_socket.send(packet)
        elif self.vspi_mode == VSPICommMode.WIRED:
            self.vspi_serial_port.write(packet)

    def fltsq_write_msg(self, msg_types: list[int], msg_values: list[int], msg_count: int):
        msg_sequence = [0] * msg_count
        for idx, _t in enumerate(msg_types):
            msg_sequence[_t] = msg_values[idx]
        packet = self.device_driver.fltsq_encode(msg_sequence).ok
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
                    print(f"Invalid LtdDriver-{self.device_model} packet")
                    packet = b''

        device_msg_res = self.device_driver.decode_packet(packet)
        if device_msg_res.err:
            print(f"Invalid LtdDriver-{self.device_model} packet")
            return
        device_msg: DeviceMsg = device_msg_res.ok
        # DEVICE_HEART_BEAT
        if device_msg.config.msg_type == 15:
            return

        if self.debug:
            print('MSG:', device_msg)

        if device_msg.config.msg_type in self.control_feedback_map:
            feedback_packet = self.device_driver.encode_packet(0, self.control_feedback_map[device_msg.config.msg_type], device_msg.msg_value).ok
            self.vspi_socket.send(feedback_packet)

    def start_feedback_control_loop_sync(self):
        if self.control_loop_running:
            print(f"LtdDriver-{self.device_model} Control Loop Already Running")
            return

        self.control_loop_running = True
        print(f"Listening for LtdDriver-{self.device_model} packet...")
        while self.control_loop_running:
            try:
                self._handle_control_packet()
            except KeyboardInterrupt:
                self.control_loop_running = False

    def _burst_const_msgs(self, offset: int = 20, sn: int = 0):
        for msg_type in self.device_driver.driver_msg_type_config_map:
            if not self.device_driver.driver_msg_type_config_map[msg_type].msg_name.startswith('READ_'):
                continue
            msg_value = offset + (msg_type + 1) * 10
            self.write_msg(msg_type, msg_value, sn=sn)

    def _burst_rand_msgs(self, sn: int = 0):
        for msg_type in self.device_driver.driver_msg_type_config_map:
            if not self.device_driver.driver_msg_type_config_map[msg_type].msg_name.startswith('READ_'):
                continue
            msg_value = random.uniform(1, 10)
            self.write_msg(msg_type, msg_value, sn=sn)

    def stream_const_sequence_sync(self):
        c = 0
        while True:
            self._burst_const_msgs(sn=c)
            c += 1
            time.sleep(0.2)

    def stream_rand_sequence_sync(self):
        c = 0
        while True:
            self._burst_rand_msgs(sn=c)
            c += 1
            time.sleep(0.2)

    def burst_sequence(self, sequence: list[tuple[int, int | float]], sn: int = 0):
        for msg_type, msg_value in sequence:
            self.write_msg(msg_type, msg_value, sn)

    def start_feedback_control_loop_async(self):
        if self.control_loop_running:
            print(f"LtdDriver-{self.device_model} Control Loop Already Running")
            return

        self.control_loop_thread = Thread(target=self.start_feedback_control_loop_sync)
        self.control_loop_thread.start()

    def stop_feedback_control_loop_async(self):
        print(f"Stopping LtdDriver-{self.device_model} Control Loop...")
        self.control_loop_running = False
        self.control_loop_thread.join()
        print(f"Stopping LtdDriver-{self.device_model} Control Loop...OK")
