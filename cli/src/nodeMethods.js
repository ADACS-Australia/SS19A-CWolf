import fs from 'fs';
import * as $q from 'q';
import ProgressBar from 'progress';
import ProcessorManager from "../../src/Lib/ProcessorManager";
import SpectraManager from "../../src/Lib/SpectraManager";
import {TemplateManager} from "../../src/Lib/TemplateManager";
import ResultsGenerator from "../../src/Lib/ResultsGenerator";
import FitsFileLoader from "../../src/Lib/FitsFileLoader";
import SpectrumConsumer from "../../src/Lib/SpectrumConsumer";
import {defaultFor} from "../../src/Utils/methods";
import SpectrumJSONProvider from "../../src/Lib/SpectrumJSONProvider";

const green = '\u001b[42m \u001b[0m';
const red = '\u001b[41m \u001b[0m';
let p = null, s = null, t = null, r = null, fl = null, data = null, global = null, consumer = null;

function init(workers, log, argv) {
    data = {
        types: [],
        spectra: [],
        spectraHash: {},
        history: []
    };
    global = {data: data};
    p = new ProcessorManager(true);
    s = new SpectraManager(data, log);
    t = new TemplateManager(false);
    r = new ResultsGenerator(data, t, false);
    fl = new FitsFileLoader($q, global, log, p, r, true);

    consumer = new SpectrumConsumer($q, global, p, r, true);
    consumer.subscribeToInput(s.setSpectra, s);
    consumer.subscribeToInput(p.addSpectraListToQueue, p);
    p.setNode();
    p.setWorkers(workers, $q);
    s.setAssignAutoQOPs(argv["assignAutoQOPs"]);
    r.setNumAutomatic(argv["numAutomatic"]);
    p.setProcessTogether(argv["processTogether"]);
    p.setInactiveTemplateCallback(function () {
        return argv['disabledTemplates']
    });
    p.setProcessedCallback(s.setProcessedResults, s);
    p.setMatchedCallback(s.setMatchedResultsNode, s);
}

function runFitsFile(filename, outputFile, debug, consoleOutput) {
    consoleOutput = defaultFor(consoleOutput, true);
    const fileData = fs.readFileSync(filename);
    const qq = $q.defer();
    const startTime = new Date();
    debug("Processing file " + filename);
    s.setPacer(new ProgressBar('        Analysing spectra  [:bar] :percent (:current/:total) :elapseds :etas', {
        complete: green,
        incomplete: red,
        total: 30
    }));
    s.setFinishedCallback(function () {
        const values = r.getResultsCSV("cli", filename);
        const num = s.data.spectra.length;
        if (consoleOutput) {
            console.log(values);
        }
        if (outputFile) {
            fs.writeFile(outputFile, values, function (err) {
                if (err) {
                    return console.error(err);
                }
                debug("File saved to " + outputFile);
                qq.resolve(num);
            });
        } else {
            qq.resolve(r.getSpectraWithResults());
        }
        const endTime = new Date();
        const elapsed = (endTime - startTime) / 1000;
        debug("File processing took " + elapsed + " seconds, " + (num / elapsed).toFixed(2) + " spectra per second");
    });
    fl.setFilename(filename, fileData);
    consumer.consume(fl,s).then(function(spectraList) {
       
    });

    return qq.promise;
}

function runJSONFile(filename, outputFile, debug, consoleOutput) {

    consoleOutput = defaultFor(consoleOutput, true);
    //consoleOutput = true;
    const fileData = fs.readFileSync(filename);
    const qq = $q.defer();
    const startTime = new Date();
    debug("Processing file " + filename);
    s.setPacer(new ProgressBar('        Analysing spectra  [:bar] :percent (:current/:total) :elapseds :etas', {
        complete: green,
        incomplete: red,
        total: 30
    }));
    s.setFinishedCallback(function () {
        const values = r.getResultsCSV("cli", filename);
        const num = s.data.spectra.length;
        if (consoleOutput) {
            console.log(values);
        }
        if (outputFile) {
            fs.writeFile(outputFile, values, function (err) {
                if (err) {
                    return console.error(err);
                }
                debug("File saved to " + outputFile);
                qq.resolve(num);
            });
        } else {
            qq.resolve(r.getSpectraWithResults());
        }
        const endTime = new Date();
        const elapsed = (endTime - startTime) / 1000;
        debug("File processing took " + elapsed + " seconds, " + (num / elapsed).toFixed(2) + " spectra per second");
    });
    const spectrumProvider = new SpectrumJSONProvider();
    spectrumProvider.fromJSON(filename);
    r.setHelio(spectrumProvider.getDoHelio());
    r.setCMB(spectrumProvider.getDoCMB());
    consumer.consume(spectrumProvider,s).then(function(spectraList) {
        //console.log("consumed");
    });

    return qq.promise;
}

const struct = {
    init: init,
    runFitsFile: runFitsFile,
    runJSONFile: runJSONFile
};

export default struct;
