import type { CheerioHandlePageInputs } from "apify";
import apify, { utils } from "apify";
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
        $: cheerio.Root;
        $module: cheerio.Cheerio;
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

    async process({ $: _$, request }: CheerioHandlePageInputs): Promise<void> {
        const $ = _$ as cheerio.Root;
        const promiseQueue = [];

        for (const $module of getSpecialModules($)) {
            const category = getModuleName($module);

            // 忽略照片類模組
            if (!category.includes("活動照")) {
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
 * 取得指定 DOM tree 的公告類 (special) 模組。
 * @param $ DOM tree
 */
function* getSpecialModules($: cheerio.Root): Generator<cheerio.Cheerio, void> {
    const $categories = $(".module.module-special");

    for (const category of $categories) {
        yield $(category);
    }
}

/**
 * 取得指定模組的名稱（分類）。
 *
 * @param $module 模組
 */
function getModuleName($module: cheerio.Cheerio): string {
    const title = $module.find("h2.mt-title").text();
    return title;
}

/**
 * 取得公告模組中的所有公告。
 * @param $ DOM tree
 * @param $module 公告模組
 * @param category 公告所屬的分類
 * @param moduleSrcUrl 這個公告模組是從何站台抓下來的？
 */
function* getAnnouncements(
    $: cheerio.Root,
    $module: cheerio.Cheerio,
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
 * 檢查指定的公告條目是單純的公告，還是外連連結。
 *
 * @returns 如果回傳 true，則代表是公告；反之，則是外連連結。
 */
function checkInternal(
    announcementHref: string,
    moduleSrcUrl: string
): boolean {
    // FIXME: 這個演算法可能很耗時
    const { host: loadedUrlHost } = new URL(moduleSrcUrl);
    const { host } = new URL(announcementHref, moduleSrcUrl);

    return loadedUrlHost === host;
}
