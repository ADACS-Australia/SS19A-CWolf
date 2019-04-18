var dependencies = [ './templates.js', './classes.js', './spectrumX'];
for (var i = 0; i < dependencies.length; i++) {
    require(dependencies[i])();
}
var $q = require('q');
var path = require('path');
var fs = require('fs');
var appPath = __dirname;
eval(fs.readFileSync(path.join(appPath, "./extension.js")) + '');
var ProgressBar = require('progress');
var green = '\u001b[42m \u001b[0m';
var red = '\u001b[41m \u001b[0m';
var p = null, s = null, t = null, r = null, fl = null, data = null, global = null, consumer = null;

function init(workers, log, argv) {
    data = {
        fits: [],
        types: [],
        fitsFileName: null,
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
    var fileData = fs.readFileSync(filename);
    var qq = $q.defer();
    var startTime = new Date();
    debug("Processing file " + filename);
    s.setPacer(new ProgressBar('        Analysing spectra  [:bar] :percent (:current/:total) :elapseds :etas', {
        complete: green,
        incomplete: red,
        total: 30
    }));
    s.setFinishedCallback(function () {
        debug("Getting results");
        var values = r.getResultsCSV();
        var num = s.data.spectra.length;
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
        var endTime = new Date();
        var elapsed = (endTime - startTime) / 1000;
        debug("File processing took " + elapsed + " seconds, " + (num / elapsed).toFixed(2) + " spectra per second");
    });
    fl.setFilename(filename, fileData);
    consumer.consume(fl,s).then(function(spectraList) {
        var jsonfilename = filename.replace(new RegExp('.fits' + '$'), '.json');
        var spectrum = spectraList[0];
        var spectrumXdict = {};
        spectrumXdict["wavelength"] = spectrum.lambda;
        spectrumXdict["intensity"] = spectrum.intensity;
        spectrumXdict["variance"] = spectrum.variance;
        spectrumXdict["sky"] = spectrum.sky;
        spectrumXdict["dohelio"] = spectrum.helio!=null;
        spectrumXdict["docmb"] = spectrum.cmb!=null;

        spectrumXdict["properties"] = {};
        spectrumXdict["properties"]["id"] = spectrum.id;
        spectrumXdict["properties"]["name"] = spectrum.name;
        spectrumXdict["properties"]["type"] = spectrum.type;
        spectrumXdict["properties"]["ra"] = spectrum.ra;
        spectrumXdict["properties"]["dec"] = spectrum.dec;
        spectrumXdict["properties"]["magnitude"] = spectrum.magnitude;
        spectrumXdict["properties"]["latitude"] = spectrum.latitude;
        spectrumXdict["properties"]["longitude"] = spectrum.longitude;
        spectrumXdict["properties"]["altitude"] = spectrum.altitude;
        spectrumXdict["properties"]["juliandate"] = spectrum.juliandate;
        spectrumXdict["properties"]["epoch"] = spectrum.epoch;
        spectrumXdict["properties"]["radecsys"] = spectrum.radecsys;

        var spectrumX = new SpectrumX(spectrum.name);
        spectrumX.fromDictionary(spectrumXdict);
        //console.log("===================!!!!!!!!!!!! SAVE "+Object.getOwnPropertyNames(spectrum))
        //spectrumX.saveasJSON(jsonfilename);
    });

    debug("File loaded");
    return qq.promise;
}

function runJSONFile(filename, outputFile, debug, consoleOutput) {

    consoleOutput = defaultFor(consoleOutput, true);
    //consoleOutput = true;
    var fileData = fs.readFileSync(filename);
    var qq = $q.defer();
    var startTime = new Date();
    debug("Processing file " + filename);
    s.setPacer(new ProgressBar('        Analysing spectra  [:bar] :percent (:current/:total) :elapseds :etas', {
        complete: green,
        incomplete: red,
        total: 30
    }));
    s.setFinishedCallback(function () {
        debug("Getting results");
        var values = r.getResultsCSV();
        var num = s.data.spectra.length;
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
        var endTime = new Date();
        var elapsed = (endTime - startTime) / 1000;
        debug("File processing took " + elapsed + " seconds, " + (num / elapsed).toFixed(2) + " spectra per second");
    });
    var spectrumx = new SpectrumX("asfile");
    spectrumx.fromJSON(filename);
    consumer.consume(spectrumx,s).then(function(spectraList) {
        //console.log("consumed");
    });

    return qq.promise;
}

var struct = {
    init: init,
    runFitsFile: runFitsFile,
    runJSONFile: runJSONFile
};
module.exports = struct;
