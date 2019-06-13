import * as React from "react";
import Header from "./Header";
import Overview from "./Pages/Overview";
import Sidebar from "./Sidebar";
import {MemoryRouter, BrowserRouter, Route} from "react-router-dom";
import Usage from "./Pages/Usage";
import Footer from "./Footer";
import Detailed from "./Pages/Detailed";
import {storeReady} from "../Stores/StoreUtils";
import Settings from "./Pages/Settings";
import Templates from "./Pages/Templates";

const Router = process.env.NODE_ENV === 'development' ? BrowserRouter : MemoryRouter;

// Enable the one shot store ready event trigger
let loaded = false;

function MarzApp(props) {
    // If this is the first time that the main application is rendered, also trigger a store ready event
    if (!loaded) {
        // Make sure this is a one shot event
        loaded = true;

        // Wait for the render to complete then call the store ready event
        setTimeout(() => {
            storeReady()
        }, 0)
    }

    console.log("props: ", props)
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
                            <Route path="/detailed/"
                                   render={(routeProps) => <Detailed {...props} {...routeProps}/>}/>
                            <Route path="/settings/" render={(routeProps) => <Settings {...props} {...routeProps}/>}/>
                            <Route path="/templates/" render={(routeProps) => <Templates {...props} {...routeProps}/>}/>
                        </div>
                    </div>
                </div>
                <Footer {...props}/>
            </div>
        </Router>
    )
}

export default MarzApp;