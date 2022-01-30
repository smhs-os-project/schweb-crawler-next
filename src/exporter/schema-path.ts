import { AjvSchema } from "../types/ajv-schema";

/**
 * 要放入輸出 JSON 檔 `$schema` 部分的 Web URI。
 */
export const schemaURI: Record<AjvSchema, string> = {
    [AjvSchema.announcement]:
        "https://api.schweb.pan93.com/schemas/announcement.json",
    [AjvSchema.categories]:
        "https://api.schweb.pan93.com/schemas/categories.json",
    [AjvSchema.index]: "https://api.schweb.pan93.com/data/schemas/index.json",
} as const;
