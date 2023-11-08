import { reactive, readonly } from 'vue';

interface EventListeners {
  [event: string]: Function[];
}

const listeners: EventListeners = reactive({});

export function useEventEmitter() {
  function $on(event: string, callback: Function) {
    if (!listeners[event]) {
      listeners[event] = reactive([]);
    }
    listeners[event].push(callback);
  }

  function $off(event: string, callback: Function) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter((fn) => fn !== callback);
  }

  function $emit(event: string, ...args: any[]) {
    if (!listeners[event]) return;
    listeners[event].forEach((callback) => callback(...args));
  }

  return { $on: readonly($on), $off: readonly($off), $emit: readonly($emit) };
}