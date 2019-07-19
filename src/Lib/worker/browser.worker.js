import {handleEvent} from "./workerMethods";

/**
 * We need to add an event listener that listens for processing requests from the ProcessorService
 */
addEventListener('message', (event) => {
    const data = event.data;
    const result = handleEvent(data);
    postMessage(result);
});
