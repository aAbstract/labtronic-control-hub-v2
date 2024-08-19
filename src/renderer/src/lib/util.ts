import { LogMsg } from "@common/models";
import { post_event } from "@common/mediator";

export function electron_renderer_send(channel: string, data: any) {
    if (!window.electron) {
        add_log({ level: 'ERROR', msg: 'Operation Denied Browser Sandbox' });
        return;
    }
    window.electron.ipcRenderer.send(channel, data);
}

export function add_log(log_msg: LogMsg) {
    post_event('add_sys_log', log_msg);
}

export async function electron_renderer_invoke<T>(channel: string, args: Object | null = null): Promise<T | null> {
    if (!window.electron) {
        add_log({ level: 'ERROR', msg: 'Operation Denied Browser Sandbox' });
        return null;
    }

    let result: T;
    if (args)
        result = await window.electron.ipcRenderer.invoke(channel, args);
    else
        result = await window.electron.ipcRenderer.invoke(channel);
    return result;
}

type ToolTipDir = 'top' | 'bottom' | 'left' | 'right';

export function compute_tooltip_pt(dir: ToolTipDir) {
    return {
        text: {
            style: `color: var(--accent-color);
            padding: 8px;
            font-size: 14px;
            font-weight: bold;
            background-color: var(--light-bg-shadow-color);`
        },
        arrow: { style: `border-${dir}-color: var(--light-bg-shadow-color);` },
    };
}

export function clone_object(object: any): any {
    return JSON.parse(JSON.stringify(object));
}

export function transform_keys(_objects: Record<string, string | number>[], _transform_map: Record<string, string>): Record<string, string | number>[] {
    const out_objs = clone_object(_objects) as Record<string, any>[];
    out_objs.forEach(obj => {
        Object.keys(obj).forEach(_key => {
            const msg_value = obj[_key];
            delete obj[_key];
            const new_key = _transform_map[_key];
            obj[new_key] = msg_value;
        });
    });
    return out_objs;
}