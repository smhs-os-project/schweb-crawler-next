import { CheerioHandlePage, utils } from "apify";
import {
    getSpecialModules,
    getCategoryTitle,
    getAnnouncements,
} from "../parser";
import { PageType, UserData } from "../types";

const { log, enqueueLinks } = utils;

export const handleRootPageFunction: CheerioHandlePage = async ({
    request,
    $: _$,
}) => {
    const $ = _$ as cheerio.Root;
    const { requestQueue } = request.userData as UserData;
    const queues: Promise<unknown>[] = [];

    for (const $module of getSpecialModules($)) {
        const categoryTitle = getCategoryTitle($module);
        log.info(`Found special module: ${categoryTitle}`);

        for (const announcement of getAnnouncements(
            $,
            $module,
            categoryTitle
        )) {
            log.info(`Queuing announcement: ${announcement.title}`);

            queues.push(
                enqueueLinks({
                    $,
                    requestQueue,
                    baseUrl: request.loadedUrl,
                    pseudoUrls: [announcement.href],
                    transformRequestFunction: (nextRequest) => {
                        log.debug(`transforming: ${nextRequest.url}`);
                        nextRequest.userData = {
                            type: PageType.Announcement,
                            context: {
                                announcementInfo: announcement,
                            },
                        } as Partial<UserData>;
                        return nextRequest;
                    },
                })
            );
        }
    }

    // Wait for all queues to finish.
    await Promise.all(queues);
};
