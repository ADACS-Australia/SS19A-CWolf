import * as React from "react";
import Header from "./Header";
import Overview from "./Pages/Overview";
import Sidebar from "./Sidebar";
import {MemoryRouter, BrowserRouter, Route} from "react-router-dom";
import Usage from "./Pages/Usage";
import Footer from "./Footer";
import Detailed from "./Pages/Detailed";

const Router = process.env.NODE_ENV === 'development' ? BrowserRouter : MemoryRouter;

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