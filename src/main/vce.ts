import * as nvm from 'node:vm';
import { DeviceMsg, Result, VceParamConfig, VceParamType, CHXComputedParam, MsgTypeConfig, DataType } from '../common/models';

export class VirtualComputeEngine {
    private device_model: string;
    private vce_instance_id: number;
    private ipc_handler: (channel: string, data: any) => void;

    private vce_context: Record<number, number> = {};
    private vce_param_config_map: Record<number, VceParamConfig> = {};
    private vce_var_msg_types: Set<number> = new Set();
    private _vce_var_msg_types: number[] = [];

    private cps_config_map: Record<string, MsgTypeConfig> = {};
    private cps_script = '';

    private current_msg_patch: DeviceMsg[] = [];

    constructor(
        vce_prams_config: VceParamConfig[],
        cps_config: CHXComputedParam[],
        _ipc_handler: (channel: string, data: any) => void,
        _device_model: string,
        _vce_instance_id: number = 0,
    ) {
        this.ipc_handler = _ipc_handler;
        this.device_model = _device_model;
        this.vce_instance_id = _vce_instance_id;

        vce_prams_config.forEach(p => {
            const msg_type = p.msg_type_config.msg_type;
            this.vce_context[msg_type] === 0;
            this.vce_param_config_map[msg_type] = p;
            if (p.param_type === VceParamType.VCE_VAR)
                this.vce_var_msg_types.add(msg_type);
            this._vce_var_msg_types = [...this.vce_var_msg_types];
        });

        this.cps_script = cps_config.map(_config => `${_config.param_name} = ${_config.expr}`).join(';');
        cps_config.forEach((_config, index) => this.cps_config_map[_config.param_name] = {
            msg_type: 15 + this.vce_instance_id * 10 + index, // create out of hardware addressing bounds
            msg_name: 'READ_' + _config.param_name,
            data_type: DataType.FLOAT,
            size_bytes: 4,
        });
    }

    private load_msg_into_context(device_msg: DeviceMsg) {
        const { param_symbol } = this.vce_param_config_map[device_msg.config.msg_type];
        this.vce_context[param_symbol] = device_msg.msg_value;
    }

    private vce_compute(patch_seq_number: number): Record<string, number> {
        // create proper scope
        const cycle_context = { ...this.vce_context };
        nvm.createContext(cycle_context);

        // compute values
        nvm.runInContext(this.cps_script, cycle_context);

        // inject compute device msgs
        Object.keys(cycle_context).forEach(_var => {
            if (_var.startsWith('$'))
                return;
            if (!(_var in this.cps_config_map))
                return;
            const device_msg: DeviceMsg = {
                seq_number: patch_seq_number,
                msg_value: cycle_context[_var],
                b64_msg_value: '',
                config: this.cps_config_map[_var],
            };
            this.ipc_handler(`${this.device_model}_device_msg`, { device_msg });
        });

        return cycle_context;
    }

    load_device_msg(device_msg: DeviceMsg): Result<Record<string, number>> {
        const { msg_type } = device_msg.config;
        if (!this.vce_var_msg_types.has(msg_type)) {
            this.load_msg_into_context(device_msg);
            return { err: 'Loaded Const into VM Context' };
        }

        this.current_msg_patch.push(device_msg);
        // reached full patch
        if (this.vce_var_msg_types.size === this.current_msg_patch.length) {
            // validate same msg sequence number
            const sn_set = new Set(this.current_msg_patch.map(x => x.seq_number));
            if (sn_set.size !== 1)
                return { err: 'Patch Sequence Number Mismatch' };
            const [valid_sn] = sn_set.values();
            if (this.current_msg_patch[0].seq_number !== valid_sn)
                return { err: 'Patch Sequence Number Mismatch' };

            // validate msg types
            const msg_types_set = new Set(this.current_msg_patch.map(x => x.config.msg_type));
            if (this.vce_var_msg_types.size !== msg_types_set.size)
                return { err: 'Invalid MsgType Sequence' };
            if (!this._vce_var_msg_types.every(x => msg_types_set.has(x)))
                return { err: 'Invalid MsgType Sequence' };

            // exec vce cycle
            this.current_msg_patch.forEach(msg => this.load_msg_into_context(msg));
            this.current_msg_patch = [];
            return { ok: this.vce_compute(valid_sn) };
        }

        return { err: 'Loaded Var into VM Context' };
    }
}