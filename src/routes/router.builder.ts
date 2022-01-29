import type { PageType, Handler } from "../types/router-types";
import { Router } from "./router";

/**
 * Router 的建構類別。
 */
export class RouterBuilder {
    private readonly handlerTable: Record<string, Handler> = {};

    addRoute(type: PageType, handler: Handler): this {
        this.handlerTable[type] = handler;
        return this;
    }

    build(): Router {
        return new Router(this.handlerTable);
    }
}
