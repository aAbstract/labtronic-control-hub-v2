import { Vec2D, DevicePartGfxData } from "@common/models";

const DIGIT_CELL_DX = 2.20;
const DIGIT_CELL_DY = 4.80;
const FONT_SIZE = Math.round(1 / 80 * window.innerWidth);
const FONT = `bold ${FONT_SIZE}px Arial`;

const ANIMATION_PERIOD = 100;
const CLEAR_DELAY = ANIMATION_PERIOD * 10;
const MOUSE_DEBUG = true;

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let canvas_width: number;
let canvas_height: number;
let font_color: string;
let light_bg_color: string;
let start_animation = false;

// input api
export function get_mouse_ratio_pos(abs_pos: Vec2D): Vec2D {
    const bound_rect = canvas.getBoundingClientRect();
    const x = (abs_pos.x - bound_rect.left) / canvas_width;
    const y = (abs_pos.y - bound_rect.top) / canvas_height;
    return {
        x: dec2_round(x),
        y: dec2_round(y),
    };
}

export function get_mouse_relative_pos(abs_pos: Vec2D): Vec2D {
    const bound_rect = canvas.getBoundingClientRect();
    const x = abs_pos.x - bound_rect.left;
    const y = abs_pos.y - bound_rect.top;
    return { x, y };
}

export function debug_canvas_click(mouse_event: MouseEvent) {
    if (!MOUSE_DEBUG)
        return;

    const ratio_pos = get_mouse_ratio_pos({ x: mouse_event.clientX, y: mouse_event.clientY },);
    const relative_pos = ratio_pos_to_relative_pos(ratio_pos);
    console.log(`ratio_pos: ${JSON.stringify(ratio_pos)}`);
    console.log(`relative_pos: ${JSON.stringify(relative_pos)}`);
}

// compute api
export function dec2_round(x: number): number { return Math.round(x * 1e4) / 1e2; }

export function ratio_pos_to_relative_pos(ratio_pos: Vec2D): Vec2D {
    return {
        x: ratio_pos.x * canvas_width / 100,
        y: ratio_pos.y * canvas_height / 100,
    };
}

export function compute_color_opacity(color: string, opacity: number): string {
    const color_map = {
        'red': `rgb(255, 0, 0, ${opacity})`,
    };
    return color_map[color];
}

// gfx api
export function stroke_line(start: Vec2D, end: Vec2D, hex_color: string) {
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = hex_color;
    ctx.lineWidth = 4;
    ctx.stroke();
}

export function fill_circle(center: Vec2D, rad: number, color: string) {
    ctx.beginPath();
    ctx.arc(center.x, center.y, rad, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}

export function fill_text(pos: Vec2D, text: string) {
    ctx.fillStyle = font_color;
    ctx.font = FONT;
    ctx.fillText(text, pos.x, pos.y);
}

export function clear_digit_cells(ratio_pos: Vec2D, cell_count: number) {
    const rect_start_point_ratio_pos: Vec2D = {
        x: ratio_pos.x - DIGIT_CELL_DX * cell_count / 2,
        y: ratio_pos.y - DIGIT_CELL_DY * 0.5,
    };
    const relative_pos = ratio_pos_to_relative_pos(rect_start_point_ratio_pos);
    const rect_width = DIGIT_CELL_DX * cell_count * canvas_width / 1e2;
    const rect_height = DIGIT_CELL_DY * canvas_height / 1e2;
    ctx.beginPath();
    ctx.rect(relative_pos.x, relative_pos.y, rect_width, rect_height);
    ctx.fillStyle = light_bg_color;
    ctx.fill();
}

export function write_digit_cells(ratio_pos: Vec2D, value: string) {
    const cell_count = value.length;
    const ycoord = ratio_pos.y + DIGIT_CELL_DY * 0.40;
    const cell_count_xcoord_map = [
        [ratio_pos.x - 0.5 * DIGIT_CELL_DX],
        [ratio_pos.x - DIGIT_CELL_DX, ratio_pos.x],
        [
            ratio_pos.x - 1.5 * DIGIT_CELL_DX,
            ratio_pos.x - 0.5 * DIGIT_CELL_DX,
            ratio_pos.x + 0.5 * DIGIT_CELL_DX,
        ],
    ];
    const xcoords_list = cell_count_xcoord_map[cell_count - 1];
    xcoords_list.forEach((x, idx) => {
        const start_point: Vec2D = { x, y: ycoord };
        const relative_pos = ratio_pos_to_relative_pos(start_point);
        fill_text(relative_pos, value[idx]);
    });
}

export function start_error_animation(part_gfx_data: DevicePartGfxData) {
    const relative_pos = ratio_pos_to_relative_pos(part_gfx_data.pos);
    const { w, h } = part_gfx_data.shape_params;
    let alpha = 0.5;

    function animation_loop() {
        const delta = 0.1;
        if (alpha > 0)
            alpha -= delta;
        else
            alpha = 0.5;
        const color = compute_color_opacity(part_gfx_data.color, alpha);

        if (part_gfx_data.shape === 'rect') {
            ctx.clearRect(relative_pos.x - 1, relative_pos.y - 1, w + 2, h + 2);
            ctx.beginPath();
            ctx.rect(relative_pos.x, relative_pos.y, w, h);
            ctx.fillStyle = color;
            ctx.fill();
        }
        if (start_animation)
            setTimeout(animation_loop, ANIMATION_PERIOD);
    }
    start_animation = true;
    animation_loop();
}

export function stop_animation(part_gfx_data: DevicePartGfxData) {
    const relative_pos = ratio_pos_to_relative_pos(part_gfx_data.pos);
    const { w, h } = part_gfx_data.shape_params;
    start_animation = false;
    setTimeout(() => ctx.clearRect(relative_pos.x - 1, relative_pos.y - 1, w + 2, h + 2), CLEAR_DELAY);
}

export function init_gfx(_canvas: HTMLCanvasElement, _canvas_width: number, _canvas_height: number) {
    canvas = _canvas;
    ctx = _canvas.getContext('2d') as CanvasRenderingContext2D;
    canvas_width = _canvas_width;
    canvas_height = _canvas_height;
    canvas.width = _canvas_width;
    canvas.height = _canvas_height;
    font_color = document.documentElement.style.getPropertyValue('--font-color');
    light_bg_color = document.documentElement.style.getPropertyValue('--light-bg-color');
}