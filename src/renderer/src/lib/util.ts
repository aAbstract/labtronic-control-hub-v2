import { LogMsg } from "@common/models";
import { post_event } from "@common/mediator";

export function electron_renderer_send(channel: string, data: any) {
    if (!window.electron) {
        post_event('add_sys_log', {
            source: '',
            level: 'ERROR',
            msg: 'Operation Denied Browser Sandbox',
        } as LogMsg);
        return;
    }
    window.electron?.ipcRenderer.send(channel, data);
}