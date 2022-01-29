import type TypedEventEmitter from "typed-emitter";
import type {
    AnnouncementContent,
    AnnouncementInfo,
    AnnouncementEntry,
    AnnouncementAttachment,
} from "../types/announcement-entry";
import type { TypedDataset } from "../types/typed-dataset";
import {
    AnnouncementUUIDGenerator,
    UUID,
} from "../utils/announce/uuid-generator";
import { UUIDNotExist } from "./exceptions/uuid-not-exist";

/**
 * AnnouncementDatabase 可使用的事件。
 */
export type AnnouncementEventMap = {
    postAnnouncementInfo: (info: AnnouncementInfo) => UUID;
    patchAnnouncementContent: (
        uuid: UUID,
        content: Partial<AnnouncementContent>
    ) => UUID;
    patchAnnouncementAttachments: (
        uuid: UUID,
        attachment: AnnouncementAttachment[]
    ) => UUID;
};

export class AnnouncementDatabase {
    /**
     * 存放公告的暫存資料集。
     *
     * 不先存進 data set 是為了減少 I/O 操作，加速 crawl 速度。
     */
    private readonly stageDataset: Map<UUID, AnnouncementEntry> = new Map();

    constructor(
        private readonly dataset: TypedDataset<AnnouncementEntry>,
        private readonly uuidGenerator: AnnouncementUUIDGenerator,
        eventEmitter: TypedEventEmitter<AnnouncementEventMap>
    ) {
        eventEmitter.on(
            "postAnnouncementInfo",
            this.postAnnouncementInfo.bind(this)
        );
        eventEmitter.on(
            "patchAnnouncementContent",
            this.patchAnnouncementContent.bind(this)
        );
        eventEmitter.on(
            "patchAnnouncementAttachments",
            this.patchAnnouncementAttachments.bind(this)
        );
    }

    /**
     * 寫入公告資訊。
     *
     * @param announcement
     */
    postAnnouncementInfo(announcement: AnnouncementInfo): UUID {
        const uuid = this.uuidGenerator.generateAnnouncementUUID(announcement);

        this.stageDataset.set(uuid, announcement);

        return uuid;
    }

    /**
     * 取回公告項目。
     *
     * @param uuid
     */
    private retrieveAnnouncement(uuid: UUID): AnnouncementEntry {
        const announcement = this.stageDataset.get(uuid);

        if (!announcement) throw new UUIDNotExist(uuid);

        return announcement;
    }

    /**
     * 寫入公告內容。
     *
     * @param content 要寫入的公告內容。
     */
    patchAnnouncementContent(
        uuid: UUID,
        content: Partial<AnnouncementContent>
    ): UUID {
        this.stageDataset.set(uuid, {
            ...this.retrieveAnnouncement(uuid),
            ...content,
        });

        return uuid;
    }

    /**
     * 寫入公告附件。
     *
     * @param attachment 要寫入的公告附件。
     */
    patchAnnouncementAttachments(
        uuid: UUID,
        attachments: AnnouncementAttachment[]
    ): UUID {
        this.stageDataset.set(uuid, {
            ...this.retrieveAnnouncement(uuid),
            attachments,
        });

        return uuid;
    }

    /**
     * 同步 stage dataset 的資料到 Apify Dataset 中。
     */
    async sync(): Promise<void> {
        const promiseQueue = [];

        for (const [uuid, announcements] of this.stageDataset.entries()) {
            promiseQueue.push(
                this.dataset
                    .pushData(announcements)
                    .then(() => this.stageDataset.delete(uuid))
            );
        }

        await Promise.all(promiseQueue);
    }

    /**
     * 取得 Dataset。
     *
     * 註：請勿對 Dataset 進行任何寫入作業。
     */
    get Dataset(): TypedDataset<AnnouncementEntry> {
        return this.dataset;
    }
}
