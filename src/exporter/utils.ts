import type { EndpointResponse } from "../types/exported-endpoint";

/**
 * 產生指定資料的 JSON 回應資料。
 *
 * @param data 要產生 JSON 回應的資料。
 */
export function generateEndpointResponse<T>(data: T): EndpointResponse<T> {
    return {
        updateAt: new Date().toISOString(),
        data,
    };
}
