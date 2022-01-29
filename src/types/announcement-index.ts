import { AnnouncementEntry } from "./announcement-entry";

/**
 * 公告索引中的簡短公告資訊。
 */
export type AnnouncementIndexEntry = {
    /**
     * 公告 ID。
     *
     * `/announcements/{id}.json` 可以取得機器易讀的公告完整資料。
     *
     * @see AnnouncementEntry
     */
    id: string;
} & Omit<AnnouncementEntry, "category">;
