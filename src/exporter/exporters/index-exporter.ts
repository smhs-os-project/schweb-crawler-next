import flatstr from "flatstr";
import path from "path";
import { indexSerializer } from "../serializer";
import { ExporterAbstract } from "../exporter.abstract";
import type { AnnouncementIndex } from "../../types/announcement-index";
import type {
    CategoriesResponse,
    IndexResponse,
} from "../../types/exported-endpoint";
import type { Exporter } from "../../types/exporter-types";
import { writeFile } from "../../utils/file";

export class IndexExporter extends ExporterAbstract implements Exporter {
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
        return {
            updateAt: new Date().toISOString(),
            data: index,
        };
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

## 公告一覽`;

        for (const [category, announcements] of Object.entries(index)) {
            buf += `### ${category}\n`;

            for (const announcement of announcements) {
                buf += `- [${announcement.date} / ${announcement.title}](./announcements/${announcement.id}.md)`;
            }
        }

        return flatstr(buf);
    }

    /**
     * 產生可取用的分類清單 API 回應
     *
     * @param index 使用 `indexer()` 產生的索引。
     */
    async generateCategoryJson(
        index: AnnouncementIndex
    ): Promise<CategoriesResponse> {
        return {
            updateAt: new Date().toISOString(),
            data: Object.keys(index),
        };
    }

    async export(dataDir: string): Promise<void> {
        const index = await this.indexer();

        const json = this.generateJson(index);
        const markdown = this.generateMarkdown(index);

        const jsonFilePath = path.join(dataDir, "index.json");
        const categoriesFilePath = path.join(dataDir, "categories.json");
        const markdownFilePath = path.join(dataDir, "README.md");

        await Promise.all([
            writeFile(jsonFilePath, indexSerializer(json)),
            writeFile(markdownFilePath, markdown),
            writeFile(categoriesFilePath, markdown),
        ]);
    }
}
