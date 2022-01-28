import type { Dataset, RequestQueue } from "apify";

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
    Root,
    /**
     * 公告頁。
     */
    Announcement,
    /**
     * 檔案（TODO）。
     */
    Files,
}

/**
 * 請求的特殊內容。
 */
export interface UserData {
    /**
     * 本請求的頁面類型。
     */
    type: PageType;
    /**
     * 本請求的請求佇列（可用於傳入 `utils.enqueueLinks()`）。
     */
    requestQueue: RequestQueue;
    /**
     * 先前請求頁面的情境資料。
     */
    context?: {
        /**
         * (`type = Announcement`) 公告頁面的公告資料。
         */
        announcementInfo?: AnnouncementEntryInfo;
    };
    /**
     * 要儲存為實際檔案的資料集。
     */
    datasets: {
        /**
         * 抓下的所有公告。
         */
        announcements: Dataset;
    };
}
