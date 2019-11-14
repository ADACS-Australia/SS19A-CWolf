import FluxContainer from "./Utils/FluxContainer";
import React from 'react';
import ReactDOM from 'react-dom';

// Import all assets here
// Include Bootstrap
import './Assets/css/bootstrap.min.css';

// Import the react bootstrap table styling
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

// Include remaining CSS
import './Assets/css/common.scss';
import './Assets/css/dialogs.scss';
import './Assets/css/layout.scss';
import './Assets/css/loader.scss';
import './Assets/css/non-responsive.scss';
import './Assets/css/structure.scss';

// Get the container to mount the react application in
const container = document.getElementById(window.marz_configuration.container_class || 'marz_conainer');

// Check that the container was actually found
if (container) {
    // The container was found, mount the application
    ReactDOM.render(<FluxContainer/>, container);
} else {
    // Alert the user that the dom element was not found
    alert("Marz: Container DOM element with ID '" + (window.marz_configuration.container_class || 'marz_conainer') + "' was not found.")
}