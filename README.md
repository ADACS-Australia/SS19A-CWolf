# SS19A-CWolf - MARZ Spectrum Viewer
The Marz redshifting program is intended for use in cosmology surveys



## Local Development

Make sure the requirements are installed:

* Node Version Manager (nvm) - https://github.com/nvm-sh/nvm (Windows versions are available)



Initial setup of Node:

* Copy the version from .nvmrc (At time of writing that is `v10.16.3`)
* `nvm install v10.16.3` To install the correct version of Nodejs
* `nvm use` To activate the correct version of Nodejs
* `npm install` To install all JavaScript dependencies 



To start the live development server:

* `npm run start` - Linux/MacOS
* `npm run start_win` - Windows



Once the development server is running, you should be able to access it by visiting http://localhost:8080 in your browser of choice.



## Deployment 

### Manually

To build the production code:

* `npm run build`

The compiled bundle and index html file will be output in the `dist` directory. Take these files and put them on a simple static webserver.



### Docker

A simple docker-compose configuration is available that can be modified for use with a different non-Swinburne configuration.



## Configuration
There is a JavaScript configuration dictionary that should be under `window` called `marz_configuration` which controls the settings for the Marz spectrum viewer. Refer to the example index.html in the `src` directory.

The configuration dictionary has the following properties:
```
window.marz_configuration = {...}
```

|Attribute     |Required? |Definition      |
| ---- | ---- | ---- |
|`container_class`      | no | The HTML class to mount Marz in. If this is not defined or null, it will fall back to `marz_conainer` |
|`layout`      | yes | Which layout Marz should use. One of `ReadOnlySpectrumView`, `SimpleSpectrumView`, `TemplateOverlaySpectrumView` or `MarzSpectrumView` |
|`ymin`      | no | Override the minimum value of the spectra graph. |
|`ymax` | no | Override the maximum value of the spectra graph. |
|`remote_templates`| no | A URL to a remote JSON file that specifies the templates to use rather than the build in templates. An example of this file can be located in the examples directory. |
| `remote_file` | no | A URL to a remote JSON or FITS spectra file to download and process. |



## Command Line Interface

The command line interface can be used for batching of spectra processing.

To build the cli component:

* `cd cli`
* `nvm use` (Make sure you have run `nvm install` as per the nvm man page)
* `npm install`
* `npm run build`
* Now you can redshift from the command line `node dist/bundle.js --verbose --outFile=tmpray1.mz  --numCPUs=0  ../tests/testFits/alldata_combined_runz_x12_b02.fit`



To run CLI tests:

* `cd cli`
* `nvm use` (Make sure you have run `nvm install` as per the nvm man page)
* `npm install`
* `./run_cli_test.sh`
* etc

