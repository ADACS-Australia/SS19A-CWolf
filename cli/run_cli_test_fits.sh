#!/bin/bash
node dist/bundle.js --verbose --outFile=tmpray2.mz  --numCPUs=0  ../tests/testFits/emlLinearSkyAirHelio.fits
