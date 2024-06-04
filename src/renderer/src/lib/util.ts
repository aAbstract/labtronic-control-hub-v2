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

export async function electron_renderer_invoke<T>(channel: string): Promise<T | null> {
    if (!window.electron) {
        add_log({ level: 'ERROR', msg: 'Operation Denied Browser Sandbox' });
        return null;
    }
    const result: T = await window.electron.ipcRenderer.invoke(channel);
    return result;
}