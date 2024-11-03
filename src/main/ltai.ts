import fs from 'node:fs';
import path from 'node:path';
import { ipcMain, BrowserWindow } from "electron";
import { spawn, ChildProcess } from "node:child_process";

import { LogMsg, _ToastMessageOptions } from '../common/models';

const LTAI_DEBUG = true;
let lt_ai_process: ChildProcess | null = null;
let main_window: BrowserWindow | null;
const __pyint_map: Record<string, string> = {
    'linux': path.join(process.cwd(), 'labtronic_ai', 'venv', 'bin', 'python'),
    'win32': path.join(process.cwd(), 'labtronic_ai', 'venv', 'Scripts', 'python'),
};

function show_ai_agent_error_notif() {
    const notif: _ToastMessageOptions = {
        severity: 'error',
        summary: 'LTAI Agent',
        detail: 'LTAI Agent Error, Check System Logs',
        life: 3000,
    };
    main_window?.webContents.send('show_system_notif', { notif });
}

function handle_ltai_logs(_logs: string) {
    _logs.split('\n').forEach(_log => {
        if (_log.length === 0)
            return;

        const log_msg: LogMsg = { source: 'LTAI', level: 'DEBUG', msg: _log };
        main_window?.webContents.send('add_sys_log', log_msg);
        if (LTAI_DEBUG)
            console.log(_log);

        if (_log.includes('Uvicorn running on http://127.0.0.1:8091')) {
            const notif: _ToastMessageOptions = {
                severity: 'success',
                summary: 'LTAI Agent',
                detail: 'LTAI Agent Started Successfully',
                life: 3000,
            };
            main_window?.webContents.send('show_system_notif', { notif });
            main_window?.webContents.send('ltai_agent_started', {});
        }

        if (_log.includes('ERROR:'))
            show_ai_agent_error_notif();
    });
}

function start_ltai_service() {
    if (lt_ai_process)
        return;

    if (LTAI_DEBUG)
        console.log('Starting LTAI Service...');
    // check python environment
    const python_env = path.join(process.cwd(), 'labtronic_ai', 'venv');
    if (!fs.existsSync(python_env)) {
        const log_msg: LogMsg = { source: 'LTAI', level: 'ERROR', msg: 'Target Python Environment not Found' };
        main_window?.webContents.send('add_sys_log', log_msg);
        if (LTAI_DEBUG)
            console.log('[ERROR] [LTAI] Target Python Environment not Found');
        const notif: _ToastMessageOptions = {
            severity: 'error',
            summary: 'LTAI Agent',
            detail: 'LTAI Agent is not Installed',
            life: 0,
        };
        main_window?.webContents.send('show_system_notif', { notif });
        return;
    }

    // start ltai service
    lt_ai_process = spawn(__pyint_map[process.platform], [path.join(process.cwd(), 'labtronic_ai', 'main.py')], { cwd: path.join(process.cwd(), 'labtronic_ai') });
    if (!lt_ai_process.stdout || !lt_ai_process.stderr) {
        const log_msg: LogMsg = { source: 'LTAI', level: 'ERROR', msg: 'Error Starting LTAI Service' };
        main_window?.webContents.send('add_sys_log', log_msg);
        if (LTAI_DEBUG)
            console.log('[ERROR] [LTAI] Error Starting LTAI Service');
        return;
    }
    lt_ai_process.stdout.on('data', _data => handle_ltai_logs(_data.toString()));
    lt_ai_process.stderr.on('data', _data => handle_ltai_logs(_data.toString()));
    lt_ai_process.on('error', err => {
        const _log = err.message;
        const log_msg: LogMsg = { source: 'LTAI', level: 'ERROR', msg: _log };
        main_window?.webContents.send('add_sys_log', log_msg);
        if (LTAI_DEBUG)
            console.log(_log);
        show_ai_agent_error_notif();
    });
    lt_ai_process.on('close', () => {
        lt_ai_process = null;
        const notif: _ToastMessageOptions = {
            severity: 'success',
            summary: 'LTAI Agent',
            detail: 'LTAI Agent Stopped',
            life: 3000,
        };
        main_window?.webContents.send('show_system_notif', { notif });
        main_window?.webContents.send('ltai_agent_stopped', {});
        if (LTAI_DEBUG)
            console.log('LTAI Service Stopped');
    });
    if (LTAI_DEBUG)
        console.log('Starting LTAI Service...OK');
}

function stop_ltai_service() {
    if (!lt_ai_process) {
        const notif: _ToastMessageOptions = {
            severity: 'warn',
            summary: 'LTAI Agent',
            detail: 'LTAI Agent is not Running',
            life: 3000,
        };
        main_window?.webContents.send('show_system_notif', { notif });
    }
    lt_ai_process?.kill();
}

export function init_ltai(_main_window: BrowserWindow) {
    main_window = _main_window;
    ipcMain.on('start_ltai_service', () => start_ltai_service());
    ipcMain.on('stop_ltai_service', () => stop_ltai_service());
}