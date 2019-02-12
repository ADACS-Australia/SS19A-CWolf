import * as React from "react";
import Header from "./Header.jsx";
import Overview from "./Pages/Overview.jsx";
import Sidebar from "./Sidebar.jsx";
import {BrowserRouter as Router, Route} from "react-router-dom";
import Usage from "./Pages/Usage.jsx";
import Footer from "./Footer.jsx";
import Detailed from "./Pages/Detailed.jsx";

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
                        <div className="spacing relative">
                            <Route exact path="/" render={(routeProps) => <Overview {...props} {...routeProps}/>}/>
                            <Route path="/usage/" render={(routeProps) => <Usage {...props} {...routeProps}/>}/>
                            <Route path="/detailed/" render={(routeProps) => <Detailed {...props} {...routeProps}/>}/>
                        </div>
                    </div>
                </div>
                <Footer/>
            </div>
        </Router>
    )
}

export default MarzApp;