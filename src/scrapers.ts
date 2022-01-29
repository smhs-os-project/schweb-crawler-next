import { utils } from "apify";
import { SCHOOL_ROOT_HOMEPAGE } from "./consts";
import { writeAnnouncement } from "./exporter";
import {
    getAnnouncementDetails,
    getSpecialModules,
    getCategoryTitle,
    getAnnouncements,
} from "./parser";
import { AnnouncementEntry, UserData, PageType, Scraper } from "./types";

const { log } = utils;

export const handleAnnouncementPageFunction: Scraper<void> = async (
    { datasets: { announcements } },
    { request, $: _$ }
) => {
    const $ = _$ as cheerio.Root;
    const userData = request.userData as UserData;

    if (!userData.context?.announcementInfo)
        throw new Error("Invalid Request: No announcementInfo");

    const announcementDetails = getAnnouncementDetails($);
    const announcement: AnnouncementEntry = {
        ...userData.context.announcementInfo,
        ...announcementDetails,
        href: new URL(
            userData.context.announcementInfo.href,
            SCHOOL_ROOT_HOMEPAGE
        ).href,
    };

    log.info(`Inserting ${announcement.title} to database...`);
    await Promise.all([
        announcements.pushData(announcement),
        writeAnnouncement(announcement),
    ]);
};

export const handleRootPageFunction: Scraper<void> = async (
    { requestQueue },
    { request, $: _$ }
) => {
    const $ = _$ as cheerio.Root;
    const queues: Promise<unknown>[] = [];

    for (const $module of getSpecialModules($)) {
        const categoryTitle = getCategoryTitle($module);

        if (!categoryTitle.includes("活動照")) {
            log.info(`Found special module: ${categoryTitle}`);

            for (const announcement of getAnnouncements(
                $,
                $module,
                categoryTitle
            )) {
                log.info(
                    `Queuing announcement: ${announcement.title} -> ${announcement.href}`
                );

                const { host, href } = new URL(
                    announcement.href,
                    request.loadedUrl
                );

                // 忽略非學校網站的公告連結
                if (host !== "www.smhs.kh.edu.tw") {
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
        } else {
            log.info(`Ignoring image module: ${categoryTitle}`);
        }
    }

    // Wait for all queues to finish.
    await Promise.all(queues);
};
