import React from "react";
import {Navbar, Progress} from "reactstrap";
import Button from "reactstrap/lib/Button";

class Footer extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div id="footer">
                <Navbar color="dark" light fixed="bottom" className="grey-text marz-header">
                    <div className="spacing vcenter">
                        {
                            this.props.data.processorService.spectraManager.hasSpectra() ?
                                (
                                    <div>
                                        <div className="float-left">
                                            <p className="fill-height">{this.getText()}</p>
                                        </div>
                                        <div className="float-right">
                                            {
                                                this.displayPause() ? (
                                                    <Button
                                                        className="footer-button"
                                                        size="sm"
                                                        color="info"
                                                        onClick={() => this.props.data.processorService.togglePause()}
                                                    >
                                                        {this.getPausedText()}
                                                    </Button>
                                                ) : null
                                            }
                                            <Button
                                                className="footer-button"
                                                size="sm"
                                                color="primary"
                                                onClick={() => this.props.data.resultsManager.downloadResults()}
                                            >
                                                Download
                                            </Button>
                                        </div>
                                        <div className="fill-rest">
                                            <Progress
                                                max={1000}
                                                value={this.getProgressBarValue()}
                                                color={this.getProgressBarType()}
                                                striped
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="float-left">
                                        <p className="fill-height">Please drop in a FITS file.</p>
                                    </div>
                                )
                        }
                    </div>
                </Navbar>
            </div>
        )
    }

    getText() {
        const spectraService = this.props.data.processorService.spectraManager;
        if (spectraService.isProcessing()) {
            return "Processing spectra:   " + spectraService.getNumberProcessed() +
                "/" + spectraService.getNumberTotal();
        } else if (spectraService.isMatching()) {
            return "Matching spectra:   " + spectraService.getNumberMatched() +
                "/" + spectraService.getNumberTotal();
        } else {
            return "Finished all spectra";
        }
    }

    getProgressBarValue() {
        const spectraService = this.props.data.processorService.spectraManager;
        if (spectraService.isProcessing()) {
            return 1000 * spectraService.getNumberProcessed() / this.getProgressBarMax();
        } else {
            return 1000 * spectraService.getNumberMatched() / this.getProgressBarMax();
        }
    };

    getProgressBarType() {
        const spectraService = this.props.data.processorService.spectraManager;
        if (spectraService.isFinishedMatching()) {
            return "info";
        } else if (spectraService.isProcessing()) {
            return "success";
        } else {
            return "danger";
        }
    };

    getProgressBarMax() {
        const spectraService = this.props.data.processorService.spectraManager;
        return spectraService.getNumberTotal();
    };

    displayPause() {
        const spectraService = this.props.data.processorService.spectraManager;
        return spectraService.isProcessing() || spectraService.isMatching();
    }

    getPausedText() {
        const processorService = this.props.data.processorService;
        if (processorService.isPaused()) {
            return "Resume";
        } else {
            return "Pause";
        }
    };
}

export default Footer