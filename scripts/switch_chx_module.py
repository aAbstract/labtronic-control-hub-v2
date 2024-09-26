import re
import sys
from dataclasses import dataclass


@dataclass
class CHXModuleConfig:
    device_model: str
    serial_adapter_module: str
    control_panel_module: str


CHX_MAP = {
    'lt_ch000': CHXModuleConfig(
        device_model='LT-CH000',
        serial_adapter_module='./device_drivers/lt_ch000',
        control_panel_module='@renderer/components/DeviceControl/LT_CH000.vue',
    ),
    'lt_ht103': CHXModuleConfig(
        device_model='LT-HT103',
        serial_adapter_module='./device_drivers/lt_ht103',
        control_panel_module='@renderer/components/DeviceControl/LT_HT103.vue',
    ),
    'lt_ht107': CHXModuleConfig(
        device_model='LT-HT107',
        serial_adapter_module='./device_drivers/lt_ht107',
        control_panel_module='@renderer/components/DeviceControl/LT_HT107.vue',
    ),
    'lt_ht113': CHXModuleConfig(
        device_model='LT-HT113',
        serial_adapter_module='./device_drivers/lt_ht113',
        control_panel_module='@renderer/components/DeviceControl/LT_HT113.vue',
    ),
    'lt_to101': CHXModuleConfig(
        device_model='LT-TO101',
        serial_adapter_module='./device_drivers/lt_to101',
        control_panel_module='@renderer/components/DeviceControl/LT_TO101.vue',
    ),
    'lt_re600': CHXModuleConfig(
        device_model='LT-RE600',
        serial_adapter_module='./device_drivers/lt_re600',
        control_panel_module='@renderer/components/DeviceControl/LT_RE600.vue',
    ),
}


def sub_line(src_code: str, pattern: re.Pattern[str], patch: str) -> tuple[bool, str, str]:
    src_lines = src_code.split('\n')
    for idx, line in enumerate(src_lines):
        if re.findall(pattern, line):
            src_lines[idx] = patch
            return True, '\n'.join(src_lines), line
    return False, '\n'.join(src_lines), ''


def apply_chx_config(_config: CHXModuleConfig):
    index_ts_file = 'src/main/index.ts'
    app_vue_file = 'src/renderer/src/App.vue'

    # patch index.ts
    chx_serial_adapter = _config.device_model.lower().replace('-', '_')
    chx_serial_adapter_patch = f"import {{ init_{chx_serial_adapter}_serial_adapter }} from '{_config.serial_adapter_module}';"
    chx_serial_adapter_init_patch = f"  ipcMain.on('load_device_driver', () => init_{chx_serial_adapter}_serial_adapter(mainWindow));"
    with open(index_ts_file, 'r') as f:
        index_ts_src = f.read()

    success_1, patched_1, match_1 = sub_line(
        index_ts_src,
        r"import \{ init_lt_[a-z]{2}[0-9]{3}_serial_adapter \}",
        chx_serial_adapter_patch,
    )
    if not success_1:
        print(f"Patch - {index_ts_file}: {match_1} -> {chx_serial_adapter_patch}...ERR")
        sys.exit(1)
    print(f"Patch - {index_ts_file}: {match_1} -> {chx_serial_adapter_patch}...OK")

    success_2, patched_2, match_2 = sub_line(
        patched_1,
        r"\'load_device_driver\'",
        chx_serial_adapter_init_patch,
    )
    if not success_2:
        print(f"Patch - {index_ts_file}: {match_2} -> {chx_serial_adapter_init_patch}...ERR")
        sys.exit(1)
    print(f"Patch - {index_ts_file}: {match_2} -> {chx_serial_adapter_init_patch}...OK")

    with open(index_ts_file, 'w') as f:
        f.write(patched_2)

    # patch App.vue
    chx_device_model = _config.device_model.replace('-', '_')
    chx_device_model_patch = f"const DEVICE_MODEL = '{_config.device_model}';"
    chx_control_panel_import_patch = f"import {chx_device_model} from '@renderer/components/DeviceControl/{chx_device_model}.vue';"
    chx_control_panel_mount_patch = f"          <{chx_device_model} />"
    with open(app_vue_file, 'r') as f:
        app_vue_src = f.read()

    success_1, patched_1, match_1 = sub_line(
        app_vue_src,
        r"import LT_[A-Z]{2}[0-9]{3} from '@renderer/components/DeviceControl/LT_[A-Z]{2}[0-9]{3}.vue';",
        chx_control_panel_import_patch,
    )
    if not success_1:
        print(f"Patch - {app_vue_file}: {match_1} -> {chx_control_panel_import_patch}...ERR")
        sys.exit(1)
    print(f"Patch - {app_vue_file}: {match_1} -> {chx_control_panel_import_patch}...OK")

    success_2, patched_2, match_2 = sub_line(
        patched_1,
        r"const DEVICE_MODEL = \'LT\-[A-Z]{2}[0-9]{3}\';",
        chx_device_model_patch,
    )
    if not success_2:
        print(f"Patch - {app_vue_file}: {match_2} -> {chx_device_model_patch}...ERR")
        sys.exit(1)
    print(f"Patch - {app_vue_file}: {match_2} -> {chx_device_model_patch}...OK")

    success_3, patched_3, match_3 = sub_line(
        patched_2,
        r"<LT_[A-Z]{2}[0-9]{3} />",
        chx_control_panel_mount_patch,
    )
    if not success_3:
        print(f"Patch - {app_vue_file}: {match_3} -> {chx_control_panel_mount_patch}...ERR")
        sys.exit(1)
    print(f"Patch - {app_vue_file}: {match_3} -> {chx_control_panel_mount_patch}...OK")

    with open(app_vue_file, 'w') as f:
        f.write(patched_3)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage python scripts/switch_chx_module.py <chx_module_name>')
        print('chx_module:', list(CHX_MAP.keys()))
        sys.exit(1)

    chx_module = sys.argv[1]
    if chx_module not in CHX_MAP:
        print('Invalid chx_module')
        print('chx_module:', list(CHX_MAP.keys()))
        sys.exit(1)

    chx_module_config = CHX_MAP[chx_module]
    apply_chx_config(chx_module_config)
