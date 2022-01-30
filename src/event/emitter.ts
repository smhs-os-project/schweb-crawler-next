import { EventEmitter } from "stream";
import type TypedEventEmitter from "typed-emitter";
import type { AnnouncementEventMap } from "../database/announcement";
import type { RequestQueueEventMap } from "../database/request-queue";

export type AvailableEvents = AnnouncementEventMap & RequestQueueEventMap;

export function newEventEmitter(): TypedEventEmitter<AvailableEvents> {
    return new EventEmitter() as TypedEventEmitter<AvailableEvents>;
}
