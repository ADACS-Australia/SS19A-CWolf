import AppDispatcher from "../AppDispatcher";
import {SettingsActionTypes} from "../Settings/Actions";

const SidebarActionTypes = {
    SET_TYPE_FILTER: "SidebarActionTypes.SET_TYPE_FILTER",
    SET_TEMPLATE_FILTER: "SidebarActionTypes.SET_TEMPLATE_FILTER",
    SET_REDSHIFT_FILTER: "SidebarActionTypes.SET_REDSHIFT_FILTER",
    SET_QOP_FILTER: "SidebarActionTypes.SET_QOP_FILTER"
};

function setFilterType(type) {
    AppDispatcher.dispatch({
        type: SidebarActionTypes.SET_TYPE_FILTER,
        filterType: type
    })
}

function setFilterTemplate(template) {
    AppDispatcher.dispatch({
        type: SidebarActionTypes.SET_TEMPLATE_FILTER,
        filterTemplate: template
    })
}

function setFilterRedshift(redshift) {
    AppDispatcher.dispatch({
        type: SidebarActionTypes.SET_REDSHIFT_FILTER,
        filterRedshift: redshift
    })
}

function setFilterQOP(qop) {
    AppDispatcher.dispatch({
        type: SidebarActionTypes.SET_QOP_FILTER,
        filterQOP: qop
    })
}

export {
    setFilterType,
    setFilterTemplate,
    setFilterRedshift,
    setFilterQOP,
    SidebarActionTypes
};