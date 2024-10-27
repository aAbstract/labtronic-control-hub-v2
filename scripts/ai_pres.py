def clean_section(text: str) -> str:
    chars_replace_map = {
        '\u2019': "'",
    }
    out_text = text.strip()
    for old_c, new_c in chars_replace_map.items():
        out_text = out_text.replace(old_c, new_c)
    out_text = out_text.replace('\n', ' ')
    return out_text
