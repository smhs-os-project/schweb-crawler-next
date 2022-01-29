import type { CheerioHandlePageInputs, RequestQueue, Dataset } from "apify";

/**
 * 公告索引中的簡短公告資訊。
 */
export interface AnnouncementIndexEntry {
    /**
     * 公告 ID。
     *
     * `/announcements/{id}.json` 可以取得機器易讀的公告完整資料。
     *
     * @see AnnouncementEntry
     */
    id: string;
    /**
     * 公告標題。
     */
    title: string;
    /**
     * 公告發布日期。
     */
    date: string;
    /**
     * 連到校網的連結。
     */
    href: string;
    /**
     * 公告是否是外部連結？
     *
     * 如果連到外部連結，則不建立公告完整資料，
     * 取用者可以直接將使用者導向 `href` 的連結。
     */
    external: boolean;
}

/**
 * `getAnnouncements()` 回傳的公告項目。
 */
export interface AnnouncementEntryInfo {
    /**
     * 公告分類
     */
    category: string;
    /**
     * 公告標題。
     */
    title: string;
    /**
     * 公告指向的連結。
     */
    href: string;
    /**
     * 公告的發布日期。
     */
    date: string;
    /**
     * 公告是否是外部連結？
     *
     * 如果連到外部連結，則不建立公告完整資料，
     * 取用者可以直接將使用者導向 `href` 的連結。
     */
    external: boolean;
}

/**
 * 公告的詳細資訊。
 */
export interface AnnouncementEntryDetails {
    /**
     * 公告內容。已經使用 `sanitize-html` 清理內容。
     */
    content: string;
    /**
     * 公告的附件名單。
     */
    attachments: AnnouncementAttachment[];
}

/**
 * 公告的附件。
 */
export interface AnnouncementAttachment {
    /**
     * 附件名稱。
     */
    name: string;
    /**
     * 附件連結。
     */
    href: string;
}

/**
 * 一個完整的公告項目。
 */
export type AnnouncementEntry = AnnouncementEntryInfo &
    AnnouncementEntryDetails;

/**
 * 頁面類型。
 */
export enum PageType {
    /**
     * 首頁。
     */
    Root = "root",
    /**
     * 公告頁。
     */
    Announcement = "announcement",
    /**
     * 檔案（TODO）。
     */
    Files = "files",
}

/**
 * 請求的情境資料。
 */
export interface UserData {
    /**
     * 本請求的頁面類型。
     */
    type: PageType;
    /**
     * 先前請求頁面的情境資料。
     */
    context?: {
        /**
         * (`type = Announcement`) 公告頁面的公告資料。
         */
        announcementInfo?: AnnouncementEntryInfo;
    };
}

/**
 * 給子 Scraper 的情境資料。
 */
export interface ScraperContext {
    /**
     * 本請求的請求佇列（可用於傳入 `utils.enqueueLinks()`）。
     */
    requestQueue: RequestQueue;
    /**
     * 資料集。
     */
    datasets: {
        /**
         * 抓下的所有公告
         */
        announcements: Dataset;
    };
}

/**
 * 爬蟲函式。基於 `CheerioHandlePage`。
 *
 * @template RT 回傳類型。
 * @see CheerioHandlePage
 */
export type Scraper<RT> = (
    scraperContext: ScraperContext,
    requestInputs: CheerioHandlePageInputs
) => Promise<RT>;
