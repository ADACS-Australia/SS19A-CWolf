import {handleEvent} from "./workerMethods";

/**
 * We need to add an event listener that listens for processing requests from the ProcessorService
 */
process.on('message', function(event) {
    const result = handleEvent(event);
    process.send({data: result});
});
