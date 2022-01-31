import type { AnnouncementEntry } from "../types/announcement-entry";
import type { TypedDataset } from "../types/typed-dataset";
import type { AnnouncementUUIDGenerator } from "../utils/announce/uuid-generator";
import type { ExporterAbstract } from "./exporter.abstract";
import { Exporters } from "./exporters";

export type ExporterConsturctor = new (
    announcementDataset: TypedDataset<AnnouncementEntry>,
    uuidGenerator: AnnouncementUUIDGenerator
) => ExporterAbstract;

/**
 * Exporters 物件建構類別
 */
export class ExportersBuilder {
    private readonly exporters: ExporterAbstract[] = [];

    private announcementDataset: TypedDataset<AnnouncementEntry> | null = null;

    private uuidGenerator: AnnouncementUUIDGenerator | null = null;

    setDataset(dataset: TypedDataset<AnnouncementEntry>): this {
        this.announcementDataset = dataset;
        return this;
    }

    setUUIDGenerator(uuidGenerator: AnnouncementUUIDGenerator): this {
        this.uuidGenerator = uuidGenerator;
        return this;
    }

    addExporter<T extends ExporterConsturctor>(Exporter: T): this {
        if (!this.announcementDataset) throw new Error("Dataset is not set");
        if (!this.uuidGenerator) throw new Error("UUID Generator is not set");

        this.exporters.push(
            new Exporter(this.announcementDataset, this.uuidGenerator)
        );
        return this;
    }

    build(): Exporters {
        return new Exporters(this.exporters);
    }
}
