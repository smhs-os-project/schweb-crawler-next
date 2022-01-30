import type { Dataset } from "apify";
import type { ExporterAbstract } from "./exporter.abstract";
import { Exporters } from "./exporters";

export type ExporterConsturctor = new (
    announcementDataset: Dataset
) => ExporterAbstract;

/**
 * Exporters 物件建構類別
 */
export class ExportersBuilder {
    private readonly exporters: ExporterAbstract[] = [];

    private announcementDataset: Dataset | null = null;

    setDataset(dataset: Dataset): this {
        this.announcementDataset = dataset;
        return this;
    }

    addExporter<T extends ExporterConsturctor>(Exporter: T): this {
        if (!this.announcementDataset) throw new Error("Dataset is not set");

        this.exporters.push(new Exporter(this.announcementDataset));
        return this;
    }

    build(): Exporters {
        return new Exporters(this.exporters);
    }
}
