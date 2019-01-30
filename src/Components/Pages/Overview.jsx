import * as React from "react";
import {Col, Container, Row} from "reactstrap";

import marzIcon from '../../Assets/images/Marz2.png';

class Overview extends React.Component {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);

        // Set the initial state of the menu as closed
        this.state = {
            isOpen: false
        };
    }

    toggle() {
        // Toggle the open state of the menu
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    render() {
        return (
            <Container className="usage marketing">
                <h1 className="center-block welcomeText">
                    Welcome to
                    <img src={marzIcon} width="260" alt="Marz: Manual and Assisted Redshifting"/>
                </h1>

                <Row>
                    <Col xs={4} className="introCard">
                        <div className="inner">
                            <h2>New users</h2>
                            <p>Please visit the <a>usage page</a>. It contains instructions, example
                                FITS files, and useful Python code to import results!</p>
                            <p>If you use Marz, please cite this work via the BibTeX available when clicking the blue
                                button above. If you want to use high resolution graphs, the download arrow icon in the
                                upper right corner of the plot in the Detailed view is what you want!</p>
                            <p>
                                <a target="_blank"
                                   href="https://github.com/Samreay/Marz/releases/download/0.2.0/alldata_combined_runz_x12_b02.fits">
                                    Click here if you want an example FITS file straight away!
                                </a>
                            </p>
                        </div>
                    </Col>
                    <Col xs={4} className="introCard">
                        <div className="inner">
                            <h2>Returning users</h2>
                            <p>
                                You know the deal, drop in a FITS file and have fun. If you can think of any feature
                                that would make your life easier, simply&nbsp;
                                <a target="_blank" href="https://github.com/samreay/Marz/issues">
                                    raise a Github issue
                                </a>
                                , and I'll jump on it as soon as possible! The more detail and
                                screenshots, the better!
                            </p>
                            <p>
                                If you want to merge results, drag the FITS file and 2 <code>.mz</code> files in all
                                at once.
                            </p>
                        </div>
                    </Col>
                    <Col xs={4} className="introCard">
                        <div className="inner">
                            <h2>The technically minded</h2>
                            <p>
                                Instructions for command line usage, running your own Marz server, licensing details and
                                version history can all be found in the&nbsp;
                                <a target="_blank" href="https://github.com/Samreay/Marz">
                                    main README.md on Github.
                                </a>
                            </p>
                            <p>
                                Formal documentation can be found&nbsp;
                                <a target="_blank"
                                   href="http://www.sciencedirect.com/science/article/pii/S2213133716300166">
                                    here,
                                </a>
                                &nbsp;or on&nbsp;
                                <a target="_blank" href="http://arxiv.org/abs/1603.09438">
                                    arXiv
                                </a>
                            </p>
                        </div>
                    </Col>
                </Row>
            </Container>
        )
    }
}

export default Overview