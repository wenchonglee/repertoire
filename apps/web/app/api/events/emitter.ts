import { EventEmitter } from "stream";

// Emitter singleton

const globalForEmitter = globalThis as unknown as {
  emitter: EventEmitter | undefined;
};

export const emitter = globalForEmitter.emitter ?? new EventEmitter();
emitter.setMaxListeners(0);

if (process.env.NODE_ENV !== "production") globalForEmitter.emitter = emitter;
