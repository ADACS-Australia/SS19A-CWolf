import { expect } from "chai";

import defaults from '../src/autoConfig';
import {default as struct} from '../src/js/nodeMethods';
import { handleEvent } from '../src/Lib/worker/workerMethods'; 
import path from 'path';
import cluster from 'cluster';
//import '../src/js/extension';
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
    const redshiftThreshold=1.5e-5;
    //details("ARGS",args);
    //details("ARGV",argv);
    if (cluster.isMaster) {
        const workers = [cluster.fork()];
    
        var globalStartTime = new Date();
        struct.init(workers, log, argv);

        //
        describe("FITS Tests", function () {
            this.timeout(50000);
            it("FITS Quasar\tlinear header air wavelength, with sky, no helio, no cmb", () => {
                const q = $q.defer();
                //argv["_"] = "./testFits/quasarLinearSkyAirNoHelio.fits";
                struct.runFitsFile("./testFits/quasarLinearSkyAirNoHelio.fits", null, debug, false).then(function(res) {
                    const spectra = res[0];
                    expect(spectra.getFinalRedshift()).closeTo(2.00303,redshiftThreshold);
                    //q.resolve();
                });
            });
            it("FITS Quasar\tlinear header air wavelength, with sky, no helio, no cmb", () => {
                const q = $q.defer();
                struct.runFitsFile("./testFits/quasarLinearSkyAirNoHelio.fits", null, debug, false).then(function(res) {
                    const spectra = res[0];
                    expect(spectra.getFinalRedshift()).closeTo(2.00303, redshiftThreshold);
                    //q.resolve();
                });
            });
            it("JSON Quasar\tlinear header air wavelength, with sky, no helio, no cmb", () => {
                const q = $q.defer();
                struct.runJSONFile("./testFits/quasarLinearSkyAirNoHelio.json", null, debug, false).then(function(res) {
                    const spectra = res[0];
                    expect(spectra.getFinalRedshift()).closeTo(2.00303, redshiftThreshold);
                    //q.resolve();
                });
            });
            it("FITS ELG\tlinear header air wavelength, with sky, no helio, no cmb", () => {
                const q = $q.defer();
                struct.runFitsFile("./testFits/emlLinearSkyAirNoHelio.fits", null, debug, false).then(function(res) {
                    const spectra = res[0];
                    expect(spectra.getFinalRedshift()).closeTo(0.11245, redshiftThreshold);
                    //q.resolve();
                });
            });
            it("JSON ELG\tlinear header air wavelength, with sky, no helio, no cmb", () => {
                const q = $q.defer();
                struct.runJSONFile("./testFits/emlLinearSkyAirNoHelio.json", null, debug, false).then(function(res) {
                    const spectra = res[0];
                    expect(spectra.getFinalRedshift()).closeTo(0.11245, redshiftThreshold);
                    //q.resolve();
                });
            });
            it("JSON ELG\tlinear header air wavelength, with sky, helio, no cmb", () => {
                const q = $q.defer();
                struct.runJSONFile("./testFits/emlLinearSkyAirHelio.json", null, debug, false).then(function(res) {
                    const spectra = res[0];
                    expect(((1 + spectra.getFinalRedshift()) * (1 - spectra.helio/ckps)) - 1).closeTo(0.11245, redshiftThreshold);
                    //q.resolve();
                });
            });
            it("FITS ELG\tlinear header air wavelength, with sky, helio, no cmb", () => {
                const q = $q.defer();
                struct.runFitsFile("./testFits/emlLinearSkyAirHelio.fits", null, debug, false).then(function(res) {
                    const spectra = res[0];
                    expect(((1 + spectra.getFinalRedshift()) * (1 - spectra.helio/ckps)) - 1).closeTo(0.11245, redshiftThreshold);
                    //q.resolve();
                });
            });
            /*
            it("FITS ELG\tlinear header air wavelength, with sky, helio, cmb", () => {
                const q = $q.defer();
                struct.runFitsFile("./testFits/emlLinearSkyAirHelioCMB.fits", null, debug, false).then(function(res) {
                    console.log("!!!!!!!!!!!!!!!!!!!!!!!!res="+res);
                    //const spectra = res[0];
                    //expect(((1 + spectra.getFinalRedshift()) * (1 - spectra.helio/ckps) * (1 - spectra.cmb/ckps)) - 1).closeTo(0.11245, redshiftThreshold);
                    //q.resolve();
                });
            });
            */
            it("JSON ELG\tlinear header air wavelength, with sky, helio, cmb", () => {
                const q = $q.defer();
                struct.runJSONFile("./testFits/emlLinearSkyAirHelioCMB.json", null, debug, false).then(function(res) {
                    const spectra = res[0];
                    expect(((1 + spectra.getFinalRedshift()) * (1 - spectra.helio/ckps) * (1 - spectra.cmb/ckps)) - 1).closeTo(0.11245, redshiftThreshold);
                    //q.resolve();
                });
            });
            it("FITS ELG\tlinear header vacuum wavelength, no sky, no helio, no cmb", () => {
                const q = $q.defer();
                struct.runFitsFile("./testFits/emlLinearVacuumNoHelio.fits", null, debug, false).then(function(res) {
                    const spectra = res[0];
                    expect(spectra.getFinalRedshift()).closeTo(0.11245, redshiftThreshold);
                    //q.resolve();
                });
            });
            it("JSON ELG\tlinear header vacuum wavelength, no sky, no helio, no cmb", () => {
                const q = $q.defer();
                struct.runJSONFile("./testFits/emlLinearVacuumNoHelio.json", null, debug, false).then(function(res) {
                    const spectra = res[0];
                    expect(spectra.getFinalRedshift()).closeTo(0.11245, redshiftThreshold);
                    //q.resolve();
                });
            });
            it("FITS ELG\tlog array vacuum wavelength, no sky, no helio, no cmb", () => {
                const q = $q.defer();
                struct.runFitsFile("./testFits/emlLogVacuumNoHelio.fits", null, debug, false).then(function(res) {
                    const spectra = res[0];
                    expect(spectra.getFinalRedshift()).closeTo(0.11245, redshiftThreshold);
                    //q.resolve();
                });
            });
            it("JSON ELG\tlog array vacuum wavelength, no sky, no helio, no cmb", () => {
                const q = $q.defer();
                struct.runJSONFile("./testFits/emlLogVacuumNoHelio.json", null, debug, false).then(function(res) {
                    const spectra = res[0];
                    expect(spectra.getFinalRedshift()).closeTo(0.11245, redshiftThreshold);
                    //q.resolve();
                });
            });
            it("FITS ELG\tlog array vacuum wavelength, no sky, helio, cmb", () => {
                const q = $q.defer();
                struct.runFitsFile("./testFits/emlLogVacuumHelioCMB.fits", null, debug, false).then(function(res) {
                    const spectra = res[0];
                    expect(((1 + spectra.getFinalRedshift()) * (1 - spectra.helio/ckps) * (1 - spectra.cmb/ckps)) - 1).closeTo(0.11245, redshiftThreshold);
                    q.resolve();
                });
            });
            it("JSON ELG\tlog array vacuum wavelength, no sky, helio, cmb", () => {
                const q = $q.defer();
                struct.runJSONFile("./testFits/emlLogVacuumHelioCMB.json", null, debug, false).then(function(res) {
                    const spectra = res[0];
                    expect(((1 + spectra.getFinalRedshift()) * (1 - spectra.helio/ckps) * (1 - spectra.cmb/ckps)) - 1).closeTo(0.11245, redshiftThreshold);
                    q.resolve();
                });
            });
          });
        //
    
    } else {
        process.on('message', function(event) {
            let result = handleEvent(event);
            process.send({data: result});
            this.disconnect();
        });
    }
}

