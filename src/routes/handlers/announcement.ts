import type { CheerioHandlePageInputs } from "apify";
import type { Handler } from "../../types/router-types";
import { BaseHandler } from "../base-handler";

export class AnnouncementHandler extends BaseHandler implements Handler {
    process(inputs: CheerioHandlePageInputs): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
