import { AnnouncementInfo } from "./announcement-entry";

/**
 * 公告索引中的簡短公告資訊
 */
export type AnnouncementIndexEntry = {
    /**
     * 公告 ID
     *
     * `/announcements/{id}.json` 可以取得機器易讀的公告完整資料。
     *
     * @see AnnouncementInfo
     */
    id: string;
} & Omit<AnnouncementInfo, "category">;

/**
 * 公告索引
 */
export type AnnouncementIndex = Record<string, AnnouncementIndexEntry[]>;

/**
 * 可取用的分類清單
 */
export type AvailableCategories = string[];
