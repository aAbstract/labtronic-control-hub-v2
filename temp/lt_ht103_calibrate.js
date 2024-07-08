/**
 * @param {number} number
 * @param {number} precision
 */
function round(number, precision) {
    const factor = 10 ** precision;
    return Math.round(number * factor) / factor;
}

/**
 * @param {[number, number][]} data [x, y][]
 */
function fit_linear_model(data) {
    const precision = 2;
    const sum = [0, 0, 0, 0, 0];
    let len = 0;

    for (let n = 0; n < data.length; n++) {
        if (data[n][1] !== null) {
            len++;
            sum[0] += data[n][0];
            sum[1] += data[n][1];
            sum[2] += data[n][0] * data[n][0];
            sum[3] += data[n][0] * data[n][1];
            sum[4] += data[n][1] * data[n][1];
        }
    }

    const run = ((len * sum[2]) - (sum[0] * sum[0]));
    const rise = ((len * sum[3]) - (sum[0] * sum[1]));
    const gradient = run === 0 ? 0 : round(rise / run, precision);
    const intercept = round((sum[1] / len) - ((gradient * sum[0]) / len), precision);

    return { gradient, intercept };
}

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
function lt_ht103_calibrate(data_points, injected_params) {
    const th_msg_type = 4;
    const ql_msg_type = 17;
    const th_ql_data_points = new Array(data_points.length).fill([0, 0]);
    data_points.forEach((p, idx) => th_ql_data_points[idx] = [p[th_msg_type], p[ql_msg_type]]);
    const { gradient, intercept } = fit_linear_model(th_ql_data_points);
    injected_params.push({
        param_name: 'lt_ht103_Q_L_F1',
        param_val: intercept,
    });
    injected_params.push({
        param_name: 'lt_ht103_Q_L_F2',
        param_val: gradient,
    });
}