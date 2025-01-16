import serial


serial_port_name: str = '/dev/ttyUSB0'
baud_rate: int = 38400
serial_port = serial.Serial(port=serial_port_name, baudrate=baud_rate)


def check_pid_code(pid_code: str) -> tuple[bool, bytes]:
    print('Trying PID Code:', pid_code)
    serial_port.write((pid_code + '\r').encode())
    res = serial_port.read_until(b'>')
    print('OBDII Response:', res)

    if res == b'NO DATA\r\r>':
        return False, b''

    res_parts = res.split()
    if res_parts[0] != b'7F':
        return True, res

    else:
        return False, b''


def scan_modes():
    modes = []
    for i in range(2**8):
        for j in [0, 1, 2, 5, 12, 73]:
            pid_code = f"{i:02X}{j:02X}"
            success, res = check_pid_code(pid_code)
            if success:
                modes.append((pid_code, res))
    print('Found Codes:', len(modes))
    breakpoint()


def scan_commands():
    commands = []
    for mode in [62, 153, 59, 9, 160, 169, 168, 33, 48, 16]:
        for command in range(2**8):
            pid_code = f"{mode:02X}{command:02X}"
            success, res = check_pid_code(pid_code)
            if success:
                commands.append((pid_code, res))
    return commands


if __name__ == '__main__':
    commands = scan_commands()
    breakpoint()
