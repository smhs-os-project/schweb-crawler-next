import { Dataset } from "apify";
import fs, { promises as fsPromises } from "fs";
import path from "path";
import { v5 as uuidv5 } from "uuid";
import copy from "recursive-copy";
import { AnnouncementEntry, AnnouncementIndexEntry } from "./types";

const categoryNamespace = "443de3b4-6ca5-49e4-bf97-f31373ad221e";
const categoryUUIDCache: Map<string, string> = new Map();
const dataDirectory = path.join(__dirname, "..", "data");
const announcementsDirectory = path.join(dataDirectory, "announcements");
const apiHelpFile = path.join(__dirname, "exporter", "api-help.md");
const schemasSrcDir = path.join(__dirname, "exporter", "schemas");

/**
 * 可取用的 JSON schema。
 */
enum Schema {
    Announcement = "announcement",
    AvailableCategory = "available_category",
    Index = "index",
}

/**
 * 對應 Schema 的 JSON schemas 連結。
 */
const schemas: Record<Schema, string> = {
    [Schema.Announcement]:
        "https://api.schweb.pan93.com/schemas/announcement.json",
    [Schema.AvailableCategory]:
        "https://api.schweb.pan93.com/schemas/available_category.json",
    [Schema.Index]:
        "https://api.schweb.pan93.com/schemas/available_category.json",
};

/**
 * 取得指定分類的唯一 UUID。
 *
 * @param category 分類名稱。
 */
function getCategoryUUID(category: string): string {
    const cachedUUID = categoryUUIDCache.get(category);

    if (cachedUUID) {
        return cachedUUID;
    }

    const uuid = uuidv5(category, categoryNamespace);
    categoryUUIDCache.set(category, uuid);
    return uuid;
}

/**
 * 取得指定公告項目的唯一 UUID。
 */
function getIdentifier({ category, title, date }: AnnouncementEntry): string {
    const namespace = getCategoryUUID(category);
    const rawIdentifier = `${title} @ ${date}`;
    const uuid = uuidv5(rawIdentifier, namespace);

    return uuid;
}

/**
 * 產生公告的可讀版 Markdown 檔案。
 */
function generateAnnouncementMarkdown(announcement: AnnouncementEntry) {
    const { category, title, date, content, href, attachments } = announcement;

    return `\
---
category: ${category}
title: ${title}
date: ${date}
href: ${href}
---

# [${category}] ${title}
發布日期：${date}

${content}

## 附件
${attachments
    .map(
        ({ name: attachmentName, href: attachmentHref }) =>
            `- [${attachmentName}](${attachmentHref})`
    )
    .join("\n")}
`;
}

/**
 * 產生公告索引的可讀版 Markdown 檔案。
 */
function generateAnnouncementIndexMarkdown(
    announcementCategoryEntries: Record<string, AnnouncementIndexEntry[]>
) {
    const buf = [
        `\
# SMHS 公告資料庫

這個公告資料庫可以在 SMHS 校網斷線時讓您查閱公告（目前不包含附件）。
您亦可以撰寫自己的前端網頁對接本資料，詳情見 [api-help.md](./api-help.md)。

## 公告一覽`,
    ];

    for (const [category, announcements] of Object.entries(
        announcementCategoryEntries
    )) {
        buf.push(`### ${category}`);

        for (const announcement of announcements) {
            buf.push(
                `- [${announcement.date} / ${announcement.title}](./announcements/${announcement.id}.md)`
            );
        }
    }

    return buf.join("\n");
}

/**
 * 假如檔案所在的資料夾不存在，則自動建立。
 */
async function createDirOfFile(file: string) {
    const dir = path.dirname(file);

    if (!fs.existsSync(dir)) {
        await fsPromises.mkdir(dir, { recursive: true });
    }
}

/**
 * 寫入檔案。假如資料夾不存在，則自動建立。
 * @param fileToWriteTo 要寫入的檔案路徑。
 * @param content 檔案內容。
 */
async function writeFile(
    fileToWriteTo: string,
    content: Buffer | string
): Promise<void> {
    await createDirOfFile(fileToWriteTo);
    await fsPromises.writeFile(fileToWriteTo, content);
}

/**
 * 複製檔案。假如資料夾不存在，則自動建立。
 * @param src 來源位置。
 * @param dst 目標位置。
 */
async function copyFile(src: string, dst: string): Promise<void> {
    await createDirOfFile(dst);
    await copy(src, dst);
}

/**
 * 寫入公告檔案（包含 Markdown 可讀版）。
 *
 * @param announcement 公告項目
 */
export async function writeAnnouncement(
    announcement: AnnouncementEntry
): Promise<void> {
    const identifier = getIdentifier(announcement);
    const fileToWriteTo = path.join(announcementsDirectory, `${identifier}`);

    await Promise.all([
        writeFile(`${fileToWriteTo}.json`, JSON.stringify(announcement)),
        writeFile(
            `${fileToWriteTo}.md`,
            generateAnnouncementMarkdown(announcement)
        ),
    ]);
}

/**
 * 封裝資料。
 *
 * 「封裝」會在資料中加入 JSON Schema 以及時間戳，
 * 並將原有的資料移動到 `.data` 裡面。
 *
 * @param data 原始資料。
 */
export function packData<T>(
    schema: Schema,
    data: T
): { $schema: string; updateAt: number; data: T } {
    return {
        $schema: schemas[schema],
        updateAt: Date.now(),
        data,
    };
}

/**
 * 建構索引檔案。
 *
 * @param announcements 公告項目
 */
export async function constructIndex(announcements: Dataset): Promise<void> {
    const index: Record<string, AnnouncementIndexEntry[]> = {};

    await Promise.all([
        announcements.forEach(async (_announcement) => {
            const announcement = _announcement as AnnouncementEntry;
            index[announcement.category] = index[announcement.category] ?? [];
            index[announcement.category].push({
                id: getIdentifier(announcement),
                title: announcement.title,
                date: announcement.date,
                href: announcement.href,
            });
        }),
        copyFile(apiHelpFile, path.join(dataDirectory, "api-help.md")),
    ]);

    const availableCategoryFile = path.join(
        dataDirectory,
        "available_category.json"
    );
    const indexFile = path.join(dataDirectory, "index.json");
    const indexMarkdown = path.join(dataDirectory, "index.md");

    await Promise.all([
        writeFile(
            availableCategoryFile,
            JSON.stringify(
                packData(Schema.AvailableCategory, Object.keys(index))
            )
        ),
        writeFile(indexFile, JSON.stringify(packData(Schema.Index, index))),
        writeFile(indexMarkdown, generateAnnouncementIndexMarkdown(index)),
    ]);
}

/**
 * 複製 Schema 定義到 data directory。
 */
export async function copySchemas(): Promise<void> {
    await copyFile(schemasSrcDir, dataDirectory);
}
