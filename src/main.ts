import { join } from "path";

import Apify from "apify";
import type TypedEventEmitter from "typed-emitter";
import { PageType } from "./types/router-types";

import { AnnouncementDatabase } from "./database/announcement";
import { AnnouncementUUIDGenerator } from "./utils/announce/uuid-generator";
import { registerRequestQueue } from "./database/request-queue";
import { newEventEmitter } from "./event/emitter";

import { RouterBuilder } from "./routes/router.builder";
import { ExportersBuilder } from "./exporter/exporters.builder";

import { AnnouncementHandler } from "./routes/handlers/announcement";
import { HomepageHandler } from "./routes/handlers/homepage";

import { AnnouncementExporter } from "./exporter/exporters/announcement-exporter";
import { DocsExporter } from "./exporter/exporters/docs-exporter";
import { IndexExporter } from "./exporter/exporters/index-exporter";

import type { AnnouncementEventMap } from "./database/announcement";
import type { AnnouncementEntry } from "./types/announcement-entry";
import type { TypedDataset } from "./types/typed-dataset";
import type { AvailableEvents } from "./event/emitter";

const {
    utils: { log },
} = Apify;

interface Schema {
    smhsUrl: string;
}

const DATA_DIR = join(__dirname, "..", "data");

async function constructAnnouncementDatabase(
    uuidGenerator: AnnouncementUUIDGenerator,
    eventEmitter: TypedEventEmitter<AnnouncementEventMap>
) {
    const announcementDataset = await Apify.openDataset("announcements");

    return new AnnouncementDatabase(
        // FIXME: validation
        announcementDataset as TypedDataset<AnnouncementEntry>,
        uuidGenerator,
        eventEmitter
    );
}

async function constructRequestQueue(
    eventEmitter: TypedEventEmitter<AnnouncementEventMap>
) {
    const requestQueue = await Apify.openRequestQueue();
    registerRequestQueue(requestQueue, eventEmitter);

    return requestQueue;
}

function constructRouter(emitter: TypedEventEmitter<AvailableEvents>) {
    return new RouterBuilder()
        .setEmitter(emitter)
        .addRoute(PageType.Homepage, HomepageHandler)
        .addRoute(PageType.Announcement, AnnouncementHandler)
        .build();
}

function constructExporters(
    uuidGenerator: AnnouncementUUIDGenerator,
    dataset: TypedDataset<AnnouncementEntry>
) {
    return new ExportersBuilder()
        .setDataset(dataset)
        .setUUIDGenerator(uuidGenerator)
        .addExporter(IndexExporter)
        .addExporter(DocsExporter)
        .addExporter(AnnouncementExporter)
        .build();
}

async function main() {
    /**
     * Initialization
     */
    log.debug("initiation: constructing basic components");
    const eventEmitter = newEventEmitter();
    const uuidGenerator = new AnnouncementUUIDGenerator();

    log.debug(
        "initiation: scheduling the construction of announcement database [Init-Task-1]"
    );
    const dbConstructionSubmission = constructAnnouncementDatabase(
        uuidGenerator,
        eventEmitter
    );
    log.debug("initiation: scheduling the construction of request queue");
    const requestQueueConstructionSubmission =
        constructRequestQueue(eventEmitter);
    log.debug("initiation: scheduling getting the input");
    const configurationSubmission = (await Apify.getInput()) as Schema;

    log.debug("initiation: running the scheduled tasks parallelly");
    const [announcementDatabase, requestQueue, configuration] =
        await Promise.all([
            dbConstructionSubmission,
            requestQueueConstructionSubmission,
            configurationSubmission,
        ]);

    await requestQueue.addRequest({
        url: configuration.smhsUrl,
        uniqueKey: `homepage@${Date.now()}`,
        userData: {
            type: PageType.Homepage,
        },
    });

    log.debug("initiation: constructing router, crawler and exporter");
    const router = constructRouter(eventEmitter);
    const exporters = constructExporters(
        uuidGenerator,
        announcementDatabase.Dataset
    );

    const crawler = new Apify.CheerioCrawler({
        requestQueue,
        handlePageFunction: (inputs) => router.handle(inputs),
        ignoreSslErrors: true,
    });

    log.info("Loading database");
    await announcementDatabase.load();

    log.info("Running crawler");
    await crawler.run();

    log.info("Syncing database");
    await announcementDatabase.sync();

    log.info("Exporting database");
    await exporters.export(DATA_DIR);

    log.info("All done!");
}

Apify.main(main);
