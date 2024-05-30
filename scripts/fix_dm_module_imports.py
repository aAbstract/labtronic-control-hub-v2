from glob import glob


LINE_SYM_MAP = {
    "import { BASE_URL } from 'src/lib/defines';": "import { get_base_url } from '@renderer/lib/lt_cdn_api';",
    "import { get_asset_link } from 'src/api/manuals';": "import { get_asset_link } from '@renderer/lib/lt_cdn_api';",
}
TOKEN_SYM_MAP = {
    "res.success": "res.ok",
    "res.error": "res.err",
    "${BASE_URL}": "${get_base_url()}",
    "#757575": "var(--font-color)",
    "#bdbdbd": "var(--empty-gauge-color)",
}


def read_file(fpath: str) -> str:
    with open(fpath, 'r') as f:
        return f.read()


def write_file(fpath: str, content: str):
    with open(fpath, 'w') as f:
        return f.write(content)


def sym_replace(file_name: str, code: str) -> str:
    lines = code.split('\n')
    for idx, line in enumerate(lines):
        if line in LINE_SYM_MAP:
            lines[idx] = LINE_SYM_MAP[line]
            print(f"{file_name}:", idx, line, '->', LINE_SYM_MAP[line])
            continue
        for token in TOKEN_SYM_MAP:
            if token in line:
                _line = line.replace(token, TOKEN_SYM_MAP[token])
                lines[idx] = _line
                print(f"{file_name}:", idx, line, '->', _line)
    return '\n'.join(lines)


target_files = glob('src/renderer/src/components/DeviceManual/*.vue')
for file in target_files:
    code = read_file(file)
    new_code = sym_replace(file, code)
    write_file(file, new_code)
