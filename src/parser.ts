import { AnnouncementEntryInfo } from "./types";

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
 * @param $module 公告模組
 */
export function* getAnnouncements(
    $: cheerio.Root,
    $module: cheerio.Cheerio
): Generator<AnnouncementEntryInfo, void> {
    const $items = $module.find(".d-item");

    for (const item of $items) {
        const $item = $(item);
        const $titleLink = $item.find("a");
        const $date = $item.find(".mdate");

        const title = $titleLink.attr("title");
        const href = $titleLink.attr("href");
        const date = $date.text();

        if (title && href && date) yield { title, href, date };
    }
}
