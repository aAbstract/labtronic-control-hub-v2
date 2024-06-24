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

// session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
//   callback({
//     responseHeaders: Object.assign({
//       'Content-Security-Policy': [
//         "default-src 'self' 'unsafe-inline' http://127.0.0.1:8090",
//         "script-src 'self'",
//         "style-src 'self' 'unsafe-inline'",
//         "connect-src 'self' http://127.0.0.1:8090",
//         "img-src 'self' http://127.0.0.1:8090",
//       ]
//     }, details.responseHeaders)
//   });
// });

// <!-- content="default-src 'self'; connect-src 'self' http://127.0.0.1:8090" -->
// <!-- <meta http-equiv="Content-Security-Policy" content="
//   default-src 'self';
//   script-src 'self';
//   style-src 'self' 'unsafe-inline';
//   connect-src 'self' http://127.0.0.1:8090;
//   img-src 'self' http://127.0.0.1:8090;
// " /> -->
// <!-- <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'" /> -->
// <!-- <meta http-equiv="Content-Security-Policy" content="default-src 'self';script-src 'self';style-src 'self' 'unsafe-inline';connect-src 'self' http://127.0.0.1:8090;img-src 'self' http://127.0.0.1:8090"> -->

// type DeviceReadingDataType = 'u8' | 'u16' | 'u32' | 'u64' | 'i8' | 'i16' | 'i32' | 'i64' | 'f32' | 'f64';
// export interface DeviceReadingHelp {
//     reading_name: string;
//     reading_var: string;
//     data_type: DeviceReadingDataType;
//     desc: string;
// };

// // validate same msg sequence number
// const sn_set = new Set(this.current_msg_patch.map(x => x.seq_number));
// if (sn_set.size !== 1)
//     return { err: 'Patch Sequence Number Mismatch' };
// const [valid_sn] = sn_set.values();
// if (this.current_msg_patch[0].seq_number !== valid_sn)
//     return { err: 'Patch Sequence Number Mismatch' };

// window.electron?.ipcRenderer.on(`${device_model}_device_msg`, (_, data) => {
//     const device_msg: DeviceMsg = data.device_msg;
//     const msg_type = device_msg.config.msg_type;
//     const msg_value = device_msg.msg_value;
//     const card_pos_info = props.device_ui_config.get_info_card_pos(msg_type);
//     if (!card_pos_info) {
//         add_log({ level: 'ERROR', msg: `Unknown Msg Type: ${msg_type}` });
//         return;
//     }
//     const { pos, cell_count } = card_pos_info;
//     GfxApi.clear_digit_cells(pos, cell_count);
//     GfxApi.write_digit_cells(pos, String(msg_value).padStart(cell_count, ' ').slice(0, cell_count));
// });


// // avoid creating same SerialAdapter object
// if (serial_adapter && port_name === serial_adapter.get_port_name()) {
//     serial_adapter.on_serial_port_open();
//     return;
// }