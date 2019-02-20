import * as React from "react";
import {
    Button,
    Collapse,
    Form,
    FormGroup,
    Input,
    Nav,
    Navbar,
    NavbarBrand,
    NavbarToggler,
    NavItem
} from "reactstrap";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {Link} from "react-router-dom";

import marzIcon from '../Assets/images/Marz.png';
import {faCog, faQuestionCircle, faSignal, faTasks, faTh} from "@fortawesome/free-solid-svg-icons";
import {updateInitials} from "../Stores/Personal/Actions";
import BibTeX from "./BibTeX";

class Header extends React.Component {
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
            <Navbar color="dark" dark expand="md" fixed="top" className="marz-header">
                <Link className="navbar-brand" to="/">
                    <img className='navbar-brand-logo' src={marzIcon} alt="Marz Logo"/>
                </Link>
                <NavbarToggler onClick={this.toggle}/>
                <Collapse isOpen={this.state.isOpen} navbar>
                    <Nav className="ml-auto" navbar>
                        <NavItem>
                            <Link className="nav-link" to="/"><FontAwesomeIcon icon={faTh}/> Overview</Link>
                        </NavItem>
                        <NavItem>
                            <Link className="nav-link" to="/detailed/"><FontAwesomeIcon icon={faSignal}/> Detailed</Link>
                        </NavItem>
                        <NavItem>
                            <Link className="nav-link" to="/templates/"><FontAwesomeIcon icon={faTasks}/> Templates</Link>
                        </NavItem>
                        <NavItem>
                            <Link className="nav-link" to="/settings/"><FontAwesomeIcon icon={faCog}/> Settings</Link>
                        </NavItem>
                        <NavItem>
                            <Link className="nav-link" to="/usage/"><FontAwesomeIcon icon={faQuestionCircle}/> Usage</Link>
                        </NavItem>
                    </Nav>
                    <Form className="ml-auto" inline>
                        <FormGroup>
                            <BibTeX/>
                            <Input defaultValue={this.props.personal.initials} type="text" placeholder="Enter initials" onChange={e => updateInitials(e.target.value)}/>
                        </FormGroup>
                    </Form>
                </Collapse>
            </Navbar>
        )
    }
}

export default Header;