/** @typedef {Record<string, number>[]} DataPointType */

/**
 * @typedef {Object} InjectedParam
 * @property {string} param_name
 * @property {string | number} param_val
 */

// main code
/**
 * @param {DataPointType[]} data_points
 * @param {InjectedParam[]} injected_params
 */
function _test_chx_script(data_points, injected_params) {
    const weight_reading_type = 2;
    const pressure_reading_type = 4;
    let sum_weight = 0;
    let sum_pressure = 0;
    data_points.forEach(_data_point => {
        sum_weight += _data_point[weight_reading_type];
        sum_pressure += _data_point[pressure_reading_type];
    });
    injected_params.push({
        param_name: 'lt_ch000_test_control_value',
        param_val: sum_weight - sum_pressure,
    });
}