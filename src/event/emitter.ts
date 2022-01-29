import { EventEmitter } from "stream";
import type TypedEventEmitter from "typed-emitter";
import type { AnnouncementEventMap } from "../database/announcement";

export type AvailableEvents = AnnouncementEventMap;

export function newEventEmitter(): TypedEventEmitter<AvailableEvents> {
    return new EventEmitter() as TypedEventEmitter<AvailableEvents>;
}
