# LabTronic Control Hub V2

## Description
LabTronic Devices Software MonoRepo

## Tech Stack
The software was built using hybrid technology stack.  
This stack allows the software to run on Desktop (Windows, MacOS, GNU/Linux) or the Web.  
The UI was built using Vue3 framework and PrimeVue components library.  
ElectronJS was used to access device native functionality.  
<a href="https://nodejs.org" target="_blank" rel="noreferrer">
    <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original-wordmark.svg" alt="nodejs" width="40" height="40"/>
</a>
<a href="https://www.electronjs.org" target="_blank" rel="noreferrer">
    <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/electron/electron-original.svg" alt="electron" width="40" height="40"/>
</a>
<a href="https://vuejs.org/" target="_blank" rel="noreferrer">
    <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/vuejs/vuejs-original-wordmark.svg" alt="vuejs" width="40" height="40"/>
</a>

## Features
- [x] GUI Device Control
- [x] Display Device Readings
- [x] Connected to LabTronic Cloud CDN
- [x] Device Readings Database
- [ ] Cloud Device Control
- [x] Export Data, Graphs, Insights
- [x] Easy Lab Report Generation

## Run on Windows
1. Install NodeJS from this [Link](https://nodejs.org/en)
2. Install Git from this [Link](https://git-scm.com/download/win)
3. Install Python from this [Link](https://www.python.org/downloads/)
4. Clone the Repo
```bash
git clone https://github.com/aAbstract/labtronic-control-hub-v2.git
```
5. Install Dependencies
```bash
npm install
```
6. Run the Software
```bash
npm run dev
```
7. Run CHX Module
```bash
python scripts/run_chx_module.py <chx_module_name>

# chx_module_name
# Cross Flow Membrane Filtration: lt_ch000

# Heat Conduction in Metals: lt_ht103
# Linear and Radial Heat Conduction: lt_ht107
# Unsteady Heat Transfer Apparatus: lt_ht113
# Free and Forced Convection: lt_ht004

# Change of State of Gases: lt_to101
# Temperature Measurement Trainer: lt_to202

# Wind Energy Training System: lt_re600
```

## E2E Testing - Docs
**Project Setup**  
- E2E testing is implemented using **Python + Selenium**
- E2E testing project is located at **e2e** folder
- The testing project entrypoint is **e2e/e2e_main.py**
```bash
$ python e2e/e2e_main.py --help
```
```bash
usage: e2e_main [-h] [--module MODULE] [--user-story USER_STORY]

LabTronic E2E Testing Program

options:
  -h, --help            show this help message and exit
  --module MODULE, -m MODULE
                        E2E Test Module
  --user-story USER_STORY, -us USER_STORY
                        E2E Test User Story

example: python e2e/e2e_main.py -m us_control_switch_plug -us us_control_switch_card_body
```
- LabTronic E2E testing project consists of E2E modules
- E2E module is each file with this path pattern e2e/us_*.py
- Eeach E2E module contains user stories functions
```python
# user story function signature
def us_*(driver: webdriver.Chrome) -> int:
    if SUCCESS: return 0
    elif: return NON_ZERO_RC

# example
def us_check_chx_device_state(driver: webdriver.Chrome) -> int:
    pass
```

**Device Emulator**  
- To emulate a device connected to a serial port on a linux system use these two commands
```bash
# create two connected pesudo terminals `/dev/ttyS90` and `/dev/ttyS91`
$ sudo socat -dd pty,raw,echo=0,link=/dev/ttyS90,mode=777 pty,raw,echo=0,link=/dev/ttyS91,mode=777
```
```bash
# connect the `/dev/ttyS91` pesudo terminal to a TCP socket on address 127.0.0.1:6543
$ socat -dd TCP-LISTEN:6543,reuseaddr,fork FILE:/dev/ttyS91,raw,echo=0
```
- Now an emulator program can connect to this address `127.0.0.1:6543` and communicate with the software as a usb device
- To interact with the software using the simulation port, Each device has a specific protocol
- These protocols are implemented in **e2e/_vspi/test_drivers.py**
- These protocols are wrapped in a TCP socket connection in **e2e/_vspi/test_vspis.py**
- Object in **e2e/_vspi/test_vspis.py** can be used in your E2E testing scripts or using emulator terminal
- To start the emulator terminal, Run this command
```bash
$ python e2e/_vspi/test_drivers.py
```
- This command will spawn a python shell and populate its context with a list of VSPI objects that facilitate device interactions

**Utils**  
- **e2e/e2e_utils.py** contains some utility functions to help in E2E testing
- For Example:
    - js_click: perform touch independent mouse click in Selenium
    - elog, ilog: used to print logs

## E2E Testing - Running
1. Configure the targeted CHX module using **scripts/run_chx_module.py** script
2. Run the software in debug mode using **.vscode/launch.json** config script
3. This command will run all E2E modules
```bash
python e2e/e2e_main.py
```
4. To run single E2E module use this command
```bash
$ python e2e/e2e_main.py -m <module_name>

# example: python e2e/e2e_main.py -m us_control_switch_plug
```
5. To run single user story function use this command
```bash
$ python e2e/e2e_main.py -m <module_name> -us <func_name>

# example: python e2e/e2e_main.py -m us_control_switch_plug -us us_control_switch_card_body
```
