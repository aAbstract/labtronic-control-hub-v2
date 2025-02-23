import os
import re
import sys


CHX_MODULES = [
    'lt_ch000',
    'lt_ch500',
    'lt_ht004',
    'lt_ht103',
    'lt_ht107',
    'lt_ht113',
    'lt_to101',
    'lt_to202',
    'lt_re600',
    'lt_ev574',
]


def sub_line(src_code: str, pattern: re.Pattern[str], patch: str) -> tuple[bool, str, str]:
    src_lines = src_code.split('\n')
    for idx, line in enumerate(src_lines):
        if re.findall(pattern, line):
            src_lines[idx] = patch
            return True, '\n'.join(src_lines), line
    return False, '\n'.join(src_lines), ''


def apply_chx_config(chx_module: str):
    index_ts_file = 'src/main/index.ts'
    app_vue_file = 'src/renderer/src/App.vue'

    # patch index.ts
    chx_serial_adapter = chx_module
    chx_serial_adapter_patch = f"import {{ init_{chx_serial_adapter}_serial_adapter }} from './device_drivers/{chx_serial_adapter}';"
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
    chx_device_model = chx_module.upper()
    chx_device_model_patch = f"const DEVICE_MODEL = '{chx_device_model.replace('_','-')}';"
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
        print('Usage python scripts/switch_chx_module.py <chx_module>')
        print('chx_module:', CHX_MODULES)
        sys.exit(1)

    chx_module = sys.argv[1]
    if chx_module not in CHX_MODULES:
        print('Invalid chx_module')
        print('chx_module:', CHX_MODULES)
        sys.exit(1)

    apply_chx_config(chx_module)
    os.system('npm run dev')
