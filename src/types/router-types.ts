import { CheerioHandlePageInputs } from "apify";

/**
 * 頁面類型。
 */
export enum PageType {
    /**
     * 首頁。
     */
    Root = "root",
    /**
     * 公告頁。
     */
    Announcement = "announcement",
    /**
     * 檔案（TODO）。
     */
    Files = "files",
}

/**
 * 一個路由處理常式應有的各項方法。
 */
export interface Handler {
    process(inputs: CheerioHandlePageInputs): Promise<void>;
}

/**
 * 一個請求的基本情境資料 (context)。
 */
export interface BasicUserData {
    /**
     * 本請求的頁面類型。
     */
    type: PageType;
}
