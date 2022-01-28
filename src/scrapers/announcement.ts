import { utils } from "apify";
import { SCHOOL_ROOT_HOMEPAGE } from "../consts";
import { getAnnouncementDetails } from "../parser";
import { AnnouncementEntry, Scraper, UserData } from "../types";

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
    await announcements.pushData(announcement);
};
