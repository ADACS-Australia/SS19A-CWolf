import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';

import defaults from './autoConfig';
import {default as struct} from './js/nodeMethods';
import { handleEvent } from './Lib/worker/workerMethods'; 
import path from 'path';
import fs from 'fs';
import cluster from 'cluster';
import './js/extension';
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
const options = commandLineArgs(optionDefinitions);
if (options.help || !options.spectrumFile) {
    const sections = [
        {
          header: 'Marz Command Line Interface',
          content: 'Marz auto redshift and source type classification.'
        },
        {
          header: 'Synopsis',
          content: '$ MarzCLI <options> <spectrumFile>'
        },
        {
            header: 'Command Options',
            optionList: [
                {
                    name: 'outFile',
                    typeLabel: '{underline file}',
                    description: 'The output filename. A "" value means use the original filename, such that abc.fits -> abc.mz.' 
                },
                {
                    name: 'dir',
                    typeLabel: '{underline directory}',
                    description: 'Output directory. A "" value means output in the same directory as the fits file. Path is relative to input path.' 
                },
                {
                    name: 'verbose',
                    description: 'Whether to print debug output.'
                },
                {
                    name: 'help',
                    description: 'Print this usage guide.'
                }
            ]
        },
        {
            header: 'Matching formatting and algorithm options',
            optionList: [
                {
                    name: 'numAutomatic',
                    typeLabel: '{underline num}',
                    description: 'How many automatic matches to return. (default 3).' 
                },
                {
                    name: 'disabledTemplates',
                    typeLabel: '{underline templateList ...}',
                    description: 'List of template IDs to disable in matching, eg to disable only quasars set to [12].' 
                },
                {
                    name: 'numCPUs',
                    typeLabel: '{underline num}',
                    description: 'A 0 value defaults to using all but one logical CPUs on the host machine.'
                },
            ]
        }
      ]
    console.log(commandLineUsage(sections));
} else {

    var debugFlag = options.verbose;
    var log = {
        "debug": function (e) {
            debug(e);
        }
    };

    var args = {};
    args["_"] = [options.spectrumFile];
    args["outFile"] = options.outFile;
    args["debug"] = false;
    args["numCPUs"] = options.numCPUs
    let argv = defaults;
    argv["_"] = [options.spectrumFile];
    //details("ARGS",args);
    //details("ARGV",argv);
    if (cluster.isMaster) {

        var filenames = argv['_'];
    
        //debug("MASTER.Input Parameters:");
        //debug(argv);
        
        var filename = filenames[0];
    
    
        var n = argv['numCPUs'] || Math.max(1, os.cpus().length - 1);
    
        var workers = [];
        for (var i = 0; i < n; i++) {
            workers.push(cluster.fork());
        }
    
        var queue = [];
        var totalNum = 0;
        for (var i = 0; i < filenames.length; i++) {
            var stat = fs.lstatSync(filenames[i]);
            if (stat.isDirectory()) {
                var files = fs.readdirSync(filenames[i]);
                for (var j = 0; j < files.length; j++) {
                    if (files[j].endsWith(".fits")) {
                        queue.push(path.normalize(path.resolve(filenames[i], files[j])));
                    }
                }
            } else {
                queue.push(path.normalize(filenames[i]));
            }
        }
        queue = queue.unique();
        //debug("Queue contains:");
        //debug(queue);
        var globalStartTime = new Date();
    
        struct.init(workers, log, argv);
        var counter = 0;
        var totalLength = queue.length;
        var handleReturn = function (num) {
            totalNum += num;
            if (queue.length > 0) {
                var filename = queue.shift();
                counter += 1;
                console.log(counter + "/" + totalLength + ": Analysing " + filename);
                var outputName = getOutputFilename(filename, argv);
                if (filename.endsWith(".fits")) {
                    struct.runFitsFile(filename, outputName, debug, debugFlag).then(handleReturn);
                }
                else if (filename.endsWith(".json")) {
                    struct.runJSONFile(filename, outputName, debug, debugFlag).then(handleReturn);
                }
            } else {
                var globalEndTime = new Date();
                var elapsed = (globalEndTime - globalStartTime) / 1000;
                debug("All files processed in " + elapsed + " seconds, an average of " + (totalNum / elapsed).toFixed(2) + " spectra per second");
                cluster.disconnect();
            }
        };
        handleReturn(0);
    
    
    } else {
        process.on('message', function(event) {
            let result = handleEvent(event);
            process.send({data: result});
        });
    }
}
