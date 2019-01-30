import * as React from "react";
import Header from "./Header.jsx";
import Overview from "./Pages/Overview.jsx";


function MarzApp(props) {
    return (
        <div>
            <Header {...props}/>
            <div id="underNavContainer">
                <div id="sidebar">

                </div>
                <div id="afterSideBarContainer">
                    <Overview/>
                </div>
            </div>
        </div>
    )
}

export default MarzApp;