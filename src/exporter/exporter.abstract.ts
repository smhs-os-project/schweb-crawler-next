import type { AnnouncementEntry } from "../types/announcement-entry";
import type { Exporter } from "../types/exporter-types";
import type { TypedDataset } from "../types/typed-dataset";
import type { AnnouncementUUIDGenerator } from "../utils/announce/uuid-generator";

export abstract class ExporterAbstract implements Exporter {
    constructor(
        protected readonly announcementDataset: TypedDataset<AnnouncementEntry>,
        protected readonly uuidGenerator: AnnouncementUUIDGenerator
    ) {}

    abstract export(dataDir: string): Promise<void>;
}
