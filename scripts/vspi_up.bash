#!/bin/bash

sudo socat -dd pty,raw,echo=0,link=/dev/ttyS90,mode=777 pty,raw,echo=0,link=/dev/ttyS91,mode=777
socat -dd TCP-LISTEN:6543,reuseaddr,fork FILE:/dev/ttyS91,raw,echo=0




# for OBD2
sudo socat -dd pty,raw,echo=0,link=/dev/ttyS100,mode=777 pty,raw,echo=0,link=/dev/ttyS101,mode=777
socat -dd TCP-LISTEN:6544,reuseaddr,fork FILE:/dev/ttyS101,raw,echo=0
