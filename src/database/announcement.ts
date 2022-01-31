import Apify from "apify";
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

const {
    utils: { log },
} = Apify;

/**
 * AnnouncementDatabase 可使用的事件。
 */
export type AnnouncementEventMap = {
    postAnnouncementInfo: (
        info: AnnouncementInfo,
        cb?: (resp: [UUID, boolean]) => void
    ) => void;
    patchAnnouncementContent: (
        uuid: UUID,
        content: Partial<AnnouncementContent>,
        cb?: (uuid: UUID) => void
    ) => void;
    patchAnnouncementAttachments: (
        uuid: UUID,
        attachment: AnnouncementAttachment[],
        cb?: (uuid: UUID) => void
    ) => void;
};

export class AnnouncementDatabase {
    /**
     * 已經儲存的公告 UUID 名單
     *
     * 防止公告重複儲存至 data set。
     */
    private readonly storedDataset = new Set<UUID>();

    /**
     * 存放公告的暫存資料集
     *
     * 不先存進 data set 是為了減少 I/O 操作，加速 crawl 速度。
     */
    private readonly stageDataset = new Map<UUID, AnnouncementEntry>();

    constructor(
        private readonly dataset: TypedDataset<AnnouncementEntry>,
        private readonly uuidGenerator: AnnouncementUUIDGenerator,
        eventEmitter: TypedEventEmitter<AnnouncementEventMap>
    ) {
        eventEmitter.on("postAnnouncementInfo", (info, cb) => {
            const resp = this.postAnnouncementInfo(info);

            if (cb) cb(resp);
        });
        eventEmitter.on("patchAnnouncementContent", (uuid, content, cb) => {
            const resp = this.patchAnnouncementContent(uuid, content);

            if (cb) cb(resp);
        });
        eventEmitter.on(
            "patchAnnouncementAttachments",
            (uuid, attachment, cb) => {
                const resp = this.patchAnnouncementAttachments(
                    uuid,
                    attachment
                );

                if (cb) cb(resp);
            }
        );
    }

    /**
     * 檢查公告是否早已處理過
     *
     * @param uuid 公告的 UUID。
     */
    isProcessedBefore(uuid: UUID): boolean {
        return this.storedDataset.has(uuid);
    }

    /**
     * 寫入公告資訊。
     *
     * @param announcement 公告
     * @return 如果先前就已經處理過，則回傳 `[UUID, true]`，否則回傳 `[UUID, false]`。
     */
    postAnnouncementInfo(announcement: AnnouncementInfo): [UUID, boolean] {
        const uuid = this.uuidGenerator.generateAnnouncementUUID(announcement);
        if (this.isProcessedBefore(uuid)) {
            log.info(`Announcement ${uuid} has been processed before.`);
            return [uuid, true];
        }

        this.stageDataset.set(uuid, {
            attachments: [],
            ...announcement,
        });

        return [uuid, false];
    }

    /**
     * 取回公告項目。
     *
     * @param uuid
     * @throws UUIDNotExist
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
     * @throws UUIDNotExist
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
     * @throws UUIDNotExist
     */
    patchAnnouncementAttachments(
        uuid: UUID,
        attachments: AnnouncementAttachment[]
    ): UUID {
        const announcement = this.retrieveAnnouncement(uuid);
        announcement.attachments = attachments;

        return uuid;
    }

    /**
     * 將 Apify Dataset 的資料載入至 stored dataset 中以便比對。
     */
    async load(): Promise<void> {
        await this.dataset.forEach((item) => {
            const uuid = this.uuidGenerator.generateAnnouncementUUID(item);
            this.storedDataset.add(uuid);
        });
    }

    /**
     * 同步 stage dataset 的資料到 Apify Dataset 中
     *
     * 同步完成的 dataset 會載入至 stored dataset 中防止重複新增。
     */
    async sync(): Promise<void> {
        const promiseQueue = [];

        for (const [uuid, announcements] of this.stageDataset.entries()) {
            promiseQueue.push(
                this.dataset.pushData(announcements).then(() => {
                    this.stageDataset.delete(uuid);
                    this.storedDataset.add(uuid);
                })
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
