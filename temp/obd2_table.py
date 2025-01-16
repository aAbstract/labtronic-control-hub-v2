from enum import Enum
from dataclasses import dataclass


class Obd2Mode(Enum):
    REAL_TIME = 0x01
    VEHICLE_INFO = 0x09


class Obd2PidCode(Enum):
    PIDSUPP0 = 0x00
    DTC_CNT = 0x01
    DTCFRZF = 0x02
    FUELSYS = 0x03
    LOAD_PCT = 0x04
    TEMP = 0x05
    SHRTFT13 = 0x06
    LONGFT13 = 0x07
    SHRTFT24 = 0x08
    LONGFT24 = 0x09
    FRP = 0x0A
    MAP = 0x0B
    RPM = 0x0C
    VSS = 0x0D
    SPARKADV = 0x0E
    IAT = 0x0F
    MAF = 0x10
    THROTTLEPOS = 0x11
    AIR_STAT = 0x12
    O2SLOC = 0x13
    O2S11 = 0x14
    O2S12 = 0x15
    O2S13 = 0x16
    O2S14 = 0x17
    O2S21 = 0x18
    O2S22 = 0x19
    O2S23 = 0x1A
    O2S24 = 0x1B
    OBDSUP = 0x1C
    O2SLOC2 = 0x1D
    PTO_STAT = 0x1E
    RUNTM = 0x1F
    PIDDSUPP2 = 0x20
    MIL_DIST = 0x21
    FRPM = 0x22
    FRPD = 0x23
    LAMBDA11 = 0x24
    LAMBDA12 = 0x25
    LAMBDA13 = 0x26
    LAMBDA14 = 0x27
    LAMBDA21 = 0x28
    LAMBDA22 = 0x29
    LAMBDA23 = 0x2A
    LAMBDA24 = 0x2B
    EGR_PCT = 0x2C
    EGR_ERR = 0x2D
    EVAP_PCT = 0x2E
    FLI = 0x2F
    WARM_UPS = 0x30
    CLR_DIST = 0x31
    EVAP_VP = 0x32
    BARO = 0x33
    LAMBDAC11 = 0x34
    LAMBDAC12 = 0x35
    LAMBDAC13 = 0x36
    LAMBDAC14 = 0x37
    LAMBDAC21 = 0x38
    LAMBDAC22 = 0x39
    LAMBDAC23 = 0x3A
    LAMBDAC24 = 0x3B
    CATEMP11 = 0x3C
    CATEMP21 = 0x3D
    CATEMP12 = 0x3E
    CATEMP22 = 0x3F
    PIDDSUPP4 = 0x40
    MONITORSTAT = 0x41
    VPWR = 0x42
    LOAD_ABS = 0x43
    LAMBDA = 0x44
    TP_R = 0x45
    AAT = 0x46
    TP_B = 0x47
    TP_C = 0x48
    APP_D = 0x49
    APP_E = 0x4A
    APP_F = 0x4B
    TAC_PCT = 0x4C
    MIL_TIME = 0x4D
    CLR_TIME = 0x4E
    EXTTEST1 = 0x4F
    EXTTEST2 = 0x50
    FUEL_TYPE = 0x51
    ALCH_PCT = 0x52
    ABS_VP = 0x53
    SYSTEM_VP = 0x54
    S02B13 = 0x55
    L02B13 = 0x56
    S02B24 = 0x57
    L02B24 = 0x58
    FRP_ABS = 0x59
    PEDALPOS = 0x5A
    HYBRIDLIFE = 0x5B
    ENGINEOILT = 0x5C
    FINJTIMING = 0x5D
    ENGINEFRATE = 0x5E
    EMMISSIONREQ = 0x5F
    AET = 0x62
    ECT = 0x67
    EGRT = 0x6B
    FPC = 0x6D
    IPCT = 0x6E
    EP = 0x73
    EGT = 0x78
    VINSUPP0 = 0x00
    VIN_MSCOUT = 0x01
    VIN = 0x02


@dataclass
class Obd2Msg:
    mode: Obd2Mode
    pid: Obd2PidCode
    name: str
    size: int
    unit: str
    description: str


OBD2_TABLE: list[Obd2Msg] = [
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.PIDSUPP0, name='pidsupp0', size=4, unit='Bit Encoded', description='Service 0x01 - Show Current Data - Supported PIDs'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.DTC_CNT, name='dtc_cnt', size=4, unit='Bit Encoded', description='Monitor status since DTCs cleared'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.DTCFRZF, name='dtcfrzf', size=2, unit='Bit Encoded', description='DTC that caused required freeze frame data storage'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.FUELSYS, name='fuelsys', size=2, unit='Bit Encoded', description='Fuel system 1 and 2 status'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.LOAD_PCT, name='load_pct', size=1, unit='%', description='Calculated LOAD Value'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.TEMP, name='temp', size=1, unit='Celsius', description='Engine Coolant Temperature'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.SHRTFT13, name='shrtft13', size=1, unit='%', description='Short Term Fuel Trim - Bank 1,3'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.LONGFT13, name='longft13', size=1, unit='%', description='Long Term Fuel Trim - Bank 1,3'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.SHRTFT24, name='shrtft24', size=1, unit='%', description='Short Term Fuel Trim - Bank 2,4'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.LONGFT24, name='longft24', size=1, unit='%', description='Long Term Fuel Trim - Bank 2,4'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.FRP, name='frp', size=1, unit='kPa', description='Fuel Pressure'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.MAP, name='map', size=1, unit='kPa', description='Intake Manifold Absolute Pressure'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.RPM, name='rpm', size=2, unit='rev/min', description='Engine RPM'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.VSS, name='vss', size=1, unit='km/h', description='Vehicle Speed Sensor'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.SPARKADV, name='sparkadv', size=1, unit='degrees relative to #1 cylinder', description='Ignition Timing Advance for #1 Cylinder'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.IAT, name='iat', size=1, unit='Celsius', description='Intake Air Temperature'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.MAF, name='maf', size=2, unit='g/s', description='Air Flow Rate from Mass Air Flow Sensor'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.THROTTLEPOS, name='throttlepos', size=1, unit='%', description='Absolute Throttle Position'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.AIR_STAT, name='air_stat', size=1, unit='Bit Encoded', description='Commanded Secondary Air Status'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.O2SLOC, name='o2sloc', size=1, unit='Bit Encoded', description='Location of Oxygen Sensors'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.O2S11, name='o2s11', size=2, unit='V', description='Bank 1 - Sensor 1/Bank 1 - Sensor 1 Oxygen Sensor Output Voltage / Short Term Fuel Trim'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.O2S12, name='o2s12', size=2, unit='V', description='Bank 1 - Sensor 2/Bank 1 - Sensor 2 Oxygen Sensor Output Voltage / Short Term Fuel Trim'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.O2S13, name='o2s13', size=2, unit='V', description='Bank 1 - Sensor 3/Bank 2 - Sensor 1 Oxygen Sensor Output Voltage / Short Term Fuel Trim'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.O2S14, name='o2s14', size=2, unit='V', description='Bank 1 - Sensor 4/Bank 2 - Sensor 2 Oxygen Sensor Output Voltage / Short Term Fuel Trim'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.O2S21, name='o2s21', size=2, unit='V', description='Bank 2 - Sensor 1/Bank 3 - Sensor 1 Oxygen Sensor Output Voltage / Short Term Fuel Trim'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.O2S22, name='o2s22', size=2, unit='V', description='Bank 2 - Sensor 2/Bank 3 - Sensor 2 Oxygen Sensor Output Voltage / Short Term Fuel Trim'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.O2S23, name='o2s23', size=2, unit='V', description='Bank 2 - Sensor 3/Bank 4 - Sensor 1 Oxygen Sensor Output Voltage / Short Term Fuel Trim'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.O2S24, name='o2s24', size=2, unit='V', description='Bank 2 - Sensor 4/Bank 4 - Sensor 2 Oxygen Sensor Output Voltage / Short Term Fuel Trim'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.OBDSUP, name='obdsup', size=1, unit='Bit Encoded', description='OBD requirements to which vehicle is designed'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.O2SLOC2, name='o2sloc2', size=1, unit='Bit Encoded', description='Location of oxygen sensors'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.PTO_STAT, name='pto_stat', size=1, unit='Bit Encoded', description='Auxiliary Input Status'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.RUNTM, name='runtm', size=2, unit='seconds', description='Time Since Engine Start'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.PIDDSUPP2, name='piddsupp2', size=4, unit='Bit Encoded', description='PIDs supported 21-40'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.MIL_DIST, name='mil_dist', size=2, unit='km', description='Distance Travelled While MIL is Activated'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.FRPM, name='frpm', size=2, unit='kPa', description='Fuel Rail Pressure relative to manifold vacuum'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.FRPD, name='frpd', size=2, unit='kPa', description='Fuel Rail Pressure (diesel)'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.LAMBDA11, name='lambda11', size=4, unit='(ratio)', description='Bank 1 - Sensor 1/Bank 1 - Sensor 1 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.LAMBDA12, name='lambda12', size=4, unit='(ratio)', description='Bank 1 - Sensor 2/Bank 1 - Sensor 2 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.LAMBDA13, name='lambda13', size=4, unit='(ratio)', description='Bank 1 - Sensor 3 /Bank 2 - Sensor 1(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.LAMBDA14, name='lambda14', size=4, unit='(ratio)', description='Bank 1 - Sensor 4 /Bank 2 - Sensor 2(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.LAMBDA21, name='lambda21', size=4, unit='(ratio)', description='Bank 2 - Sensor 1 /Bank 3 - Sensor 1(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.LAMBDA22, name='lambda22', size=4, unit='(ratio)', description='Bank 2 - Sensor 2 /Bank 3 - Sensor 2(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.LAMBDA23, name='lambda23', size=4, unit='(ratio)', description='Bank 2 - Sensor 3 /Bank 4 - Sensor 1(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.LAMBDA24, name='lambda24', size=4, unit='(ratio)', description='Bank 2 - Sensor 4 /Bank 4 - Sensor 2(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.EGR_PCT, name='egr_pct', size=1, unit='%', description='Commanded EGR'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.EGR_ERR, name='egr_err', size=1, unit='%', description='EGR Error'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.EVAP_PCT, name='evap_pct', size=1, unit='%', description='Commanded Evaporative Purge'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.FLI, name='fli', size=1, unit='%', description='Fuel Level Input'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.WARM_UPS, name='warm_ups', size=1, unit='', description='Number of warm-ups since diagnostic trouble codes cleared'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.CLR_DIST, name='clr_dist', size=2, unit='km', description='Distance since diagnostic trouble codes cleared'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.EVAP_VP, name='evap_vp', size=2, unit='Pa', description='Evap System Vapour Pressure'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.BARO, name='baro', size=1, unit='kPa', description='Barometric Pressure'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.LAMBDAC11, name='lambdac11', size=4, unit='(ratio)', description='Bank 1 - Sensor 1/Bank 1 - Sensor 1 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.LAMBDAC12, name='lambdac12', size=4, unit='(ratio)', description='Bank 1 - Sensor 2/Bank 1 - Sensor 2 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.LAMBDAC13, name='lambdac13', size=4, unit='(ratio)', description='Bank 1 - Sensor 3/Bank 2 - Sensor 1 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.LAMBDAC14, name='lambdac14', size=4, unit='(ratio)', description='Bank 1 - Sensor 4/Bank 2 - Sensor 2 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.LAMBDAC21, name='lambdac21', size=4, unit='(ratio)', description='Bank 2 - Sensor 1/Bank 3 - Sensor 1 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.LAMBDAC22, name='lambdac22', size=4, unit='(ratio)', description='Bank 2 - Sensor 2/Bank 3 - Sensor 2 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.LAMBDAC23, name='lambdac23', size=4, unit='(ratio)', description='Bank 2 - Sensor 3/Bank 4 - Sensor 1 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.LAMBDAC24, name='lambdac24', size=4, unit='(ratio)', description='Bank 2 - Sensor 4/Bank 4 - Sensor 2 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.CATEMP11, name='catemp11', size=2, unit='Celsius', description='Catalyst Temperature Bank 1 /  Sensor 1'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.CATEMP21, name='catemp21', size=2, unit='Celsius', description='Catalyst Temperature Bank 2 /  Sensor 1'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.CATEMP12, name='catemp12', size=2, unit='Celsius', description='Catalyst Temperature Bank 1 /  Sensor 2'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.CATEMP22, name='catemp22', size=2, unit='Celsius', description='Catalyst Temperature Bank 2 /  Sensor 2'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.PIDDSUPP4, name='piddsupp4', size=4, unit='Bit Encoded', description='PIDs supported 41-60'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.MONITORSTAT, name='monitorstat', size=4, unit='Bit Encoded', description='Monitor status this driving cycle'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.VPWR, name='vpwr', size=2, unit='V', description='Control module voltage'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.LOAD_ABS, name='load_abs', size=2, unit='%', description='Absolute Load Value'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.LAMBDA, name='lambda', size=2, unit='(ratio)', description='Fuel/air Commanded Equivalence Ratio'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.TP_R, name='tp_r', size=1, unit='%', description='Relative Throttle Position'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.AAT, name='aat', size=1, unit='Celsius', description='Ambient air temperature'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.TP_B, name='tp_b', size=1, unit='%', description='Absolute Throttle Position B'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.TP_C, name='tp_c', size=1, unit='%', description='Absolute Throttle Position C'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.APP_D, name='app_d', size=1, unit='%', description='Accelerator Pedal Position D'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.APP_E, name='app_e', size=1, unit='%', description='Accelerator Pedal Position E'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.APP_F, name='app_f', size=1, unit='%', description='Accelerator Pedal Position F'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.TAC_PCT, name='tac_pct', size=1, unit='%', description='Commanded Throttle Actuator Control'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.MIL_TIME, name='mil_time', size=2, unit='minutes', description='Time run by the engine while MIL activated'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.CLR_TIME, name='clr_time', size=2, unit='minutes', description='Time since diagnostic trouble codes cleared'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.EXTTEST1, name='exttest1', size=4, unit='Bit Encoded', description='External Test Equipment Configuration #1'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.EXTTEST2, name='exttest2', size=4, unit='Bit Encoded', description='External Test Equipment Configuration #2'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.FUEL_TYPE, name='fuel_type', size=1, unit='Bit Encoded', description='Fuel Type'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.ALCH_PCT, name='alch_pct', size=1, unit='%', description='Ethanol fuel %'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.ABS_VP, name='abs_vp', size=2, unit='kPa', description='Absolute Evap system Vapor Pressure'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.SYSTEM_VP, name='system_vp', size=2, unit='Pa', description='Evap system vapor pressure'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.S02B13, name='s02b13', size=2, unit='%', description='Short term secondary oxygen sensor trim bank 1 and bank 3'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.L02B13, name='l02b13', size=2, unit='%', description='Long term secondary oxygen sensor trim bank 1 and bank 3'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.S02B24, name='s02b24', size=2, unit='%', description='Short term secondary oxygen sensor trim bank 2 and bank 4'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.L02B24, name='l02b24', size=2, unit='%', description='Long term secondary oxygen sensor trim bank 2 and bank 4'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.FRP_ABS, name='frp_abs', size=2, unit='kPa', description='Fuel rail pressure (absolute)'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.PEDALPOS, name='pedalpos', size=1, unit='%', description='Relative accelerator pedal position'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.HYBRIDLIFE, name='hybridlife', size=1, unit='%', description='Hybrid battery pack remaining life'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.ENGINEOILT, name='engineoilt', size=1, unit='°C', description='Engine oil temperature'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.FINJTIMING, name='finjtiming', size=2, unit='°', description='Fuel injection timing'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.ENGINEFRATE, name='enginefrate', size=2, unit='L/h', description='Engine fuel rate'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.EMMISSIONREQ, name='emmissionreq', size=1, unit='Bit Encoded', description='Emission requirements to which vehicle is designed'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.AET, name='aet', size=1, unit='%', description='Actual engine - percent torque'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.ECT, name='ect', size=3, unit='Celsius', description='Engine coolant temperature'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.EGRT, name='egrt', size=5, unit='Celsius', description='Exhaust gas recirculation temperature'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.FPC, name='fpc', size=6, unit='Celsius', description='Fuel pressure control system'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.IPCT, name='ipct', size=5, unit='Celsius', description='Injection pressure control system'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.EP, name='ep', size=5, unit='Celsius', description='Exhaust pressure'),
    Obd2Msg(mode=Obd2Mode.REAL_TIME, pid=Obd2PidCode.EGT, name='egt', size=9, unit='Celsius', description='Exhaust Gas temperature Bank 1'),

    Obd2Msg(mode=Obd2Mode.VEHICLE_INFO, pid=Obd2PidCode.VINSUPP0, name='vinsupp0', size=4, unit='Bit Encoded', description='Service 0x09 - Request Vehicle Information - Supported PIDs'),
    Obd2Msg(mode=Obd2Mode.VEHICLE_INFO, pid=Obd2PidCode.VIN_MSCOUT, name='vin_mscout', size=4, unit='Bit Encoded', description='VIN message count'),
    Obd2Msg(mode=Obd2Mode.VEHICLE_INFO, pid=Obd2PidCode.VIN, name='vin', size=4, unit='Bit Encoded', description='Vehicle Identification Number'),
]
