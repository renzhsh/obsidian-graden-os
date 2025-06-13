type EventCallback<T = any> = (data: T) => void;

export const SETTINGS_CHANGED = "settings:changed"

export class EventBus {
    private events: Record<string, EventCallback[]> = {};

    // 订阅事件
    public subscribe(eventName: string, callback: EventCallback): void {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }

    // 取消订阅
    public unsubscribe(eventName: string, callback: EventCallback): void {
        if (this.events[eventName]) {
            this.events[eventName] = this.events[eventName].filter(
                (cb) => cb !== callback
            );
        }
    }

    // 触发事件
    public emit(eventName: string, data?: any): void {
        if (this.events[eventName]) {
            this.events[eventName].forEach((callback) => callback(data));
        }
    }
}