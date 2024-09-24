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
        control_panel_module='@renderer/components/DeviceControl/LT_re600.vue',
    ),
}


def sub_line(src_code: str, pattern: re.Pattern[str], patch: str) -> str:
    src_lines = src_code.split('\n')
    for idx, line in enumerate(src_lines):
        if re.findall(pattern, line):
            src_lines[idx] = patch


def apply_chx_config(_config: CHXModuleConfig):
    index_ts_file = 'src/main/index.ts'
    app_vue_file = 'src/renderer/src/App.vue'
    with open(index_ts_file, 'r') as f:
        patched_index_ts = sub_line(f.read(), r'', '')


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
