import { EventEmitter } from "events";

export const eventBus = new EventEmitter();

export const EVENTS = {
  LOG_RECEIVED: "LOG_RECEIVED",
  MESSAGE_RECEIVED: "MESSAGE_RECEIVED",
};
