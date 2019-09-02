import React from "react";
import {
    Accordion,
    AccordionItem,
    AccordionItemPanel,
    AccordionItemHeading,
    AccordionItemButton
} from "react-accessible-accordion";

import "../../Assets/css/usage-accordion.css"

class Usage extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Accordion>
                <AccordionItem>
                    <AccordionItemHeading>
                        <AccordionItemButton>
                            Introduction
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>
                        <h4>The program's purpose</h4>
                        <p>This program is designed to take files from the AAOmega spectrograph after data reduction and
                            allow redshifting of the spectra within.</p>
                        <hr/>
                        <h4>30 second rundown</h4>
                        <p>Take a <code>fits</code> file, drag it into the drop area to the left, wait for the program
                            to automatically analyse all files.</p>
                        <p>Double click the first spectra, if the automatic redshift is correct just assign a quality
                            and move on. If not, find a feature, click on it, and then select which emission to mark it
                            as. Once happy, select a quality and move on.</p>
                        <p>When all spectra are done, hit the download button on the bottom right. Don't worry if you
                            accidentally close the browser, results get saved internally automatically. Just reopen the
                            browser, drag in the same file, and your results will appear instantly.</p>
                        <hr/>
                        <h4>Problems or feature requests</h4>
                        <p>If any bugs are found with the program, or there are features which could be added or
                            improved to make life easier, please either raise an issue on the official Github issue page
                            or send an email to me (the developer).</p>
                        <ul>
                            <li><a target="_blank" href="https://github.com/Samreay/Marz/issues">Github issues page</a>
                            </li>
                            <li>
                                <address><a target="_blank" ref="mailto:samuelreay@gmail.com">Send me an email</a>
                                </address>
                            </li>
                        </ul>
                    </AccordionItemPanel>
                </AccordionItem>
                <AccordionItem>
                    <AccordionItemHeading>
                        <AccordionItemButton>
                            Loading Files
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>
                        <h4>Loading Files</h4>
                        <p>Files can be loaded into the system by dragging them over the top left hand dashed box. The
                            application will accept <code>.fits</code> files from the AAOmega spectrograph containing
                            spectra, and <code>.csv</code> files containing saved results.</p>

                        <p>To start from scratch, simply drag in a fits file and let the application start analysis. If
                            you have previously been analysing the file and saved results, you can load these results
                            back in by dragging in the previously download results file. The order of drag and drop does
                            matter - please drop the results file first. Note that if you want to analyse a different
                            fits file or stop using results, you must refresh the page (to be updated in the
                            future).</p>
                        <p>For quick usage, a few example FITS files from OzDES are provided, both having a results file
                            you can also load into Marz:</p>
                        <ul>
                            <li><a target="_blank"
                                   href="https://github.com/Samreay/Marz/releases/download/DocoUpdate/Example_Efield.fits">Example
                                E Field</a> (<a
                                href="https://github.com/Samreay/Marz/releases/download/DocoUpdate/Example_Efield_MRG.mz">results
                                file</a>)
                            </li>
                            <li><a target="_blank"
                                   href="https://github.com/Samreay/Marz/releases/download/DocoUpdate/Example_Sfield.fits">Example
                                S Field</a> (<a
                                href="https://github.com/Samreay/Marz/releases/download/DocoUpdate/Example_Sfield_MRG.mz">results
                                file</a>)
                            </li>
                        </ul>
                        <hr/>
                        <h4>Background Tasks</h4>
                        <p>At the moment, the application processes spectra in two ways. Firstly, it iterates through
                            all spectra and processes the raw data, providing smoothing, removal of cosmic rays,
                            continuum subtraction and normalisation. It then goes back over the processed spectra and
                            analyses them to find the best fitting template at a specific redshift. Whether or not the
                            processing and analysing are done in the same instance or one after the other will become a
                            configurable item.</p>
                        <p>The state of the current background iteration is shown in the progress bar at the bottom of
                            the screen. A green bar, matching the green plots, represents the progress through
                            processing the spectra. The progress of the red bar (which comes after the green has
                            finished) and matches the colour of the templates, represents the progress through analysing
                            the spectra. The bar will turn blue when all spectra have been assigned a redshift.</p>
                    </AccordionItemPanel>
                </AccordionItem>
                <AccordionItem>
                    <AccordionItemHeading>
                        <AccordionItemButton>
                            Merging Files
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>
                        <h4>Merging Files</h4>
                        <p>If you have had two people redshift the same <code>.fits</code> file and want to merge their
                            results together, this can also be done from within Marz.</p>
                        <p>Simply select the <code>.fits</code> file and the two <code>.mz</code> files, together, and
                            drag them all into the drop zone in one go. Marz will recognise this as starting a merge,
                            and proceed from there.</p>
                        <p>On the overview screen Marz will now display not just the standard spectrum and template
                            match, but also the two redshifted results offset above and below the template. Results
                            which are flagged as needing to be manually merged (disagreeing redshifts) will have their
                            QOP set to 0. Spectra that can be automatically merged will be done so, by choosing the
                            redshift of the result with the highest QOP. If the QOPs are the same, the value of the
                            default merger will be chosen. You can change the default merger in the sidebar. By default,
                            the Overview screen will be set to only show QOP0 results, so that you can focus on the
                            disagreements. The detailed screen will allow you to toggle between the two flagged
                            redshifts either by pressing the relevant buttons or by pressing <code>q</code>. Simply pick
                            a redshift and assign a quality flag as per normal redshifting to move onto the next
                            disagreement. The results for both original <code>.mz</code> files will be appended to the
                            spectrum's comment.</p>
                    </AccordionItemPanel>
                </AccordionItem>
                <AccordionItem>
                    <AccordionItemHeading>
                        <AccordionItemButton>
                            The Overview Screen
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>
                        <p>The overview screen allows a high level overview of all spectra to be quickly given to the
                            user. Subsets of spectra can be displayed by using the filter options on the left sidebar,
                            where options have been created for object types, templates, redshifts and quality flag
                            (QOP).</p>
                        <p>Users can also switch between a graphical overview, and a more compact table view, which
                            allows sorting of the spectra based on ID, template, redshift or QOP.</p>
                    </AccordionItemPanel>
                </AccordionItem>
                <AccordionItem>
                    <AccordionItemHeading>
                        <AccordionItemButton>
                            The Detailed Screen
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>
                        <p>The detailed view allows users take processed spectra and manually redshift them. This can be
                            accomplished in two main ways, matching templates or finding spectral lines.</p>
                        <hr/>
                        <h4>Viewing the data</h4>
                        <ul>
                            <li><p><b>Data toggle:</b> By default, the user is shown the processed data in green. This
                                can be toggled back to the raw data (shown in black), by pressing the "Data" toggle in
                                the upper menu.</p></li>
                            <li><p><b>Template toggle:</b> The best fitting template is automatically shown in red. You
                                can hide the template using the template toggle in the upper menu. Use the "Offset"
                                slider to move the template vertically, and the "Redshift" slider to move it
                                horizontally. For all sliders, numerical values can also be entered instead.</p></li>
                            <li><p><b>Continuum toggle:</b> The broad shape of the continuum can be turned off using the
                                continuum toggle if you want to focus only on emission and absorption lines.</p></li>
                            <li><p><b>Variance toggle:</b> The variance can be turned on to give you an indication of
                                the uncertainty in the spectrum as a function of wavelength. The variance is displayed
                                clipped to 3 standard deviations away from the mean, so that any large spike in variance
                                do not wash out all the other features.</p></li>
                            <li><p><b>Smooth:</b> The significant lines in the spectra can sometimes be more easily seen
                                when the spectra has been smoothed slightly. The smooth toggle defaults to 3 pixel
                                smoothing, but this can be altered on the slider in the top right.</p></li>
                            <li><p><b>Callout windows:</b> Zoom ins of the most interesting regions are shown in the
                                small panels at the bottom of the screen. This is helpful for finding precise line
                                positions and checking the regions where the most significant lines usually appear. You
                                can also zoom in on the main screen by using your mouse to highlight the region you want
                                to zoom on (make sure it stays within the bounds of the plot as you're highlighting).
                                Zoom out again using the demagnifying symbol on the top right of the plot.</p></li>
                            <li><p><b>Cross correlation spectrum:</b> The automatic redshifting provides a
                                cross-correlation result shown in black above them main spectrum screen. The peaks (and
                                troughs) of this XCor result are the redshifts that the automatic fitting found most
                                likely. Clicking on this spectrum will move the template to that redshift and show you
                                the value of the cross correlation (higher values are better).</p></li>
                        </ul>
                        <hr/>
                        <h4>Redshifting the data</h4>
                        There are multiple ways of finding redshifts for spectra in Marz.

                        <ul>
                            <li><p><b>Top Automatic Results: </b> The automatic matching algorithm in Marz returns the
                                top five results, where the top result is shown by default. If this is not a correct
                                redshift, you can view the other potential matches by pressing the buttons in the "Top
                                Results" group in the upper menu bar, or by pressing <code>o</code> (which stands for
                                "other").</p></li>
                            <li><p><b>Matching templates: </b> The type of object you're looking at and its approximate
                                redshift can be determined by comparing the observed spectrum (green) to the available
                                template spectra (red). All available templates can be viewed in the "Templates" tab,
                                and the template that appears in the Detailed Screen can be changed using the menu bar
                                at the top.</p></li>
                            <li><p><b>Marking spectral lines: </b> If obvious emission or absorption lines can be seen
                                in the spectra, you can assign them to specific element transitions. This can be done
                                via clicking on the graph at the point of interest, and then selecting a spectral line
                                in the upper toolbar, or pressing the appropriate keyboard shortcut (listed on this page
                                under the "Keybindings" section below). This will update the redshift of the template.
                                An alternate way that I prefer to use, is to select a point on the graph, and then
                                repeatedly press <code>.</code> (or <code>,</code>) - this will cycle through all
                                available spectral lines without having to remember multiple shortcuts.</p></li>
                            <li><p><b>Using cross-correlation: </b> Clicking on peaks in the cross-correlation plot will
                                set the redshift to where you clicked. Strong cross correlation values (varies for
                                templates, but generally above 8) can be investigated to check if they find the correct
                                redshift.</p></li>
                        </ul>


                        <p>After setting a manual redshift, either via marking spectral features, selecting a point on
                            the cross-correlation plot or manually entering a redshift, it is often desirable to perform
                            a local fit to the data. Simply make sure you have the right template selected, and press
                            the "Perform fit" button, or press <code>u</code>. This will fit the current spectrum and
                            template within a small redshift window around the current redshift value.</p>
                        <hr/>
                        <h4>Saving the redshift and assigning its quality</h4>
                        <p>Results can be saved via pressing any one of the coloured buttons in the left sidebar under
                            "Save QOP". A spectra that has only gone through the manual processing will have a QOP of 0
                            by default, unless you have turned on "Assign AutoQOPs" in the settings. An automatic QOP is
                            suggested in the top menu bar based on the best automatic result, and you can accept this
                            redshift and QOP by pressing <code>Enter</code>. A QOP can be chosen by either pressing the
                            relevant button, by pressing the numeric key corresponding to the desired QOP.</p>
                        <p>Whilst the meaning of the QOP values can change depending on survey, a good starting point as
                            QOP 4 as very confident redshift (99% confidence), QOP3 as a good redshift (90% confidence),
                            QOP2 as an uncertain redshift (50% confidence) and QOP 1 is for spectra that cannot be
                            assigned any form of redshift. QOP6 is used for stars, where generally a QOP 4 or QOP 3
                            match to a stellar template would be given a QOP 6. Spectra flagged as QOP 2 and QOP 1 are
                            not used for scientific purposes.</p>
                        <hr/>
                        <h4>Downloading results</h4>
                        <p>At any point during the redshifting process, you can download a file containing the spectra
                            that have already been assigned redshifts, by pressing on the download button on the bottom
                            right corner of the screen.</p>
                    </AccordionItemPanel>
                </AccordionItem>
                <AccordionItem>
                    <AccordionItemHeading>
                        <AccordionItemButton>
                            The Template Screen
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>
                        <p>The templates screen for now only provides a simple graphical view of all the templates used
                            by the application to match spectra.</p>
                        <p>Unlikely templates can also be disabled by setting them to inactive. Inactive templates are
                            not available in the detailed screen, nor do they undergo automatic matching. Making a
                            template active or inactive applies instantly, but not retroactively.</p>
                    </AccordionItemPanel>
                </AccordionItem>
                <AccordionItem>
                    <AccordionItemHeading>
                        <AccordionItemButton>
                            The Settings Screen
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>
                        <p>The settings screen allows configuration of the program. All changes on the Settings screen
                            are <strong>instantly</strong> applied on change, and do not need to be saved. The settings
                            are stored as cookie values, and will persist between sessions.</p>
                        <p>The options to clear the internal saved data are irreversible. If you have
                            saved <code>.mz</code> output via downloading the results, these can still be loaded in
                            without hassle, this section only pertains to the automatic background saving of results.
                        </p>
                    </AccordionItemPanel>
                </AccordionItem>
                <AccordionItem>
                    <AccordionItemHeading>
                        <AccordionItemButton>
                            Keybindings
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>
                        <p>Many key bindings have been added to this application from the RUNZ default keymapping to
                            make usage easier. Note that the way the key bindings and browser interact, make sure you
                            don't have any input element selected when pressing the keyboard shortcuts. In most cases
                            this is obvious - if you are in the comment text input, typing will write out a comment, not
                            trigger shortcuts. However, the same is true if you have a check-button focused, or a
                            slider. So, if a shortcut doesn't work, click away and try again!</p>
                        <p>The following commands are available:</p>
                        {/*todo Add keybindings*/}
                    </AccordionItemPanel>
                </AccordionItem>
                <AccordionItem>
                    <AccordionItemHeading>
                        <AccordionItemButton>
                            File Output and Loading Results with Python
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>
                        <h4>Output file structure</h4>
                        <p>Marz saves <code>.mz</code> files as output. These files are formatted ot be ASCII,
                            comma-separated value files. An <a target="_blank"
                                                               href="https://github.com/Samreay/Marz/releases/download/1.0.0/alldata_SRH.mz"> example
                                file can be found here.</a></p>
                        <p>Comment lines begin with a <code>#</code>, and there should be three header lines marked as
                            comments. The first contains details on who generated results for what file at what time. As
                            such, it contains your initials, the filename analysed and the date the results were
                            downloaded. The second line gives some basic statistics on the file - the number of spectra
                            matched > QOP2, the total number of spectra, and the overall success rate. The third comment
                            line simply contains the headers for the tabular data.</p>
                        <p>The rest of the file is then comprised of one row per matched spectra, where the spectra
                            fibre, name, right ascension, declination, magnitude and type are stated in the first six
                            columns if they exist. The next four columns detail the results of the automatic matching
                            algorithm, giving the automatically matched template ID, template name, redshift of match
                            and cross correlation strength. The next four columns detail the final match (which often
                            should be the same as the automatic match), giving the template ID, name, redshift and QOP
                            flag. Any comments on the spectra are then placed in the final column. If heliocentric or
                            CMB corrections are requested, they will be placed after the comment column.</p>
                        <hr/>
                        <h4>Loading this file with Python</h4>
                        <p>Given the popularity of Python in astrophysics, example code to read in the generated Marz
                            output file has been supplied.</p>
                        <pre className="prettyprint lang-python">import numpy <br/>
def loadMarzResults(filepath):<br/>
&nbsp;&nbsp;&nbsp;&nbsp;return numpy.genfromtxt(filepath, delimiter=',', skip_header=2, autostrip=True, names=True, dtype=None)</pre>
                        <p>The result is a structured <code>numpy</code> array and can undergo normal array operations:
                        </p>
                        <pre className="prettyprint lang-python">res = loadMarzResults(pathToResultsFile)<br/>
confident = res[res['QOP'] == 4]</pre>
                    </AccordionItemPanel>
                </AccordionItem>
            </Accordion>
        )
    }
}

export default Usage