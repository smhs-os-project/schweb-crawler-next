import type { Dataset } from "apify";
import type { Exporter } from "../types/exporter-types";

export abstract class ExporterAbstract implements Exporter {
    constructor(protected readonly announcementDataset: Dataset) {}

    abstract export(dataDir: string): Promise<void>;
}
