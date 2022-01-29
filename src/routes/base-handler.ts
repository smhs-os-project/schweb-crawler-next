import { CheerioHandlePageInputs } from "apify";
import { EventEmitter } from "stream";
import { Handler } from "../types/router-types";

export abstract class BaseHandler implements Handler {
    constructor(
        // Dependency Injection
        protected readonly emitter: EventEmitter
    ) {}

    abstract process(inputs: CheerioHandlePageInputs): Promise<void>;
}
