import flatstr from "flatstr";
import path from "path";
import { categoriesSerializer, indexSerializer } from "../serializer";
import { ExporterAbstract } from "../exporter.abstract";
import type { AnnouncementIndex } from "../../types/announcement-index";
import type {
    CategoriesResponse,
    IndexResponse,
} from "../../types/exported-endpoint";
import type { Exporter } from "../../types/exporter-types";
import { writeFile } from "../../utils/file";
import { generateEndpointResponse } from "../utils";

/**
 * 日期字串。
 *
 * @example 2022-1-1
 * @example 2022-01-01
 */
type DateString = string;

/**
 * Unix 時間戳。
 *
 * @example 1573430400000
 */
type Timestamp = number;

export class IndexExporter extends ExporterAbstract implements Exporter {
    private timestampCacheMap = new Map<string, number>();

    /**
     * 取得指定日期 (`2022-1-1`) 的 Timestamp 並自動快取。
     */
    private getTimestamp(rawDate: DateString): Timestamp {
        let value = this.timestampCacheMap.get(rawDate);
        if (!value) {
            value = Date.parse(rawDate);
            this.timestampCacheMap.set(rawDate, value);
        }

        return value;
    }

    /**
     * 對 dataset 進行以分類為基礎的索引
     */
    private async indexer(): Promise<AnnouncementIndex> {
        const index: AnnouncementIndex = {};

        await this.announcementDataset.forEach((entry) => {
            index[entry.category] = index[entry.category] ?? [];
            index[entry.category].push({
                id: this.uuidGenerator.generateAnnouncementUUID(entry),
                ...entry,
            });
        });

        return index;
    }

    /**
     * 根據指定的索引產生 JSON 回應
     *
     * @param index 使用 `indexer()` 產生的索引。
     */
    private generateJson(index: AnnouncementIndex): IndexResponse {
        return generateEndpointResponse(index);
    }

    /**
     * 根據指定的索引產生 Markdown 內容
     *
     * @param index 使用 `indexer()` 產生的索引。
     * @returns 已經 `flatstr()` 的 Markdown 的文字。
     */
    private generateMarkdown(index: AnnouncementIndex): string {
        let buf = `\
# SMHS 公告資料庫

這個公告資料庫可以在 SMHS 校網斷線時讓您查閱公告（目前不包含附件）。
您亦可以撰寫自己的前端網頁對接本資料，詳情見 [api-help.md](./api-help.md)。

## 公告一覽\n`;

        for (const [category, announcements] of Object.entries(index)) {
            buf += `\n### ${category}\n`;

            const filteredSortedAnnouncements = announcements
                .sort((a, b) => {
                    const aT = this.getTimestamp(a.date);
                    const bT = this.getTimestamp(b.date);

                    return bT - aT;
                })
                .slice(0, 9);

            for (const announcement of filteredSortedAnnouncements) {
                buf += `- [${announcement.date} / ${announcement.title}](./announcements/${announcement.id}.md)\n`;
            }
        }

        return flatstr(buf);
    }

    /**
     * 產生可取用的分類清單 API 回應
     *
     * @param index 使用 `indexer()` 產生的索引。
     */
    private generateCategoryJson(index: AnnouncementIndex): CategoriesResponse {
        return generateEndpointResponse(Object.keys(index));
    }

    async export(dataDir: string): Promise<void> {
        const index = await this.indexer();

        const json = this.generateJson(index);
        const categories = this.generateCategoryJson(index);
        const markdown = this.generateMarkdown(index);

        const jsonFilePath = path.join(dataDir, "index.json");
        const categoriesFilePath = path.join(dataDir, "categories.json");
        const markdownFilePath = path.join(dataDir, "README.md");

        await Promise.all([
            writeFile(jsonFilePath, indexSerializer(json)),
            writeFile(markdownFilePath, markdown),
            writeFile(categoriesFilePath, categoriesSerializer(categories)),
        ]);
    }
}
