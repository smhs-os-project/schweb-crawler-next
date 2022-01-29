import type { CheerioHandlePageInputs } from "apify";
import type { BasicUserData, Handler, PageType } from "../types/router-types";
import { UnhandledPageType } from "./exceptions/unhandled-page-type";

export class Router {
    constructor(private readonly handlers: Record<PageType, Handler>) {}

    /**
     * 將指定請求轉送到指定路由。
     *
     * @throws UnhandledPageType
     */
    public async handle(inputs: CheerioHandlePageInputs): Promise<void> {
        const { type } = inputs.request.userData as BasicUserData;
        const handlers = this.handlers[type];

        if (!handlers) throw new UnhandledPageType(type);
        await handlers.process(inputs);
    }
}
