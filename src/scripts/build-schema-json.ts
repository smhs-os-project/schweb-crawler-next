import { readdir, readFile, writeFile } from "fs/promises";
import yaml from "yaml";
import { join } from "path";

const dest = join(__dirname, "..", "types", "schema");
const schemaDir = join(__dirname, "..", "..", "schema");

async function main() {
    const files = await readdir(schemaDir);
    await Promise.all(
        files.map(async (schemaFile) => {
            if (!schemaFile.endsWith(".yml")) return;

            const schema = await readFile(join(schemaDir, schemaFile));
            const data = yaml.parse(schema.toString("utf-8"));
            await writeFile(
                join(dest, schemaFile.replace(".yml", ".json")),
                JSON.stringify(data, null, 4)
            );
        })
    );
}

main();
