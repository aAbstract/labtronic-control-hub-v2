float compute_bat_soc(float bat_volt, int cells) {
  float _bat_volt = bat_volt / cells;
  if (_bat_volt < 3.6)
    return 0;
  else if (_bat_volt >= 3.6 && _bat_volt < 4.0)
    return 2 * (_bat_volt - 3.6);
  else if (_bat_volt >= 4.0 && _bat_volt <= 4.2)
    return _bat_volt - 3.2;
  else
    return 1;
}