import { utils } from "apify";
import {
    getSpecialModules,
    getCategoryTitle,
    getAnnouncements,
} from "../parser";
import { PageType, Scraper } from "../types";

const { log } = utils;

export const handleRootPageFunction: Scraper<void> = async (
    { requestQueue },
    { request, $: _$ }
) => {
    const $ = _$ as cheerio.Root;
    const queues: Promise<unknown>[] = [];

    for (const $module of getSpecialModules($)) {
        const categoryTitle = getCategoryTitle($module);
        log.info(`Found special module: ${categoryTitle}`);

        for (const announcement of getAnnouncements(
            $,
            $module,
            categoryTitle
        )) {
            log.info(
                `Queuing announcement: ${announcement.title} -> ${announcement.href}`
            );

            const { href } = new URL(announcement.href, request.loadedUrl);
            queues.push(
                requestQueue.addRequest({
                    url: href,
                    userData: {
                        type: PageType.Announcement,
                        context: {
                            announcementInfo: announcement,
                        },
                    },
                })
            );
        }
    }

    // Wait for all queues to finish.
    await Promise.all(queues);
};
