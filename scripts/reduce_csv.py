INPUT_FILENAME = 'big_sample'
OUTPUT_FILENAME = f"{INPUT_FILENAME}_reduced"
N = 100

out_lines = []
with open(f"data/{INPUT_FILENAME}.csv", 'r') as f:
    file_content = f.read()
    lines = file_content.split('\n')
    csv_header = lines.pop(0)
    out_lines.append(csv_header)
    for line in lines:
        sn = int(line.split(',')[0])
        if sn % N == 0:
            out_lines.append(line)

with open(f"data/{OUTPUT_FILENAME}.csv", 'w') as f:
    f.write('\n'.join(out_lines))
