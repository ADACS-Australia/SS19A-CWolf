// module = {};
// node = false;
// const require = function(name) {return function() {}};
// importScripts('regression.js', 'extension.js',  'spectralLines.js', 'methods.js', 'helio.js', 'templates.js', 'classes.js', 'dsp.js', 'config.js', 'workerMethods.js');



import {handleEvent} from "./workerMethods";

/**
 * We need to add an event listener that listens for processing requests from the ProcessorService
 */
addEventListener('message', (event) => {
    const data = event.data;
    const result = handleEvent(data);
    postMessage(result);
});
