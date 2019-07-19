import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';

import defaults from './../../autoConfig';
import {default as struct} from './nodeMethods';
import path from 'path';
import fs from 'fs';
import cluster from 'cluster';
import os from 'os';
import {makeUnique} from "../../src/Utils/methods";
import {handleEvent} from "../../src/Lib/worker/workerMethods";
// iojs head script to run marz from a command line interface

function details(title,object) {
    console.log(title);
    for (let p in object) {
        console.log(" "+p+"="+object[p]);
    }
}

let debugFlag = undefined;

function debug(output) {
    if (debugFlag) {
        if (typeof output == "string") {
            console.log(output);
        } else {
            console.dir(output);
        }
    }
}

function getOutputFilename(fitsFile, argv) {
    let fname = argv["outFile"] || path.basename(fitsFile);
    const dname = argv['dir'] || path.dirname(fitsFile);
    if (!fname.endsWith(".mz")) {
        fname = fname.substring(0, fname.lastIndexOf('.')) + ".mz";
    }
    const outputFile = path.normalize(path.join(dname, fname));
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
      ];
    console.log(commandLineUsage(sections));
} else {

    debugFlag = options.verbose;
    const log = {
        "debug": function (e) {
            debug(e);
        }
    };

    const args = {};
    args["_"] = [options.spectrumFile];
    args["outFile"] = options.outFile;
    args["debug"] = false;
    args["numCPUs"] = options.numCPUs
    const argv = defaults;
    argv["_"] = [options.spectrumFile];
    //details("ARGS",args);
    //details("ARGV",argv);
    if (cluster.isMaster) {

        const filenames = argv['_'];
    
        //debug("MASTER.Input Parameters:");
        //debug(argv);
        
        const filename = filenames[0];
    
    
        const n = argv['numCPUs'] || Math.max(1, os.cpus().length - 1);
    
        const workers = [];
        for (let i = 0; i < n; i++) {
            workers.push(cluster.fork());
        }
    
        let queue = [];
        let totalNum = 0;
        for (let i = 0; i < filenames.length; i++) {
            const stat = fs.lstatSync(filenames[i]);
            if (stat.isDirectory()) {
                const files = fs.readdirSync(filenames[i]);
                for (let j = 0; j < files.length; j++) {
                    if (files[j].endsWith(".fits")) {
                        queue.push(path.normalize(path.resolve(filenames[i], files[j])));
                    }
                }
            } else {
                queue.push(path.normalize(filenames[i]));
            }
        }
        queue = makeUnique(queue);
        const globalStartTime = new Date();
    
        struct.init(workers, log, argv);
        let counter = 0;
        const totalLength = queue.length;
        const handleReturn = function (num) {
            totalNum += num;
            if (queue.length > 0) {
                const filename = queue.shift();
                counter += 1;
                console.log(counter + "/" + totalLength + ": Analysing " + filename);
                const outputName = getOutputFilename(filename, argv);
                if (filename.endsWith(".fits")) {
                    struct.runFitsFile(filename, outputName, debug, debugFlag).then(handleReturn);
                }
                else if (filename.endsWith(".json")) {
                    struct.runJSONFile(filename, outputName, debug, debugFlag).then(handleReturn);
                }
            } else {
                const globalEndTime = new Date();
                const elapsed = (globalEndTime - globalStartTime) / 1000;
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
