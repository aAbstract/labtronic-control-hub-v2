import { Result } from '@common/models';

type _Result = Result<any>;

let labtronic_cdn_base_url = '';

export function get_base_url(): string {
    return labtronic_cdn_base_url;
}

export function set_base_url(new_url: string) {
    labtronic_cdn_base_url = new_url;
}

export function inject_source_csp(_url: string) {
    // allow renderer process to access LabTronic CDN network resources
    const cdn_meta_csp = document.createElement('meta');
    cdn_meta_csp.setAttribute('http-equiv', 'Content-Security-Policy');
    const csp_items = [
        `default-src 'self'`,
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        // `connect-src 'self' ${url}`,
        // `img-src 'self' ${url} data:`,
        "img-src 'self' data:",
        "frame-src 'self' data:",
    ];
    cdn_meta_csp.setAttribute('content', csp_items.join(';'));
    document.head.appendChild(cdn_meta_csp);
}

async function make_fetch_request(api_path: string, opts: RequestInit): Promise<_Result> {
    const api_url = `${get_base_url()}${api_path}`;
    opts.headers = {};
    opts.headers['Content-Type'] = 'application/json';
    const access_token = localStorage.getItem('access_token');
    if (access_token)
        opts.headers['Authorization'] = `Bearer ${access_token}`;

    try {
        const response = await fetch(api_url, opts);
        const json_res = await response.json();
        if (response.status === 200)
            return { ok: json_res };
        else
            return { err: json_res };
    } catch (e: any) { return { err: e.message } }
}

export async function get_asset_link(file_name: string): Promise<_Result> {
    return await make_fetch_request('/capi/manuals/get-asset-link', { method: 'POST', body: JSON.stringify({ file_name }) });
}

export async function get_fake_manual(_manual_id: string): Promise<_Result> {
    const response = await fetch('/example_manual.json');
    const json_res = await response.json();
    return { ok: json_res };
}

export async function get_manual(_device_model: string): Promise<_Result> {
    // TODO-LATER: optimize this function
    // const device_id_res = await make_fetch_request('/capi/manuals/get-device-id', { method: 'POST', body: JSON.stringify({ device_model }) });
    // if (device_id_res.err)
    //     return device_id_res;
    // const { device_id } = device_id_res.ok;
    // const manual_id_res = await make_fetch_request('/capi/manuals/get-latest-manual-id', { method: 'POST', body: JSON.stringify({ device_id }) });
    // if (manual_id_res.err)
    //     return manual_id_res;
    // const { manual_id } = manual_id_res.ok;
    // return await make_fetch_request(`/api/collections/manuals/records/${manual_id}`, { method: 'GET' });
    return await make_fetch_request(`/api/collections/manuals/records/k3ua55qubzwxc2k`, { method: 'GET' });
}