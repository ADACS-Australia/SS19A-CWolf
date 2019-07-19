import React from "react";
import ToggleButton from "../General/ToggleButton/ToggleButton";
import ManagedToggleButton from "../General/ToggleButton/ManagedToggleButton";
import {setProcessed} from "../../Stores/UI/Actions";
import {
    resetToDefaults,
    updateAssignAutoQOPs,
    updateDownloadAutomatically, updateNumAutomatic,
    updateNumberProcessors,
    updateProcessTogether, updateSaveAutomatically
} from "../../Stores/Settings/Actions";

class Settings extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="usage">
                <div className="bs-callout bs-callout-warning">
                    <h4>Use caution</h4>
                    <p>Most settings should not need to be changed. Changing settings are always reversible, but
                        clearing saves are not.</p>
                </div>
                <div className="h1group lined">
                    <h1>User Settings</h1>
                    <hr/>
                    <form className="form-horizontal">
                        <div className="form-group">
                            <div className="form-group cb">
                                <label htmlFor="auto" className="col-sm-3 control-label">Assign AutoQOPs</label>
                                <div className="col-sm-9">
                                    <ManagedToggleButton
                                        value={this.props.settings.assignAutoQOPs}
                                        on={"On"}
                                        off={"Off"}
                                        handle={" "}
                                        size="xs"
                                        offstyle="secondary"
                                        onToggle={toggled => updateAssignAutoQOPs(toggled)}
                                    />
                                </div>
                            </div>
                            <div className="form-group cb">
                                <label htmlFor="download" className="col-sm-3 control-label">Download
                                    Automatically</label>
                                <div className="col-sm-9">
                                    <ManagedToggleButton
                                        value={this.props.settings.downloadAutomatically}
                                        on={"On"}
                                        off={"Off"}
                                        handle={" "}
                                        size="xs"
                                        offstyle="secondary"
                                        onToggle={toggled => updateDownloadAutomatically(toggled)}
                                    />
                                    <p className="settings-p">Recommended
                                        to be checked when Assign AutoQOPs is enabled.</p>
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="cores" className="col-sm-3 control-label">Number of processors to
                                    use</label>
                                <div className="col-sm-9">
                                    <input type="number" className="form-control settings-input"
                                           id="cores" min="1"
                                           max="64" required={true}
                                           onChange={e => updateNumberProcessors(e.target.value)}
                                           value={this.props.settings.numberProcessors}
                                    />
                                    <p className="settings-p">Recommended to set to number of cores - 1</p>
                                </div>
                            </div>
                            <div className="form-group cb">
                                <label htmlFor="together" className="col-sm-3 control-label">Process and Match
                                    together</label>
                                <div className="col-sm-9">
                                    <ManagedToggleButton
                                        value={this.props.settings.processTogether}
                                        on={"On"}
                                        off={"Off"}
                                        handle={" "}
                                        size="xs"
                                        offstyle="secondary"
                                        onToggle={toggled => updateProcessTogether(toggled)}
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                    <h1>Program Settings</h1>
                    <hr/>
                    <form className="form-horizontal">
                        <div className="form-group cb">
                            <label htmlFor="saveauto" className="col-sm-3 control-label">Save results in
                                background</label>
                            <div className="col-sm-9">
                                <ManagedToggleButton
                                    value={this.props.settings.saveAutomatically}
                                    on={"On"}
                                    off={"Off"}
                                    handle={" "}
                                    size="xs"
                                    offstyle="secondary"
                                    onToggle={toggled => updateSaveAutomatically(toggled)}
                                />
                                <p className="settings-p">Unless
                                    you have VERY good reasons, do NOT disable this.</p>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="cores" className="col-sm-3 control-label">Number of automatic results to
                                output in <code>.mz</code> files</label>
                            <div className="col-sm-9">
                                <input type="number" className="form-control settings-input"
                                       value={this.props.settings.numAutomatic}
                                       id="numAuto" min="0"
                                       max="5" required={true} onChange={e => updateNumAutomatic(e.target.value)} />
                                    <p className="settings-p">Must
                                        not exceed 5. Setting to zero means no automatic results are output.</p>
                            </div>
                        </div>
                    </form>
                    <button className="btn btn-primary" onClick={() => resetToDefaults()}>Reset settings to defaults</button>
                </div>
                <div className="h1group lined">
                    <h1>Saved Results</h1>
                    <hr/>
                    <p>Be careful with these buttons. They are not reversible, and if you haven't downloaded your
                        results, you will lose work.</p>
                    <p>
                        TODO: How do we want to clear individual files now that we can load multiple?
                    </p>
                    {/*<button className="btn btn-warning clear" ng-if="fileLoaded()"*/}
                    {/*        onClick={() => clearCurrentFile()} tooltip="Cleared!" tooltip-trigger="focus"*/}
                    {/*        tooltip-placement="bottom">Clear ALL results for ALL files*/}
                    {/*</button>*/}
                    <button className="btn btn-danger" onClick={() => clearAll()} tooltip="Cleared!" tooltip-trigger="focus"
                            tooltip-placement="bottom">Clear all internally saved results for ALL files
                    </button>
                </div>
            </div>
        )
    }
}

export default Settings;