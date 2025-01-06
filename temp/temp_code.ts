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

// window.electron.ipcRenderer.on('device_error', () => GfxApi.start_error_animation(device_parts_pos_map['TANK']));
// window.electron.ipcRenderer.on('device_disconnected', () => GfxApi.stop_animation(device_parts_pos_map['TANK']));

// {
//     3: { // READ_TEMPERATURE
//         pos: { x: 63.30, y: 11.70 },
//         cell_count: 2,
//     },
//     2: { // READ_WEIGHT
//         pos: { x: 16.75, y: 78.75 },
//         cell_count: 3,
//     },
//     4: { // READ_PRESSURE
//         pos: { x: 16.75, y: 28.25 },
//         cell_count: 2,
//     },
//     0: { // PISTON_PUMP
//         pos: { x: 74.40, y: 86.75 },
//         cell_count: 3,
//     },
//     1: { // PERISTALTIC_PUMP
//         pos: { x: 90.75, y: 57.60 },
//         cell_count: 1,
//     },
// },
// {
//     'TANK': {
//         pos: { x: 44.70, y: 16.00 },
//         shape: 'rect',
//         shape_params: { w: 60, h: 100 },
//         color: 'red',
//     },
// },

// load VCE module with auto HMR
// lt_ch000_vce0 = new VirtualComputeEngine(LT_CH000_VCE_CONFIG, [], mw_ipc_handler, DEVICE_MODEL);
// subscribe('chx_cps_change', `${DEVICE_MODEL}_chx_cps_change`, args => {
//     const _chx_cps: CHXComputedParam[] = args._chx_cps;
//     lt_ch000_vce0 = new VirtualComputeEngine(LT_CH000_VCE_CONFIG, _chx_cps, mw_ipc_handler, DEVICE_MODEL);
//     main_window?.webContents.send(`${DEVICE_MODEL}_device_config_ready`);
// });

// new NavMenuItem('Screenshot', PhotoCapture, function (this: NavMenuItem, _event: MouseEvent) {
//     toggle_screenshot_mode();
//     const mode_str_repr = screenshot_mode() ? 'ON' : 'OFF';
//     const mode_msg = screenshot_mode() ? 'Click on a UI Component to Capture Screenshot' : 'Screenshot Mode is Disabled';
//     toast_service.add({ severity: 'info', summary: `Screenshot ${mode_str_repr}`, detail: mode_msg, life: 3000 });
//     this.is_active.value = screenshot_mode();
// }),
// new NavMenuItem('Settings', SettingsIcon, function (this: NavMenuItem) { toggle_panel(this.panel_name, this.panel_pos) }, 'settings_panel', 'LEFT'),
