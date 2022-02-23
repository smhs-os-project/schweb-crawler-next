import type { CheerioHandlePageInputs } from "apify";

/**
 * 包含 `$` cheerio 物件。
 */
export type CheerioObject = Pick<CheerioHandlePageInputs, "$">;
