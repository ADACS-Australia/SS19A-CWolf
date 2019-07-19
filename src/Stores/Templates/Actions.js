import AppDispatcher from "../AppDispatcher";

const TemplateActionTypes = {
    ACTIVATE: 'TemplateActionTypes.ACTIVATE',
};

function activateTemplate(template) {
    AppDispatcher.dispatch({
        type: TemplateActionTypes.ACTIVATE,
        template: template
    })
}

export {
    activateTemplate,
    TemplateActionTypes
};