import React from "react";
import * as Enumerable from "linq";
import {templateManager} from "../../Lib/TemplateManager";
import ManagedToggleButton from "../General/ToggleButton/ManagedToggleButton";

class Templates extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                {
                    Enumerable.from(templateManager.getOriginalTemplates()).select((t, i) => {
                        return (
                            <div className="lined bottom-spacing" key={i}>
                                <div className="top-bar more">
                                    <strong className="alignTop">Template ID: {t.id}</strong>
                                    <p className="alignTop">{t.name},  &Aring;: {
                                        t
                                            .start_lambda_linear.toFixed(1)
                                    } &rarr; {t.end_lambda_linear.toFixed(1)}</p>
                                    <ManagedToggleButton
                                        className="templateSwitch"
                                        value={t.inactive}
                                        on={"On"}
                                        off={"Off"}
                                        handle={"Active"}
                                        size="xs"
                                        offstyle="danger"
                                        onToggle={toggled => activateTemplate(t, toggled)}
                                    />
                                </div>
                                <canvas className="under-bar unselectable more"/>
                            </div>
                        )
                    }).toArray()}
            </div>
        )
    }
}

export default Templates;