import { Apify, CheerioHandlePage } from "apify";
import {
    getSpecialModules,
    getCategoryTitle,
    getAnnouncements,
} from "../parser";

const { log, enqueueLinks } = Apify.utils;

export const handleRootPageFunction: CheerioHandlePage = async ({
    request,
    $: _$,
}) => {
    const $ = _$ as cheerio.Root;

    for (const $module of getSpecialModules($)) {
        log.info(`Found special module: ${getCategoryTitle($module)}`);

        for (const announcement of getAnnouncements($, $module)) {
            log.info(JSON.stringify(announcement));
        }
    }
};
