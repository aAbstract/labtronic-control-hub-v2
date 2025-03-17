import { Result } from '../common/models';
import { get_version_info } from "./system_settings";

function __chx_dist_url(device_model: string) {
    return `https://lab-tronic.com/database/api/collections/chx_dist_channels/records?filter=(channel_name='${device_model}')`;
}

function version_compare(v1_str: string, v2_str: string): boolean {
    const v1_parts = v1_str.split('.');
    const v2_parts = v2_str.split('.');

    const m1_v = Number(v1_parts[0]);
    const m2_v = Number(v2_parts[0]);
    if (m1_v > m2_v)
        return true;

    const f1_v = Number(v1_parts[1]);
    const f2_v = Number(v2_parts[1]);
    if (f1_v > f2_v)
        return true;

    const b1_v = Number(v1_parts[2]);
    const b2_v = Number(v2_parts[2]);
    if (b1_v > b2_v)
        return true;

    return false;
}

export async function check_for_update(): Promise<Result<string>> {
    const version_info = get_version_info();
    const __url = __chx_dist_url(version_info.device_model);
    try {
        const http_res = await fetch(__url);
        const json_res = await http_res.json();
        if (http_res.status !== 200)
            return { err: json_res };

        if (json_res.items.length !== 1)
            return { err: 'Invalid CHX Dist Channel Response' };

        const chx_dist_channel_info = json_res.items[0];

        if (chx_dist_channel_info.channel_name !== version_info.device_model)
            return { err: 'CHX Dist Channel Name Mismatch' };

        if (version_compare(chx_dist_channel_info.chx_core_version, version_info.chx_core_version))
            return { ok: `CHX Core Update: ${version_info.chx_core_version} -> ${chx_dist_channel_info.chx_core_version}\n${chx_dist_channel_info.link}` };

        if (version_compare(chx_dist_channel_info.chx_module_version, version_info.chx_module_version))
            return { ok: `CHX Module Update: ${version_info.chx_module_version} -> ${chx_dist_channel_info.chx_module_version}\n${chx_dist_channel_info.link}` };
        else
            return { ok: 'Up to Date' };
    } catch (e: any) { return { err: e.message } }
}