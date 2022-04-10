import Ajv from "ajv/dist/jtd";
import announcementSchema from "../types/schema/announcement-entry-response.jtd.json";
import indexSchema from "../types/schema/index-response.jtd.json";
import categoriesSchema from "../types/schema/categories-response.jtd.json";

const ajv = new Ajv();

// FOR DEVELOPERS: 若有更改 type，則需更改 schema 並呼叫 `pnpm build:schema`
// 手動產生 schema 方能使之產生正確檔案。
//
// 假如測試通過，也請幫忙提交到 https://github.com/smhs-os-project/schweb-crawler-jtd

/**
 * Announcement serializer
 */
export const announcementSerializer = ajv.compileSerializer(announcementSchema);

/**
 * Index serializer
 */
export const indexSerializer = ajv.compileSerializer(indexSchema);

/**
 * Categories serializer
 */
export const categoriesSerializer = ajv.compileSerializer(categoriesSchema);
