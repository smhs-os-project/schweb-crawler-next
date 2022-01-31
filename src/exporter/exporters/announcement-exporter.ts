import { join } from "path";
import type { AnnouncementEntry } from "../../types/announcement-entry";
import type { AnnouncementEntryResponse } from "../../types/exported-endpoint";
import type { Exporter } from "../../types/exporter-types";
import { writeFile } from "../../utils/file";
import { ExporterAbstract } from "../exporter.abstract";
import { announcementSerializer } from "../serializer";
import { generateEndpointResponse } from "../utils";

const ANNOUNCEMENT_DIR = "announcement" as const;

export class AnnouncementExporter extends ExporterAbstract implements Exporter {
    private generateJson(entry: AnnouncementEntry): AnnouncementEntryResponse {
        return generateEndpointResponse(entry);
    }

    private generateMarkdown({
        category,
        title,
        date,
        href,
        content,
        attachments,
    }: AnnouncementEntry): string {
        const headerMarkdown = `\
---
category: ${category}
title: ${title}
date: ${date}
href: ${href}
---

# [${category}] ${title}

發布日期：${date}`;
        const contentMarkdown = content ?? `請參閱 [連結](${href})`;
        const attachmentsMarkdown =
            attachments.length > 0
                ? `\
## 附件

${attachments
    .map((attachment) => `- [${attachment.name}](${attachment.href})`)
    .join("\n")}
`
                : "";

        return `${headerMarkdown}\n\n${contentMarkdown}\n\n${attachmentsMarkdown}`;
    }

    async export(dataDir: string): Promise<void> {
        const announcementDir = join(dataDir, ANNOUNCEMENT_DIR);

        await this.announcementDataset.forEach(async (announcementEntry) => {
            const id =
                this.uuidGenerator.generateAnnouncementUUID(announcementEntry);
            const json = this.generateJson(announcementEntry);
            const markdown = this.generateMarkdown(announcementEntry);

            const jsonFilePath = join(announcementDir, `${id}.json`);
            const markdownFilePath = join(announcementDir, `${id}.md`);

            const serializedJson = announcementSerializer(json);

            await Promise.all([
                writeFile(jsonFilePath, serializedJson),
                writeFile(markdownFilePath, markdown),
            ]);
        });
    }
}
