import type { CheerioHandlePageInputs } from "apify";
import minifyHtml from "@minify-html/js";
import sanitizeHtml from "sanitize-html";
import { utils } from "apify";
import type { Handler } from "../../types/router-types";
import { HandlerAbstract } from "../handler.abstract";
import type { AnnouncementAttachment } from "../../types/announcement-entry";
import { SCHOOL_ROOT_HOMEPAGE } from "../../consts";
import { InvalidUUID } from "./exceptions/invalid-uuid";

const minifyConfiguration = minifyHtml.createConfiguration({});
const { log } = utils;

export class AnnouncementHandler extends HandlerAbstract implements Handler {
    protected async contentHandler({
        $,
        uuid,
    }: {
        $: cheerio.Root;
        uuid: string;
    }): Promise<void> {
        const content = getAnnouncementContent($);
        this.emitter.emit("patchAnnouncementContent", uuid, { content });
    }

    protected async attachmentsHandler({
        $,
        uuid,
    }: {
        $: cheerio.Root;
        uuid: string;
    }): Promise<void> {
        const attachments = getAnnouncementAttachments($);
        this.emitter.emit("patchAnnouncementContent", uuid, { attachments });
    }

    async process({ $: _$, request }: CheerioHandlePageInputs): Promise<void> {
        const $ = _$ as cheerio.Root;
        const { uuid } = request.userData;
        log.info(`Processing announcement: ${uuid}`);

        if (!(typeof uuid === "string")) {
            throw new InvalidUUID(uuid);
        }

        await Promise.all([
            this.contentHandler({ $, uuid }),
            this.attachmentsHandler({ $, uuid }),
        ]);
    }
}

/**
 * 解析並清理公告內頁中的公告內文。
 * @param $ 公告內頁
 * @returns 清理到只剩基本 HTML 元素的最小化 HTML 字串
 */
export function getAnnouncementContent($: cheerio.Root): string | null {
    const rawContent = $(".mcont").html();

    return (
        rawContent &&
        minifyHtml
            .minify(sanitizeHtml(rawContent), minifyConfiguration)
            .toString("utf-8")
    );
}

/**
 * 取得公告的所有附件
 *
 * @param $ 公告內頁
 * @returns 回傳 `AnnouncementAttachment`。
 * 其中的連結均已解析為 host 是校網的絕對連結。
 * 我們亦清理掉附件名稱中的「另開新視窗」文字。
 */
export function getAnnouncementAttachments(
    $: cheerio.Root
): AnnouncementAttachment[] {
    const $attachments = $(".mptattach a");

    const attachments: AnnouncementAttachment[] = [];

    for (const attachment of $attachments) {
        const rawName = $(attachment).attr("title");
        const uri = $(attachment).attr("href");

        if (rawName && uri) {
            const name = rawName.replace(/(?:\(|（)另開新視窗(?:\)|）)/, "");
            const { href } = new URL(uri, SCHOOL_ROOT_HOMEPAGE);

            attachments.push({ name, href });
        }
    }

    return attachments;
}
