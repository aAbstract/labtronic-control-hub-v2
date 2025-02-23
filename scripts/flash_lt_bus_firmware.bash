#!/bin/bash

clear_fs=false
enable_debug=false

while getopts "cd" opt; do
    case $opt in
        c) clear_fs=true ;;
        d) enable_debug=true ;;
        *) exit 1 ;;
    esac
done

if $clear_fs; then
    echo "Clearing Board File System"
    mpremote u0 exec 'import os; [print("Removing:", f) or os.remove(f) for f in os.listdir()]'
fi

if $enable_debug; then
    echo "Adding ZEOS Debug Tools"
    mpremote u0 fs cp e2e/_lt_bus_vspi/zeos_debugger.py :zeos_debugger.py
fi

mpremote u0 fs cp e2e/_lt_bus_vspi/lt_bus_utils.py :lt_bus_utils.py
mpremote u0 fs cp e2e/_lt_bus_vspi/lt_bus_vspi_firmware.py :main.py
