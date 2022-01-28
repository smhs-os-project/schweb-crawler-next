import { Dataset, openKeyValueStore } from "apify";
import { AnnouncementEntry } from "./types";

export async function createIndex(dataset: Dataset): Promise<void> {
    const store = await openKeyValueStore("index-store");
    const indexRecord: Record<
        string,
        { id: string; title: string; date: string }[]
    > = {};

    await dataset.forEach(async (_item, index) => {
        const item = _item as AnnouncementEntry;

        indexRecord[item.category] = indexRecord[item.category] ?? [];
        indexRecord[item.category].push({
            id: index.toString().padStart(9, "0"),
            title: item.title,
            date: item.date,
        });
    });
    await Promise.all([
        store.setValue("available_category", Object.keys(indexRecord)),
        store.setValue("index", indexRecord),
    ]);
}
