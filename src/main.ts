// This is the main Node.js source code file of your actor.
// It is referenced from the "scripts" section of the package.json file,
// so that it can be started by running "npm start".

// Include Apify SDK. For more information, see https://sdk.apify.com/
import Apify, { CheerioHandlePage } from "apify";
import {
    getAnnouncements,
    getCategoryTitle,
    getSpecialModules,
} from "./parser";
import { handleRootPageFunction } from "./scrapers/root";
import { PageType, UserData } from "./types";

const { log, enqueueLinks } = Apify.utils;

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

    const requestQueue = await Apify.openRequestQueue();
    await requestQueue.addRequest({
        url: configuration.smhsUrl,
    });

    const handlePageFunction: CheerioHandlePage = async (ctx) => {
        const userData = ctx.request.userData as UserData;

        userData.requestQueue = requestQueue;
        userData.type = userData.type ?? PageType.Root;

        switch (userData.type) {
            case PageType.Root:
                // Deepcopy a context to prevent being contaminated.
                handleRootPageFunction(structuredClone(ctx));
                break;
            default:
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
});
