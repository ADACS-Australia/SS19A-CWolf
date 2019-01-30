import * as React from "react";
import {Button, Modal, ModalBody, ModalHeader} from "reactstrap";

const bibtex_raw = `@ARTICLE{Hinton2016Marz,
    author = { {Hinton}, S.~R. and {Davis}, T.~M. and {Lidman}, C. and {Glazebrook}, K. and {Lewis}, G.~F.},
    title = "{MARZ: Manual and automatic redshifting software}",
    journal = {Astronomy and Computing},
    archivePrefix = "arXiv",
    eprint = {1603.09438},
    primaryClass = "astro-ph.IM",
    keywords = {Online, Spectroscopic, Redshift, Software, Marz},
    year = 2016,
    month = apr,
    volume = 15,
    pages = {61-71},
    doi = {10.1016/j.ascom.2016.03.001},
    adsurl = {http://adsabs.harvard.edu/abs/2016A%26C....15...61H},
    adsnote = {Provided by the SAO/NASA Astrophysics Data System}
}`;

class BibTeX extends React.Component {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);

        // Set the initial state of the dialog as closed
        this.state = {
            isOpen: false
        };
    }

    toggle() {
        // Toggle the open state of the dialog
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    render() {
        return (
            <span>
                <Button size="small" color="primary" onClick={this.toggle}>BibTeX</Button>
                <Modal isOpen={this.state.isOpen} toggle={this.toggle} backdrop size="lg">
                    <ModalHeader toggle={this.toggle}>BibTeX Citation</ModalHeader>
                    <ModalBody>
                        <pre>
                            <code>
                                {bibtex_raw}
                            </code>
                        </pre>
                    </ModalBody>
                </Modal>
            </span>
        )
    }
}

export default BibTeX;