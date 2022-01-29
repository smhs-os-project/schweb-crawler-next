import type { PageType } from "../../types";

export class UnhandledPageType extends Error {
    constructor(public readonly pageType: PageType) {
        super(`Unhandled page type: ${pageType}`);
        this.name = UnhandledPageType.name;
    }
}
