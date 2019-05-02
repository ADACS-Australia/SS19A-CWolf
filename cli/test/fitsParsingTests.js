import { expect } from "chai";
import commandLineArgs from 'command-line-args';

import defaults from '../src/autoConfig';
import {default as struct} from '../src/js/nodeMethods';
import { handleEvent } from '../src/Lib/worker/workerMethods'; 
import path from 'path';
import fs from 'fs';
import cluster from 'cluster';
import '../src/js/extension';
import minimist from 'minimist';
import os from 'os';
import * as $q from "q";
// iojs head script to run marz from a command line interface

var details = function(title,object) {
    console.log(title);
    for (var p in object) {
        console.log(" "+p+"="+object[p]);
    }
}

var debug = function (output) {
    if (debugFlag) {
        if (typeof output == "string") {
            console.log(output);
        } else {
            console.dir(output);
        }
    }
};

function getOutputFilename(fitsFile, argv) {
    var fname = argv["outFile"] || path.basename(fitsFile);
    var dname = argv['dir'] || path.dirname(fitsFile);
    if (!fname.endsWith(".mz")) {
        fname = fname.substring(0, fname.lastIndexOf('.')) + ".mz";
    }
    var outputFile = path.normalize(path.join(dname, fname));
    debug("Input file " + fitsFile + " output going to " + outputFile);
    return outputFile;
}

const optionDefinitions = [
    { name: 'spectrumFile', type: String, defaultOption: true},
    { name: 'outFile', type: String },
    { name: 'dir', type: String },
    { name: 'verbose', type: Boolean},
    { name: 'help', type: Boolean},
    { name: 'numAutomatic', type: Number, defaultValue: 3},
    { name: 'disabledTemplates', type: String, multiple: true },
    { name: 'numCPUs', type: Number, defaultValue: 0}
  ];
//const options = commandLineArgs(optionDefinitions);
{

    var debugFlag = false;
    var log = {
        "debug": function (e) {
            debug(e);
        }
    };

    var args = {};
    args["_"] = "";
    args["outFile"] = "tmpray1.mz";
    args["debug"] = false;
    args["numCPUs"] = 0;
    let argv = defaults;
    argv["_"] = "";
    //details("ARGS",args);
    //details("ARGV",argv);
    if (cluster.isMaster) {
    
    
        var n = argv['numCPUs'] || Math.max(1, os.cpus().length - 1);
    
        var workers = [];
        for (var i = 0; i < n; i++) {
            workers.push(cluster.fork());
        }
    
        var globalStartTime = new Date();

        //
        describe("FITS Tests", () => {
            it("FITS Quasar\tlinear header air wavelength, with sky, no helio, no cmb", () => {
                var q = $q.defer();
                argv["_"] = "./testFits/quasarLinearSkyAirNoHelio.fits";
                struct.init(workers, log, argv);
                struct.runFitsFile("./testFits/quasarLinearSkyAirNoHelio.fits", null, debug, false).then(function(res) {
                    var spectra = res[0];
                    q.resolve(spectra.getFinalRedshift());
                });
            });
            /*
            tests.addTest(new Test("FITS Quasar\tlinear header air wavelength, with sky, no helio, no cmb", function() {
                var q = $q.defer();
                struct.runFitsFile("./testFits/quasarLinearSkyAirNoHelio.fits", null, debug, false).then(function(res) {
                    var spectra = res[0];
                    q.resolve(spectra.getFinalRedshift());
                });
                return q.promise;
            }).setAbsoluteDeviationFromValue(2.00303, redshiftThreshold));
            tests.addTest(new Test("JSON Quasar\tlinear header air wavelength, with sky, no helio, no cmb", function() {
                var q = $q.defer();
                struct.runJSONFile("./testFits/quasarLinearSkyAirNoHelio.json", null, debug, false).then(function(res) {
                    var spectra = res[0];
                    q.resolve(spectra.getFinalRedshift());
                });
                return q.promise;
            }).setAbsoluteDeviationFromValue(2.00303, redshiftThreshold));
            tests.addTest(new Test("FITS ELG\tlinear header air wavelength, with sky, no helio, no cmb", function() {
                var q = $q.defer();
                struct.runFitsFile("./testFits/emlLinearSkyAirNoHelio.fits", null, debug, false).then(function(res) {
                    var spectra = res[0];
                    q.resolve(spectra.getFinalRedshift());
                });
                return q.promise;
            }).setAbsoluteDeviationFromValue(0.11245, redshiftThreshold));
            tests.addTest(new Test("JSON ELG\tlinear header air wavelength, with sky, no helio, no cmb", function() {
                var q = $q.defer();
                struct.runJSONFile("./testFits/emlLinearSkyAirNoHelio.json", null, debug, false).then(function(res) {
                    var spectra = res[0];
                    q.resolve(spectra.getFinalRedshift());
                });
                return q.promise;
            }).setAbsoluteDeviationFromValue(0.11245, redshiftThreshold));
        
            tests.addTest(new Test("JSON ELG\tlinear header air wavelength, with sky, helio, no cmb", function() {
                var q = $q.defer();
                struct.runJSONFile("./testFits/emlLinearSkyAirHelio.json", null, debug, false).then(function(res) {
                    var spectra = res[0];
                    q.resolve(((1 + spectra.getFinalRedshift()) * (1 - spectra.helio/ckps)) - 1);
                });
                return q.promise;
            }).setAbsoluteDeviationFromValue(0.11245, redshiftThreshold));
            tests.addTest(new Test("FITS ELG\tlinear header air wavelength, with sky, helio, no cmb", function() {
                var q = $q.defer();
                struct.runFitsFile("./testFits/emlLinearSkyAirHelio.fits", null, debug, false).then(function(res) {
                    var spectra = res[0];
                    q.resolve(((1 + spectra.getFinalRedshift()) * (1 - spectra.helio/ckps)) - 1);
                });
                return q.promise;
            }).setAbsoluteDeviationFromValue(0.11245, redshiftThreshold));
            tests.addTest(new Test("FITS ELG\tlinear header air wavelength, with sky, helio, cmb", function() {
                var q = $q.defer();
                struct.runFitsFile("./testFits/emlLinearSkyAirHelioCMB.fits", null, debug, false).then(function(res) {
                    var spectra = res[0];
                    q.resolve(((1 + spectra.getFinalRedshift()) * (1 - spectra.helio/ckps) * (1 - spectra.cmb/ckps)) - 1);
                });
                return q.promise;
            }).setAbsoluteDeviationFromValue(0.11245, redshiftThreshold));
            tests.addTest(new Test("JSON ELG\tlinear header air wavelength, with sky, helio, cmb", function() {
                var q = $q.defer();
                struct.runJSONFile("./testFits/emlLinearSkyAirHelioCMB.json", null, debug, false).then(function(res) {
                    var spectra = res[0];
                    q.resolve(((1 + spectra.getFinalRedshift()) * (1 - spectra.helio/ckps) * (1 - spectra.cmb/ckps)) - 1);
                });
                return q.promise;
            }).setAbsoluteDeviationFromValue(0.11245, redshiftThreshold));
            tests.addTest(new Test("FITS ELG\tlinear header vacuum wavelength, no sky, no helio, no cmb", function() {
                var q = $q.defer();
                struct.runFitsFile("./testFits/emlLinearVacuumNoHelio.fits", null, debug, false).then(function(res) {
                    var spectra = res[0];
                    q.resolve(spectra.getFinalRedshift());
                });
                return q.promise;
            }).setAbsoluteDeviationFromValue(0.11245, redshiftThreshold));
            tests.addTest(new Test("JSON ELG\tlinear header vacuum wavelength, no sky, no helio, no cmb", function() {
                var q = $q.defer();
                struct.runJSONFile("./testFits/emlLinearVacuumNoHelio.json", null, debug, false).then(function(res) {
                    var spectra = res[0];
                    q.resolve(spectra.getFinalRedshift());
                });
                return q.promise;
            }).setAbsoluteDeviationFromValue(0.11245, redshiftThreshold));
            tests.addTest(new Test("FITS ELG\tlog array vacuum wavelength, no sky, no helio, no cmb", function() {
                var q = $q.defer();
                struct.runFitsFile("./testFits/emlLogVacuumNoHelio.fits", null, debug, false).then(function(res) {
                    var spectra = res[0];
                    q.resolve(spectra.getFinalRedshift());
                });
                return q.promise;
            }).setAbsoluteDeviationFromValue(0.11245, redshiftThreshold));
            tests.addTest(new Test("JSON ELG\tlog array vacuum wavelength, no sky, no helio, no cmb", function() {
                var q = $q.defer();
                struct.runJSONFile("./testFits/emlLogVacuumNoHelio.json", null, debug, false).then(function(res) {
                    var spectra = res[0];
                    q.resolve(spectra.getFinalRedshift());
                });
                return q.promise;
            }).setAbsoluteDeviationFromValue(0.11245, redshiftThreshold));
            tests.addTest(new Test("FITS ELG\tlog array vacuum wavelength, no sky, helio, cmb", function() {
                var q = $q.defer();
                struct.runFitsFile("./testFits/emlLogVacuumHelioCMB.fits", null, debug, false).then(function(res) {
                    var spectra = res[0];
                    q.resolve(((1 + spectra.getFinalRedshift()) * (1 - spectra.helio/ckps) * (1 - spectra.cmb/ckps)) - 1);
                });
                return q.promise;
            }).setAbsoluteDeviationFromValue(0.11245, redshiftThreshold));
            tests.addTest(new Test("JSON ELG\tlog array vacuum wavelength, no sky, helio, cmb", function() {
                var q = $q.defer();
                struct.runJSONFile("./testFits/emlLogVacuumHelioCMB.json", null, debug, false).then(function(res) {
                    var spectra = res[0];
                    q.resolve(((1 + spectra.getFinalRedshift()) * (1 - spectra.helio/ckps) * (1 - spectra.cmb/ckps)) - 1);
                });
                return q.promise;
            }).setAbsoluteDeviationFromValue(0.11245, redshiftThreshold));
            */
          });
        //
    
    
    } else {
        process.on('message', function(event) {
            let result = handleEvent(event);
            process.send({data: result});
        });
    }
}

