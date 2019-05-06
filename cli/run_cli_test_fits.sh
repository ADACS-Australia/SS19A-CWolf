#!/bin/bash
#node dist/bundle.js --verbose --outFile=tmpray2.mz  --numCPUs=0  ../tests/testFits/emlLinearSkyAirHelio.fits
#node dist/bundle.js --verbose --outFile=tmpray2.mz  --numCPUs=0  ../tests/testFits/emlLinearSkyAirHelioCMB.fits
node dist/bundle.js --verbose --outFile=tmpray2.mz  --numCPUs=0  testFits/emlLinearSkyAirHelioCMB.fits
