import path from "path";
import fsPromises from "fs/promises";
import fs from "fs";
import recursiveCopy from "recursive-copy";
import type { AnnouncementEntry } from "../types/announcement-entry";
import type { Exporter } from "../types/exporter-types";
import type { TypedDataset } from "../types/typed-dataset";
import type { AnnouncementUUIDGenerator } from "../utils/announce/uuid-generator";

export abstract class ExporterAbstract implements Exporter {
    constructor(
        protected readonly announcementDataset: TypedDataset<AnnouncementEntry>,
        protected readonly uuidGenerator: AnnouncementUUIDGenerator
    ) {}

    abstract export(dataDir: string): Promise<void>;

    /**
     * 假如檔案所在的資料夾不存在，則自動建立
     *
     * @param filePath 檔案路徑
     */
    private async createDirOfFile(filePath: string): Promise<void> {
        const dir = path.dirname(filePath);

        if (!fs.existsSync(dir)) {
            await fsPromises.mkdir(dir, { recursive: true });
        }
    }

    /**
     * 寫入檔案。假如資料夾不存在，則自動建立。
     * @param filePath 要寫入的檔案路徑。
     * @param content 檔案內容。
     */
    protected async writeFile(
        filePath: string,
        content: Buffer | string
    ): Promise<void> {
        await this.createDirOfFile(filePath);
        await fsPromises.writeFile(filePath, content);
    }

    /**
     * 複製檔案。假如資料夾不存在，則自動建立。
     * @param src 來源位置。
     * @param dst 目標位置。
     */
    protected async copyFile(src: string, dst: string): Promise<void> {
        await this.createDirOfFile(dst);
        await recursiveCopy(src, dst, {
            overwrite: true,
        });
    }
}
