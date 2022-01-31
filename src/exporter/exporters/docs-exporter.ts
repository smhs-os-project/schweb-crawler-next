import { join } from "path";
import type { Exporter } from "../../types/exporter-types";
import { copyFile } from "../../utils/file";
import { ExporterAbstract } from "../exporter.abstract";

export class DocsExporter extends ExporterAbstract implements Exporter {
    async export(dataDir: string): Promise<void> {
        await copyFile(join(__dirname, "..", "data", "api-help.md"), dataDir);
    }
}
