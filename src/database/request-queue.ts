import type { RequestQueue } from "apify";
import type TypedEventEmitter from "typed-emitter";
import type { PageType } from "../types";

export type RequestQueueEventMap = {
    pushQueue: (
        href: string,
        type: PageType,
        userData: Record<string, string>
    ) => void;
};

/**
 * 將指定 eventEmitter 的 `pushQueue` 事件綁定至指定的 Request Queue。
 */
export function registerRequestQueue(
    requestQueue: RequestQueue,
    eventEmitter: TypedEventEmitter<RequestQueueEventMap>
): void {
    eventEmitter.on("pushQueue", (href, type, userData) => {
        requestQueue.addRequest({
            url: href,
            userData: {
                ...userData,
                type,
            },
        });
    });
}
