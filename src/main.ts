// This is the main Node.js source code file of your actor.
// It is referenced from the "scripts" section of the package.json file,
// so that it can be started by running "npm start".

// Include Apify SDK. For more information, see https://sdk.apify.com/
import Apify, { CheerioHandlePage } from "apify";
import { constructIndex } from "./exporter";
import {
    handleAnnouncementPageFunction,
    handleRootPageFunction,
} from "./scrapers";
import { UserData, PageType, ScraperContext } from "./types";

const {
    utils: { log },
} = Apify;
interface Schema {
    smhsUrl: string;
}

Apify.main(async () => {
    // Get input of the actor.
    // If you'd like to have your input checked and have Apify display
    // a user interface for it, add INPUT_SCHEMA.json file to your actor.
    // For more information, see https://apify.com/docs/actor/input-schema

    // Open a named dataset
    // const announcementsDataset = await Apify.openDataset("announcements");

    const configuration = (await Apify.getInput()) as Schema;

    /**
     * 抓下的所有公告。
     */
    const announcementsDataset = await Apify.openDataset("announcements");

    const requestQueue = await Apify.openRequestQueue();
    await requestQueue.addRequest({
        url: configuration.smhsUrl,
    });

    const handlePageFunction: CheerioHandlePage = async (requestInputs) => {
        const userData = requestInputs.request.userData as UserData;
        const scraperContext: ScraperContext = {
            requestQueue,
            datasets: {
                announcements: announcementsDataset,
            },
        };

        userData.type = userData.type ?? PageType.Root;

        log.debug(`Received a ${userData.type} event.`);

        switch (userData.type) {
            case PageType.Root:
                await handleRootPageFunction(scraperContext, requestInputs);
                break;
            case PageType.Announcement:
                await handleAnnouncementPageFunction(
                    scraperContext,
                    requestInputs
                );
                break;
            default:
                log.warning(`invalid page type: ${userData.type}`);
                break;
        }
    };

    // Set up the crawler, passing a single options object as an argument.
    const crawler = new Apify.CheerioCrawler({
        requestQueue,
        handlePageFunction,
        ignoreSslErrors: true,
    });

    await crawler.run();

    log.info("Creating index and announcement file...");
    await constructIndex(announcementsDataset);
    log.info("Created successfully.");
});
