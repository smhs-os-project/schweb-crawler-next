import { createGenerator } from "ts-json-schema-generator";
import type { Config } from "ts-json-schema-generator";
import fsPromises from "fs/promises";
import { join } from "path";

const tsconfigDir = join(__dirname, "..", "..", "tsconfig.json");
const typesFile = join(__dirname, "..", "types", "exported-endpoint.ts");
const schemasDir = join(__dirname, "..", "exporter", "data", "schemas");

const baseConfig: Config = {
    path: typesFile,
    tsconfig: tsconfigDir,
    jsDoc: "extended",
};

const configs: { type: string; outputPath: string }[] = [
    {
        type: "AnnouncementEntryResponse",
        outputPath: join(schemasDir, "announcement.json"),
    },
    {
        type: "IndexResponse",
        outputPath: join(schemasDir, "index.json"),
    },
    {
        type: "AvailableCategoriesResponse",
        outputPath: join(schemasDir, "categories.json"),
    },
];

async function main() {
    const filePromisesQueue: Promise<void>[] = [];
    const generator = createGenerator(baseConfig);

    for (const config of configs) {
        const schema = generator.createSchema(config.type);
        const schemaString = JSON.stringify(schema, null, 4);

        filePromisesQueue.push(
            fsPromises.writeFile(config.outputPath, schemaString)
        );
    }

    await Promise.all(filePromisesQueue);
}

main();
