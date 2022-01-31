import type { Exporter } from "../../types/exporter-types";
import { ExporterAbstract } from "../exporter.abstract";

export class SchemaExporter extends ExporterAbstract implements Exporter {
    export(dataDir: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
