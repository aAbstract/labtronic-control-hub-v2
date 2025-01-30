import * as nvm from 'node:vm';
import { promises as fsp } from 'node:fs';
import { DeviceMsg, Result, VceParamConfig, VceParamType, CHXComputedParam, MsgTypeConfig, DataType, CHXEquation, CHXScript, CHXScriptInjectedParam } from '../common/models';

export class VirtualComputeEngine {
    private device_model: string;
    private vce_instance_id: number;
    private ipc_handler: (channel: string, data: any) => void;

    private vce_context: Record<string, number> = {};
    private vce_cycle_sn = 0;
    private vce_param_config_map: Record<number, VceParamConfig> = {};
    private vce_var_msg_types: Set<number> = new Set();
    private _vce_var_msg_types: number[] = [];

    private cps_config_map: Record<string, MsgTypeConfig> = {};
    private cps_script = '';
    private cps_config: CHXComputedParam[] = [];
    private cps_expr_map: Record<number, string> = {};

    private current_msg_patch: DeviceMsg[] = [];

    constructor(
        vce_prams_config: VceParamConfig[],
        _cps_config: CHXComputedParam[],
        _ipc_handler: (channel: string, data: any) => void,
        _device_model: string,
        _vce_instance_id: number = 0,
    ) {
        this.ipc_handler = _ipc_handler;
        this.device_model = _device_model;
        this.vce_instance_id = _vce_instance_id;

        vce_prams_config.forEach(p => {
            this.vce_context[p.param_symbol] = p.const_init_value ?? 0;

            // ignore non-echo const device msgs
            if (p.msg_type_config.msg_type === -1)
                return;

            const msg_type = p.msg_type_config.msg_type;
            this.vce_param_config_map[msg_type] = p;
            if (p.param_type === VceParamType.VCE_VAR)
                this.vce_var_msg_types.add(msg_type);
            this._vce_var_msg_types = [...this.vce_var_msg_types];
        });

        this.cps_config = _cps_config;
        this.cps_script = _cps_config.filter(_config => _config.expr !== null).map(_config => `${_config.param_name}=${_config.expr}`).join(';');
        _cps_config.forEach((_config, index) => {
            const msg_type = _config.msg_type ?? (16 + this.vce_instance_id * 10 + index); // create out of hardware addressing bounds
            this.cps_expr_map[msg_type] = _config.expr + (_config.unit ?? '');
            this.cps_config_map[_config.param_name] = {
                msg_type,
                msg_name: 'READ_' + _config.param_name,
                data_type: DataType.FLOAT,
                size_bytes: 4,
                cfg2: 0,
            }
        });
    }

    load_symbol(symbol: string, val: number) {
        this.vce_context[symbol] = val;
    }

    private load_msg_into_context(device_msg: DeviceMsg) {
        const { param_symbol } = this.vce_param_config_map[device_msg.config.msg_type];
        this.load_symbol(param_symbol, device_msg.msg_value);
    }

    // @ts-ignore
    private vce_safe_compute(): Record<string, number> {
        // create proper scope
        const cycle_context = { ...this.vce_context };
        nvm.createContext(cycle_context);

        // compute values
        nvm.runInContext(this.cps_script, cycle_context);

        // inject compute device msgs
        const out_record: Record<string, number> = {};
        Object.keys(cycle_context).forEach(_var => {
            if (_var.startsWith('$'))
                return;
            if (!(_var in this.cps_config_map))
                return;
            out_record[_var] = cycle_context[_var];
            const device_msg: DeviceMsg = {
                config: this.cps_config_map[_var],
                seq_number: this.vce_cycle_sn,
                msg_value: cycle_context[_var],
                b64_msg_value: '',
            };
            this.ipc_handler(`${this.device_model}_device_msg`, { device_msg });
        });

        return out_record;
    }

    private create_eval_script(cp_config: CHXComputedParam): string {
        let expr = cp_config.expr ?? '';
        Object.entries(this.vce_context).forEach(([param_symbol, param_value]) => expr = expr.replace(new RegExp(`\\${param_symbol}`, 'g'), String(param_value)));
        return expr;
    }

    // @ts-ignore
    private vce_unsafe_compute(): Record<string, number> {
        // compute values and inject compute device msgs
        const out_record: Record<string, number> = {};
        this.cps_config.forEach(_config => {
            const cp_result = eval(this.create_eval_script(_config));
            out_record[_config.param_name] = cp_result;
            const device_msg: DeviceMsg = {
                seq_number: this.vce_cycle_sn,
                msg_value: cp_result,
                b64_msg_value: '',
                config: this.cps_config_map[_config.param_name],
            };
            this.ipc_handler(`${this.device_model}_device_msg`, { device_msg });
        });

        return out_record;
    }

    static compute_chx_equation(chx_equation: CHXEquation, args_vals: number[]): Result<number> {
        if (args_vals.length !== chx_equation.args_list.length)
            return { err: 'Insufficient Arguments' };

        const vm_context: Record<string, number> = {};
        chx_equation.args_list.forEach((_arg, idx) => vm_context[_arg] = args_vals[idx]);
        nvm.createContext(vm_context);

        nvm.runInContext(`result=${chx_equation.expr};`, vm_context);
        const result: number | null = vm_context.result ?? null;
        if (!result)
            return { err: 'Error Computing CHX Equation' };
        else
            return { ok: result };
    }

    static async exec_chx_script(data_points: Record<string, number>[], _script: CHXScript): Promise<Result<CHXScriptInjectedParam[]>> {
        try {
            // load script
            let _script_content = await fsp.readFile(_script.script_path, { encoding: 'utf-8' });
            _script_content += `\n\n${_script.script_name}(data_points, injected_params);`

            // create script context
            const vm_context = { data_points, injected_params: [] };
            nvm.createContext(vm_context);

            // run script
            nvm.runInContext(_script_content, vm_context);

            return { ok: vm_context.injected_params };
        } catch (err) { return { err } }
    }

    load_device_msg(device_msg: DeviceMsg): Result<Record<string, number>> {
        if (isNaN(device_msg.msg_value))
            return { err: 'VCE: Attempt to Inject NaN Value' };

        const { msg_type } = device_msg.config;
        if (!this.vce_var_msg_types.has(msg_type)) {
            this.load_msg_into_context(device_msg);
            return { err: 'Loaded Const into VM Context' };
        }

        if (device_msg.seq_number !== this.vce_cycle_sn) {
            this.vce_cycle_sn = device_msg.seq_number;
            this.current_msg_patch = [device_msg];
            return { err: 'Started New VCE Cycle' };
        }
        this.current_msg_patch.push(device_msg);

        // reached full patch
        if (this.vce_var_msg_types.size === this.current_msg_patch.length) {
            // validate msg types
            const msg_types_set = new Set(this.current_msg_patch.map(x => x.config.msg_type));
            if (this.vce_var_msg_types.size !== msg_types_set.size)
                return { err: 'Invalid MsgType Sequence' };
            if (!this._vce_var_msg_types.every(x => msg_types_set.has(x)))
                return { err: 'Invalid MsgType Sequence' };

            // exec vce cycle
            this.current_msg_patch.forEach(msg => this.load_msg_into_context(msg));
            this.current_msg_patch = [];
            return { ok: this.vce_safe_compute() };
        }

        return { err: 'Loaded Var into VM Context' };
    }

    get_cps_config(): MsgTypeConfig[] {
        return Object.values(this.cps_config_map).map(x => { return { ...x, cp_expr: this.cps_expr_map[x.msg_type] } });
    }

    static map_driver_config_to_vce_param_config(
        driver_config: MsgTypeConfig[],
        vce_var_msg_types: number[],
        vce_const_msg_types: number[],
    ) {
        const _vce_var_msg_types = new Set(vce_var_msg_types);
        const _vce_const_msg_types = new Set(vce_const_msg_types);
        return driver_config.map(_config => {
            const param_name = _config.msg_name.replace('READ_', '');
            const _vce_param_config: VceParamConfig = {
                msg_type_config: { ..._config },
                param_type: VceParamType.VCE_VAR,
                param_symbol: '$' + param_name,
                desc: 'NONE',
            };
            if (_vce_var_msg_types.has(_config.msg_type)) { _vce_param_config.param_type = VceParamType.VCE_VAR }
            else if (_vce_const_msg_types.has(_config.msg_type)) { _vce_param_config.param_type = VceParamType.VCE_CONST }
            else {
                _vce_param_config.param_type = VceParamType.VCE_CONST;
                _vce_param_config.msg_type_config.msg_type = -1;
            }
            return _vce_param_config;
        });
    }
}