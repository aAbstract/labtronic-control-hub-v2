// if (!selected_target_var.value || selected_target_var.value === -1)
//     return data_filtered;

// apply msg_type filter
// data_filtered = data_filtered.filter(x => x.msg_type === selected_target_var.value);

// apply datetime range filter
// if (!datetime_from.value || !datetime_to.value)
//     return data_filtered;
// else
//     return data_filtered.filter(x => new Date(x.datetime) >= datetime_from.value && new Date(x.datetime) <= datetime_to.value);

// const labels: number[] = [data_filtered[0].sn];
// const values: number[] = [];
// for (let i = 0; i < data_filtered.length; i++) {
//     const { sn, msg_type, msg_value } = data_filtered[i];
//     const last_sn = labels[labels.length - 1];
//     if (sn !== last_sn)
//         labels.push(sn);
//     if (!(msg_type in values_series_map))
//         values_series_map[msg_type] = props.device_ui_config.get_chart_params(msg_type);
//     values_series_map[msg_type]?.data.push(msg_value);
// }

// let datasets: ChartParams[] = [];
// if (selected_target_var.value && selected_target_var.value !== -1)
//     datasets.push(values_series_map[selected_target_var.value] as ChartParams);
// else
//     Object.values(values_series_map).forEach(x => { if (x) datasets.push(x) });
// const { msg_type } = data_filtered[0];
// const chart_params = props.device_ui_config.get_chart_params(msg_type);
// if (!chart_params) {
//     add_log({ level: 'ERROR', msg: `Invalid Data Point, msg_type=${msg_type}` });
//     return;
// }

// const new_chart_data: ChartData = {
//     labels: data_filtered.map(x => x.sn),
//     datasets: chart_params_list,
// };