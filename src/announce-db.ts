import { Dataset } from "apify";
import { writeAnnouncement } from "./exporter";
import { AnnouncementEntry, AnnouncementEntryInfo } from "./types";

/**
 * 公告的類型。
 */
const enum AnnouncementType {
    /**
     * 內連至公告內文頁面。
     */
    Internal,
    /**
     * 外連至其他站台。
     */
    External,
}

export type Announcement<T extends AnnouncementType> =
    T extends AnnouncementType.Internal
        ? AnnouncementEntry
        : AnnouncementEntryInfo;

/**
 * 儲存公告的記憶體資料庫
 */
export class AnnounceDatabase {
    /**
     * 可並行操作的子任務。
     */
    submissions: (Promise<void> | null)[] = [];

    constructor(private readonly dataset: Dataset) {}

    async pushData<T extends AnnouncementType>(
        type: T,
        data: Announcement<T>
    ): Promise<void> {
        const pushDatasetSubmission = this.dataset.pushData(data);
        const writeAnnouncementFileSubmission =
            // 假如是內部連結，則需要寫入檔案。
            type === AnnouncementType.Internal
                ? // 前面斷言過 type === AnnouncementType.Internal => AnnouncementEntry
                  // 所以這裡可以直接 `as`。
                  writeAnnouncement(data as AnnouncementEntry)
                : null;

        this.submissions.push(
            pushDatasetSubmission,
            writeAnnouncementFileSubmission
        );
    }

    async join(): Promise<void> {
        await Promise.all(this.submissions);
        // 清除所有任務。
        this.submissions.length = 0;
    }

    forEach(callback: (data: AnnouncementEntry) => void): void {
        this.dataset.forEach(callback);
    }
}
