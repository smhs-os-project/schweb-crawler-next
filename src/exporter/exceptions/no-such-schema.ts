import type { AjvSchema } from "../../types/ajv-schema";

export class NoSuchSchema extends Error {
    constructor(public readonly schema: AjvSchema) {
        super(`INTERNAL ERROR: No such schema: ${schema}`);
        this.name = NoSuchSchema.name;
    }
}
