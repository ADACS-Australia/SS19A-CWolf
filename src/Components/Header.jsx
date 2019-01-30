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
    NavItem,
    NavLink
} from "reactstrap";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

import marzIcon from '../Assets/images/Marz.png';
import {faCog, faQuestionCircle, faSignal, faTasks, faTh} from "@fortawesome/free-solid-svg-icons";
import {updateInitials} from "../Stores/Personal/Actions";
import BibTeX from "./BibTeX.jsx";

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
                <NavbarBrand>
                    <img className='navbar-brand-logo' src={marzIcon} alt="Marz Logo"/>
                </NavbarBrand>
                <NavbarToggler onClick={this.toggle}/>
                <Collapse isOpen={this.state.isOpen} navbar>
                    <Nav className="ml-auto" navbar>
                        <NavItem>
                            <NavLink><FontAwesomeIcon icon={faTh}/> Overview</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink><FontAwesomeIcon icon={faSignal}/> Detailed</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink><FontAwesomeIcon icon={faTasks}/> Templates</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink><FontAwesomeIcon icon={faCog}/> Settings</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink><FontAwesomeIcon icon={faQuestionCircle}/> Usage</NavLink>
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