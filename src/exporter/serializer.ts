import Ajv from "ajv";
import announcementSchema from "./data/schemas/announcement.json";
import indexSchema from "./data/schemas/index.json";
import categoriesSchema from "./data/schemas/categories.json";
import { AjvSchema } from "../types/ajv-schema";

export const ajv = new Ajv();

// FOR DEVELOPERS: 若有更改 type，則需呼叫 `yarn build:schema`
// 手動產生 schema 方能使之產生正確檔案。
ajv.addSchema(announcementSchema, AjvSchema.announcement);
ajv.addSchema(indexSchema, AjvSchema.index);
ajv.addSchema(categoriesSchema, AjvSchema.categories);
