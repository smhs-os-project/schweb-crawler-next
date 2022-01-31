import Ajv from "ajv";
import type { JSONSchemaType } from "ajv";
import type { ValidateFunction } from "ajv/dist/types";
import announcementSchema from "./data/schemas/announcement.json";
import indexSchema from "./data/schemas/index.json";
import categoriesSchema from "./data/schemas/categories.json";
import { AjvSchema } from "../types/ajv-schema";
import { NoSuchSchema } from "./exceptions/no-such-schema";

/**
 * 包含 AjvSchema 定義之 schema 的 Ajv 實體
 */
export const ajv = new Ajv();

// FOR DEVELOPERS: 若有更改 type，則需呼叫 `yarn build:schema`
// 手動產生 schema 方能使之產生正確檔案。
export const announcementSerializer = ajv.compileSerializer(
    announcementSchema,
    AjvSchema.announcement
);
ajv.addSchema(indexSchema, AjvSchema.index);
ajv.addSchema(categoriesSchema, AjvSchema.categories);

/**
 * 取得 ajv 實體的 Schema
 *
 * @param schema 定義於 AjvSchema 的 schema。
 */
export function getSchema<T>(
    schema: AjvSchema
): ValidateFunction<JSONSchemaType<T>> {
    const validatationFunction = ajv.getSchema(schema);
    ajv.compile;

    if (!validatationFunction) throw new NoSuchSchema(schema);
    return validatationFunction as unknown as ValidateFunction<
        JSONSchemaType<T>
    >;
}
