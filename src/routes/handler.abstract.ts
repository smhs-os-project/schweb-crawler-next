import type { CheerioHandlePageInputs } from "apify";
import type TypedEventEmitter from "typed-emitter";
import type { AvailableEvents } from "../event/emitter";
import type { Handler } from "../types/router-types";

export abstract class HandlerAbstract implements Handler {
    constructor(
        // Dependency Injection
        protected readonly emitter: TypedEventEmitter<AvailableEvents>
    ) {}

    abstract process(inputs: CheerioHandlePageInputs): Promise<void>;
}
