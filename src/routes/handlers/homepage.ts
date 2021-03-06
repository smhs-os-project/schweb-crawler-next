import type { CheerioHandlePageInputs } from "apify";
import apify, { utils } from "apify";
import { Cheerio } from "cheerio/lib/cheerio";
import type { CheerioAPI } from "cheerio/lib/load";
import type { Node, Element } from "domhandler";
import { SCHOOL_ROOT_HOMEPAGE } from "../../consts";
import { AnnouncementInfo } from "../../types/announcement-entry";
import { Handler, PageType } from "../../types/router-types";
import { HandlerAbstract } from "../handler.abstract";

const { log } = utils;

export class HomepageHandler extends HandlerAbstract implements Handler {
    protected async announcementModuleHandler({
        $,
        request,
        $module,
        category,
    }: {
        $: CheerioAPI;
        $module: Cheerio<Node>;
        category: string;
        request: apify.Request;
    }): Promise<void> {
        for (const info of getAnnouncements(
            $,
            $module,
            category,
            request.loadedUrl
        )) {
            log.info(`Queuing announcement: ${info.title} -> ${info.href}`);

            // Get the link to our server to crawl.
            const url = new URL(info.href, request.loadedUrl);
            // Set the href of announcement to school homepage
            // so consumers can get the real URL to announcement.
            info.href = new URL(info.href, SCHOOL_ROOT_HOMEPAGE).href;

            this.emitter.emit(
                "postAnnouncementInfo",
                info,
                ([uuid, addedGuard]) => {
                    if (!addedGuard)
                        this.emitter.emit(
                            "pushQueue",
                            url.href,
                            PageType.Announcement,
                            {
                                uuid,
                            }
                        );
                }
            );
        }
    }

    async process({ $, request }: CheerioHandlePageInputs): Promise<void> {
        const promiseQueue = [];

        for (const $module of getSpecialModules($)) {
            const category = getModuleName($module);

            // ?????????????????????
            if (!category.includes("?????????")) {
                log.info(`[HomepageHandler] Processing module: ${category}`);
                promiseQueue.push(
                    this.announcementModuleHandler({
                        $,
                        $module,
                        category,
                        request,
                    })
                );
            } else {
                log.info(`[HomepageHandler] Skipping module: ${category}`);
            }
        }

        await Promise.all(promiseQueue);
    }
}

/**
 * ???????????? DOM tree ???????????? (special) ?????????
 * @param $ DOM tree
 */
function* getSpecialModules($: CheerioAPI): Generator<Cheerio<Element>, void> {
    const $categories = $(".module.module-special");

    for (const category of $categories) {
        yield $(category);
    }
}

/**
 * ??????????????????????????????????????????
 *
 * @param $module ??????
 */
function getModuleName($module: Cheerio<Node>): string {
    const title = $module.find("h2.mt-title").text();
    return title;
}

/**
 * ???????????????????????????????????????
 * @param $ DOM tree
 * @param $module ????????????
 * @param category ?????????????????????
 * @param moduleSrcUrl ????????????????????????????????????????????????
 */
function* getAnnouncements(
    $: CheerioAPI,
    $module: Cheerio<Node>,
    category: string,
    moduleSrcUrl: string
): Generator<AnnouncementInfo, void> {
    const $items = $module.find(".d-item");

    for (const item of $items) {
        const $item = $(item);
        const $titleLink = $item.find("a");
        const $date = $item.find(".mdate");

        const title = $titleLink.attr("title")?.trim();
        const href = $titleLink.attr("href");
        const date = $date.text().trim();

        if (title && href) {
            const external = !checkInternal(href, moduleSrcUrl);
            yield { category, title, href, date, external };
        }
    }
}

/**
 * ?????????????????????????????????????????????????????????????????????
 *
 * @returns ???????????? true??????????????????????????????????????????????????????
 */
function checkInternal(
    announcementHref: string,
    moduleSrcUrl: string
): boolean {
    // FIXME: ??????????????????????????????
    const { host: loadedUrlHost } = new URL(moduleSrcUrl);
    const { host } = new URL(announcementHref, moduleSrcUrl);

    return loadedUrlHost === host;
}
