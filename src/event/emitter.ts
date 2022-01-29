import { EventEmitter } from "stream";
import type TypedEventEmitter from "typed-emitter";
import type { AnnouncementEventMap } from "../database/announcement";

export type availableEvents = AnnouncementEventMap;
export const eventEmitter =
    new EventEmitter() as TypedEventEmitter<AnnouncementEventMap>;
