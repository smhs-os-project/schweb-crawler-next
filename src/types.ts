import type { RequestQueue } from "apify";

/**
 * `getAnnouncements()` 回傳的公告項目。
 */
export interface AnnouncementEntryInfo {
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
 * 頁面類型。
 */
export enum PageType {
    Root,
    Announcement,
    Files,
}

/**
 * 請求的特殊內容。
 */
export interface UserData {
    type: PageType;
    requestQueue: RequestQueue;
}
