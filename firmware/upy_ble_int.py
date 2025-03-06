import time
import struct
import machine  # type: ignore
import bluetooth  # type: ignore
import micropython  # type: ignore


ADV_TYPE_FLAGS = micropython.const(0x01)
ADV_TYPE_NAME = micropython.const(0x09)
ADV_TYPE_UUID128_COMPLETE = micropython.const(0x7)
ADV_TYPE_APPEARANCE = micropython.const(0x19)
ADV_MAX_PAYLOAD = micropython.const(31)

IRQ_CENTRAL_CONNECT = micropython.const(1)
IRQ_CENTRAL_DISCONNECT = micropython.const(2)
IRQ_GATTS_WRITE = micropython.const(3)

FLAG_READ = micropython.const(0x0002)
FLAG_WRITE_NO_RESPONSE = micropython.const(0x0004)
FLAG_WRITE = micropython.const(0x0008)
FLAG_NOTIFY = micropython.const(0x0010)


def advertising_payload(name: str, service_uuid: bluetooth.UUID) -> bytearray:
    payload = bytearray()

    def payload_append(adv_type, value):
        nonlocal payload
        payload += struct.pack('BB', len(value) + 1, adv_type) + value

    payload_append(ADV_TYPE_FLAGS, struct.pack('B', 6))
    payload_append(ADV_TYPE_NAME, name.encode())
    payload_append(ADV_TYPE_APPEARANCE, struct.pack('<h', 0))
    payload_append(ADV_TYPE_UUID128_COMPLETE, bytes(service_uuid))

    return payload


def zeos_breakpoint(stack_frame: dict = {}):
    print('Starting Debugger...')
    print('Stack Frame:')
    for sf_vk in stack_frame.keys():
        print(sf_vk)
    print('Global Scope:')
    for gs_vk in globals().keys():
        print(gs_vk)
    print('Starting Debugger...OK')
    cmd = ''
    while cmd != 'q':
        try:
            cmd = input('dbg> ')
            if cmd == 'exit':
                break
            else:
                eval(cmd, globals(), stack_frame)
        except Exception as e:
            print('Debug Shell Error: ' + str(e))


class OBD_BLE_Interceptor:
    SERVICE_NAME = 'OBLI'
    SERVICE_UUID = bluetooth.UUID('6E400001-B5A3-F393-E0A9-E50E24DCCA9E')
    RX_CHARAC = (bluetooth.UUID('6E400002-B5A3-F393-E0A9-E50E24DCCA9E'), FLAG_WRITE | FLAG_WRITE_NO_RESPONSE)
    TX_CHARAC = (bluetooth.UUID('6E400003-B5A3-F393-E0A9-E50E24DCCA9E'), FLAG_READ | FLAG_NOTIFY)

    BLE_SERVICES = ((SERVICE_UUID, (TX_CHARAC, RX_CHARAC)),)
    BLE_ADV_INTERVAL_US = 500_000  # 0.5s

    ble: bluetooth.BLE
    adv_payload: bytearray
    conn_id: int
    tx_handler_id: int
    rx_handler_id: int

    elm327_uart: machine.UART
    UART_DELAY = 1

    @staticmethod
    def dlog(msg: str):
        log_tag = f"[{OBD_BLE_Interceptor.SERVICE_NAME}]"
        print(log_tag, msg)

    def __init__(self):
        self.ble = bluetooth.BLE()
        self.ble.active(True)
        self.ble.irq(self.irq)

        ((self.tx_handler_id, self.rx_handler_id),) = self.ble.gatts_register_services(OBD_BLE_Interceptor.BLE_SERVICES)
        self.adv_payload = advertising_payload(OBD_BLE_Interceptor.SERVICE_NAME, OBD_BLE_Interceptor.SERVICE_UUID)
        OBD_BLE_Interceptor.dlog(f"Advertising Payload Size: {len(self.adv_payload)}")

        OBD_BLE_Interceptor.dlog('BLE Advertising Started')
        self.ble.gap_advertise(OBD_BLE_Interceptor.BLE_ADV_INTERVAL_US, adv_data=self.adv_payload)

        OBD_BLE_Interceptor.dlog('Connecting to ELM327 Device...')
        self.elm327_uart = machine.UART(2, baudrate=38400, rx=22, tx=23)
        self.elm327_uart.write(b'ATZ\r')
        time.sleep(OBD_BLE_Interceptor.UART_DELAY)
        elm327_uart_init_resp = self.elm327_uart.read()
        OBD_BLE_Interceptor.dlog('ELM327 Init Response: ' + ' '.join([f"0x{x:02X}|{OBD_BLE_Interceptor.__fmt_byte(x)}" for x in elm327_uart_init_resp]))
        if b'ELM327 v1.5' in elm327_uart_init_resp:
            OBD_BLE_Interceptor.dlog('Connecting to ELM327 Device...OK')
        else:
            OBD_BLE_Interceptor.dlog('Connecting to ELM327 Device...ERR')

    @staticmethod
    def __fmt_byte(byte: int) -> str:
        if byte == 0x0D:
            return '\\r'
        else:
            return chr(byte)

    def ble_rx_handler(self, data: bytes):
        obd_cmd_hex = ' '.join([f"0x{x:02X}|{OBD_BLE_Interceptor.__fmt_byte(x)}" for x in data])
        OBD_BLE_Interceptor.dlog('OBD Command: ' + obd_cmd_hex)
        self.elm327_uart.write(data)
        time.sleep(OBD_BLE_Interceptor.UART_DELAY)

        obd_resp = self.elm327_uart.read()
        obd_resp_hex = ' '.join([f"0x{x:02X}|{OBD_BLE_Interceptor.__fmt_byte(x)}" for x in obd_resp])
        OBD_BLE_Interceptor.dlog('OBD Response: ' + obd_resp_hex)
        self.ble.gatts_notify(self.conn_id, self.tx_handler_id, obd_resp)

    def irq(self, event: int, data: tuple):
        if event == IRQ_CENTRAL_CONNECT:
            conn_id, _, _ = data
            self.conn_id = conn_id
            OBD_BLE_Interceptor.dlog(f"Received Connection ID: {conn_id}")

        elif event == IRQ_CENTRAL_DISCONNECT:
            conn_id, _, _ = data
            self.conn_id = -1
            OBD_BLE_Interceptor.dlog(f"Closed Connection ID: {conn_id}")

            OBD_BLE_Interceptor.dlog('BLE Advertising Started')
            self.ble.gap_advertise(OBD_BLE_Interceptor.BLE_ADV_INTERVAL_US, adv_data=self.adv_payload)

        elif event == IRQ_GATTS_WRITE:
            conn_id, rx_handle_id = data
            value = self.ble.gatts_read(rx_handle_id)
            if rx_handle_id == self.rx_handler_id:
                self.ble_rx_handler(value)


def main():
    OBD_BLE_Interceptor()
    while True:
        time.sleep(1)


if __name__ == '__main__':
    main()
