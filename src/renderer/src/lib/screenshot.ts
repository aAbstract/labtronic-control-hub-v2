import { electron_renderer_send } from "@renderer/lib/util";

let _screenshot_mode: boolean = false;
export function toggle_screenshot_mode() { _screenshot_mode = !_screenshot_mode; }
export function screenshot_mode() { return _screenshot_mode; }

export const screenshot_handlers = {
    mouseenter(event: MouseEvent) {
        if (!_screenshot_mode)
            return;

        const target_component = event.target as HTMLElement;
        target_component.style.border = '1px solid var(--accent-color)';
        target_component.style.cursor = 'pointer';
    },
    mouseleave(event: MouseEvent) {
        if (!_screenshot_mode)
            return;

        const target_component = event.target as HTMLElement;
        target_component.style.border = 'none';
        target_component.style.cursor = 'default';
    },
    click(event: MouseEvent) {
        if (!_screenshot_mode)
            return;

        const target_component = event.currentTarget as HTMLCanvasElement;
        let { x, y, width, height } = target_component.getBoundingClientRect();
        x = Math.round(x);
        y = Math.round(y);
        width = Math.round(width);
        height = Math.round(height);
        electron_renderer_send('save_screenshot', { comp_rect: { x, y, width, height } });
    }
};