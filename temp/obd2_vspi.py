# type: ignore
import time
import socket
import serial
from enum import Enum
from dataclasses import dataclass


class Obd2VspiCommMode(Enum):
    WIRED = 0
    NETWORK = 1


class Obd2Vspi:
    debug: bool = True
    log_tag: str
    device_model: str

    vspi_mode: Obd2VspiCommMode
    vspi_socket_addr: tuple[str, int]
    vspi_socket: socket.socket

    vspi_serial_port_name: str
    vspi_baud_rate: int
    vspi_serial_port: serial.Serial

    obd2_hash_map: dict[int, Obd2Msg]
    obd2_term_seq: bytes

    def __init__(
            self,
            vspi_socket_host: str = '127.0.0.1',
            vspi_socket_port: int = 6543,
            vspi_serial_port_name: str = '/dev/ttyUSB0',
            vspi_baud_rate: int = 38400,
            vspi_comm_mode: Obd2VspiCommMode = Obd2VspiCommMode.WIRED,
            auto_connect: bool = False,
    ):
        self.device_model = 'LT-OBD2-DRIVER'
        self.vspi_mode = vspi_comm_mode
        self.vspi_socket_addr = (vspi_socket_host, vspi_socket_port)
        self.vspi_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.vspi_serial_port_name = vspi_serial_port_name
        self.vspi_baud_rate = vspi_baud_rate
        self.log_tag = f"[VSPI-{self.device_model}]"
        self.obd2_hash_map = {x.name: x for x in OBD2_TABLE}
        self.obd2_term_seq = b'\r\r>'

        if auto_connect:
            self.connect()

    def _write_packet(self, ascii_seq: str):
        packet = (ascii_seq + '\r').encode()
        if self.vspi_mode == Obd2VspiCommMode.NETWORK:
            self.vspi_socket.send(packet)
        elif self.vspi_mode == Obd2VspiCommMode.WIRED:
            self.vspi_serial_port.write(packet)
            time.sleep(0.1)

    # def _recv_packet(self, n: int) -> bytes:
    #     if self.vspi_mode == Obd2VspiCommMode.NETWORK:
    #         return self.vspi_socket.recv(n)
    #     elif self.vspi_mode == Obd2VspiCommMode.WIRED:
    #         return self.vspi_serial_port.read(n)

    def _init_obd2(self):
        init_at_commands = [
            'ATZ',
            'ATS0',
            'ATH0',
            'ATE0',
            'ATAT2',
            
            'ATSP6',
        ]

        for itac in init_at_commands:
            print(self.log_tag, 'AT Config Request:', itac)
            self._write_packet(itac)
            print(self.log_tag, 'AT Config Response:', self.vspi_serial_port.read_until(self.obd2_term_seq))

        # for iatc in init_at_commands:
        #     self._write_packet(iatc)
        #     time.sleep(1)

    def _decode_obd_temp(data: bytes) -> float:
        pass

    def connect(self):
        print(self.log_tag, 'Obd2Vspi Connecting...')
        try:
            if self.vspi_mode == Obd2VspiCommMode.NETWORK:
                self.vspi_socket.connect(self.vspi_socket_addr)
            elif self.vspi_mode == Obd2VspiCommMode.WIRED:
                self.vspi_serial_port = serial.Serial(port=self.vspi_serial_port_name, baudrate=self.vspi_baud_rate)
            self._init_obd2()
            print(self.log_tag, 'Obd2Vspi Connecting...OK')

        except Exception as e:
            print(self.log_tag, 'Obd2Vspi Connecting...ERR')
            if self.debug:
                print(e)

    def disconnect(self):
        print(self.log_tag, 'Obd2Vspi Disconnecting...')
        try:
            if self.vspi_mode == Obd2VspiCommMode.NETWORK:
                self.vspi_socket.close()
            elif self.vspi_mode == Obd2VspiCommMode.WIRED:
                self.vspi_serial_port.close()
            print(self.log_tag, 'Obd2Vspi Disconnecting...OK')

        except Exception as e:
            print(self.log_tag, 'Obd2Vspi Disconnecting...ERR')
            if self.debug:
                print(e)

    def pid_req(self, pid_name: str) -> str:
        obd2_msg = self.obd2_hash_map[pid_name]
        pid_code = '%02X' % obd2_msg.mode.value + '%02X' % obd2_msg.pid.value
        print(self.log_tag, 'OBD2 Request:', pid_code)
        self._write_packet(pid_code)
        obd2_res = self.vspi_serial_port.read_until(self.obd2_term_seq)
        print(self.log_tag, 'OBD2 Response:', obd2_res)
        _v = obd2_res[2] * 100 / 255
        return f"{_v:.2f}%"
