import type TypedEventEmitter from "typed-emitter";
import type { AvailableEvents } from "../event/emitter";
import type { PageType, Handler } from "../types/router-types";
import type { HandlerAbstract } from "./handler.abstract";
import { Router } from "./router";

export type HandlerConstructor = new (
    emitter: TypedEventEmitter<AvailableEvents>
) => HandlerAbstract;

/**
 * Router 的建構類別。
 */
export class RouterBuilder {
    private readonly handlerTable: Record<string, Handler> = {};

    private emitter: TypedEventEmitter<AvailableEvents> | null = null;

    setEmitter(emitter: TypedEventEmitter<AvailableEvents>): this {
        this.emitter = emitter;
        return this;
    }

    addRoute(type: PageType, Handler: HandlerConstructor): this {
        if (!this.emitter) throw new Error("Emitter is not set.");

        this.handlerTable[type] = new Handler(this.emitter);
        return this;
    }

    build(): Router {
        return new Router(this.handlerTable);
    }
}
