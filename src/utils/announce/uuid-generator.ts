import { v5 as uuidv5 } from "uuid";
import { AnnouncementInfo } from "../../types/announcement-entry";

/**
 * 與分類相關的 namespace。
 *
 * @readonly
 */
const categoryNamespace = "443de3b4-6ca5-49e4-bf97-f31373ad221e";

export type UUID = string;

export class AnnouncementUUIDGenerator {
    /**
     * 分類 UUID cache。
     *
     * key 是分類名稱。
     */
    private categoryCache: Map<string, UUID> = new Map();

    /**
     * 公告項目 UUID cache。
     */
    private announcementCache: Map<AnnouncementInfo, UUID> = new Map();

    /**
     * 從快取取出資料。
     *
     * 假如 storage 有對應 key 的資料，則直接回傳；
     * 反之則呼叫 callback 產生值並存入快取。
     *
     * @param storage
     */
    private retrieve<S extends Map<K, V>, K, V>(
        storage: S,
        key: K,
        callback: () => V
    ): V {
        const cache = storage.get(key);

        if (cache) {
            return cache;
        }

        const value = callback();
        return value;
    }

    /**
     * 產生分類的 UUID。
     *
     * @param category 分類名稱。
     */
    generateCategoryUUID(category: string): UUID {
        return this.retrieve(this.categoryCache, category, () =>
            uuidv5(category, categoryNamespace)
        );
    }

    /**
     * 產生公告項目的 UUID。
     *
     * @param announcement 公告項目。
     */
    generateAnnouncementUUID(announcement: AnnouncementInfo): UUID {
        return this.retrieve(this.announcementCache, announcement, () =>
            uuidv5(
                `${announcement.title} @ ${announcement.date}`,
                this.generateCategoryUUID(announcement.category)
            )
        );
    }
}
