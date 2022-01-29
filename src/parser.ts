import sanitizeHtml from "sanitize-html";
import minifyHtml from "@minify-html/js";
import { NO_CONTENT_PLACEHOLDER, SCHOOL_ROOT_HOMEPAGE } from "./consts";
import {
    AnnouncementAttachment,
    AnnouncementEntryDetails,
    AnnouncementEntryInfo,
} from "./types";

/**
 * 取得指定 DOM tree 的公告類 (special) 模組。
 * @param $ DOM tree
 */
export function* getSpecialModules(
    $: cheerio.Root
): Generator<cheerio.Cheerio, void> {
    const $categories = $(".module.module-special");

    for (const category of $categories) {
        yield $(category);
    }
}

/**
 * 取得指定 DOM tree 的連結類 (link) 模組。
 * @param $ DOM tree
 */
export function* getLinkModules(
    $: cheerio.Root
): Generator<cheerio.Cheerio, void> {
    const $categories = $(".module.module-link");

    for (const category of $categories) {
        yield $(category);
    }
}

/**
 * 取得模組標題。
 * @param $module 模組
 */
export function getCategoryTitle($module: cheerio.Cheerio): string {
    const title = $module.find("h2.mt-title").text();
    return title;
}

/**
 * 取得公告模組中的所有公告。
 * @param $ DOM tree
 * @param $module 公告模組
 * @param category 公告所屬的分類
 */
export function* getAnnouncements(
    $: cheerio.Root,
    $module: cheerio.Cheerio,
    category: string
): Generator<AnnouncementEntryInfo, void> {
    const $items = $module.find(".d-item");

    for (const item of $items) {
        const $item = $(item);
        const $titleLink = $item.find("a");
        const $date = $item.find(".mdate");

        const title = $titleLink.attr("title")?.trim();
        const href = $titleLink.attr("href");
        const date = $date.text().trim();

        if (title && href) yield { category, title, href, date };
    }
}

const minifyConfiguration = minifyHtml.createConfiguration({});

/**
 * 解析並清理公告內頁中的公告額外資訊。
 * @param $ 公告內頁
 */
export function getAnnouncementDetails(
    $: cheerio.Root
): AnnouncementEntryDetails {
    const $content = $(".mcont");
    const $attachments = $(".mptattach a");

    const content = minifyHtml
        .minify(
            sanitizeHtml($content.html() ?? NO_CONTENT_PLACEHOLDER),
            minifyConfiguration
        )
        .toString("utf-8");
    const attachments: AnnouncementAttachment[] = [];

    for (const attachment of $attachments) {
        const rawName = $(attachment).attr("title");
        const uri = $(attachment).attr("href");

        if (rawName && uri) {
            const name = rawName.replace(/(?:\(|（)另開新視窗(?:\)|）)/, "");
            const { href } = new URL(uri, SCHOOL_ROOT_HOMEPAGE);

            attachments.push({ name, href });
        }
    }

    return { content, attachments };
}
