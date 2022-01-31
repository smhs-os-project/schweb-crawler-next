import type { AnnouncementEntry } from "./announcement-entry";
import type {
    AnnouncementIndex,
    AvailableCategories,
} from "./announcement-index";

/**
 * Endpoint 應該回應的資料格式
 */
export interface EndpointResponse<T> {
    /**
     * 資料更新時間
     *
     * 是 Unix 時間戳記。
     */
    updateAt: string;
    /**
     * 主資料
     */
    data: T;
}

/**
 * 一個完整的公告資料 API 回應
 */
export type AnnouncementEntryResponse = EndpointResponse<AnnouncementEntry>;

/**
 * 公告索引 API 回應
 */
export type IndexResponse = EndpointResponse<AnnouncementIndex>;

/**
 * 可取用的分類清單 API 回應
 */
export type AvailableCategoriesResponse = EndpointResponse<AvailableCategories>;
