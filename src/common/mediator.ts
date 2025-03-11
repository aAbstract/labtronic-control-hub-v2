type EventHandler = (args: any) => void;

let subscribers: Record<string, EventHandler[]> = {};

export function subscribe(event_type: string, func: (args: any) => void) {
    if (!(event_type in subscribers))
        subscribers[event_type] = [];
    subscribers[event_type].push(func);
}

export function post_event(event_type: string, args: any) {
    if (!(event_type in subscribers))
        return;

    for (const func of subscribers[event_type])
        func(args);
}
