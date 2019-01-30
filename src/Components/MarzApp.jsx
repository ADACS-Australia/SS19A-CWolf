import * as React from "react";
import Header from "./Header.jsx";
import Overview from "./Pages/Overview.jsx";
import Sidebar from "./Sidebar.jsx";
import {BrowserRouter as Router, Route} from "react-router-dom";
import Usage from "./Pages/Usage.jsx";

function MarzApp(props) {
    return (
        <Router>
            <div>
                <Header {...props}/>
                <div id="underNavContainer">
                    <div id="sidebar">
                        <Sidebar/>
                    </div>
                    <div id="afterSideBarContainer">
                        <Route exact path="/" render={(routeProps) => <Overview {...props} {...routeProps}/>}/>
                        <Route path="/usage/" render={(routeProps) => <Usage {...props} {...routeProps}/>}/>
                    </div>
                </div>
            </div>
        </Router>
    )
}

export default MarzApp;