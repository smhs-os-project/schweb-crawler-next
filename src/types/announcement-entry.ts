/**
 * `getAnnouncements()` 回傳的公告資訊。
 */
export interface AnnouncementInfo {
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
 * 公告內文與附件。
 */
export interface AnnouncementContent {
    /**
     * 公告內文。已經使用 `sanitize-html` 清理內容。
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
 * 一個完整的公告資料。
 */
export type AnnouncementEntry = AnnouncementInfo & Partial<AnnouncementContent>;
