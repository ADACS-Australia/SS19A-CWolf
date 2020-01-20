import {PersonalActionTypes, SettingsActionTypes} from "./Actions";
import CookieManager from "../../Lib/CookieManager";
import {defaultFor} from "../../Utils/methods";
import {StoreActionTypes} from "../StoreUtils";
import * as Enumerable from "linq";

class SettingsStore {
    constructor(store) {
        this.store = store;

        this.downloadAutomaticallyCookie = "downloadAutomatically";
        this.saveAutomaticallyCookie = "saveInBackground";
        this.assignAutoQOPsCookie = "assignAutoQOPs";
        this.coreCookie = "numCores";
        this.processTogetherCookie = "processTogether";
        this.numAutomaticCookie = "numAutomatic";
    }

    key() {
        return 'settings';
    }

    getInitialState() {
        return {
            downloadAutomatically: CookieManager.registerCookieValue(this.downloadAutomaticallyCookie, false),
            saveAutomatically: CookieManager.registerCookieValue(this.saveAutomaticallyCookie, true),
            assignAutoQOPs: CookieManager.registerCookieValue(this.assignAutoQOPsCookie, false),
            processTogether: CookieManager.registerCookieValue(this.processTogetherCookie, true),
            numberProcessors: CookieManager.registerCookieValue(this.coreCookie, SettingsStore.getDefaultNumberProcessors()),
            numAutomatic: CookieManager.registerCookieValue(this.numAutomaticCookie, 1),
        }
    }

    reduce(state, action) {
        switch (action.type) {
            case SettingsActionTypes.UPDATE_DOWNLOAD_AUTOMATICALLY:
                CookieManager.setCookie(this.downloadAutomaticallyCookie, action.downloadAutomatically);
                return {
                    ...state,
                    downloadAutomatically: action.downloadAutomatically,
                };

            case SettingsActionTypes.RESET_DOWNLOAD_AUTOMATICALLY:
                return {
                    ...state,
                    downloadAutomatically: CookieManager.setToDefault(this.downloadAutomaticallyCookie),
                };

            case SettingsActionTypes.UPDATE_SAVE_AUTOMATICALLY:
                CookieManager.setCookie(this.saveAutomaticallyCookie, action.saveAutomatically);
                return {
                    ...state,
                    saveAutomatically: action.saveAutomatically,
                };

            case SettingsActionTypes.RESET_SAVE_AUTOMATICALLY:
                return {
                    ...state,
                    saveAutomatically: CookieManager.setToDefault(this.saveAutomaticallyCookie),
                };

            case SettingsActionTypes.UPDATE_ASSIGN_AUTO_QOPS:
                const cookieIt = defaultFor(action.cookieIt, true);
                if (cookieIt) {
                    CookieManager.setCookie(this.assignAutoQOPsCookie, action.assignAutoQOPs);
                }

                this.updateAutoQOPs(action.assignAutoQOPs);

                return {
                    ...state,
                    assignAutoQOPs: action.assignAutoQOPs,
                };

            case SettingsActionTypes.RESET_ASSIGN_AUTO_QOPS:
                const qop_value = CookieManager.setToDefault(this.assignAutoQOPsCookie);
                this.updateAutoQOPs(qop_value);
                return {
                    ...state,
                    assignAutoQOPs: qop_value
                };

            case SettingsActionTypes.UPDATE_PROCESS_TOGETHER:
                CookieManager.setCookie(this.processTogetherCookie, action.processTogether);
                this.updateProcessTogether(action.processTogether);
                return {
                    ...state,
                    processTogether: action.processTogether,
                };

            case SettingsActionTypes.RESET_PROCESS_TOGETHER:
                const number_processors_value = CookieManager.setToDefault(this.coreCookie);
                this.updateNumberProcessors(number_processors_value);
                return {
                    ...state,
                    numberProcessors: number_processors_value
                };

            case SettingsActionTypes.UPDATE_NUMBER_PROCESSORS:
                let processor_count = action.numberProcessors;
                if (processor_count < 1) {
                    processor_count = 1;
                } else if (processor_count > 32) {
                    processor_count = 32;
                }

                CookieManager.setCookie(this.coreCookie, processor_count);
                this.updateNumberProcessors(processor_count);
                return {
                    ...state,
                    numberProcessors: processor_count,
                };

            case SettingsActionTypes.RESET_NUMBER_PROCESSORS:
                const process_together_value = CookieManager.setToDefault(this.processTogetherCookie);
                this.updateProcessTogether(process_together_value);
                return {
                    ...state,
                    processTogether: process_together_value
                };

            case SettingsActionTypes.UPDATE_NUM_AUTOMATIC:
                let numAutomatic = action.numAutomatic;
                if (numAutomatic < 0) {
                    numAutomatic = 0;
                } else if (numAutomatic > 5) {
                    numAutomatic = 5;
                }

                CookieManager.setCookie(this.numAutomaticCookie, numAutomatic);
                this.updateNumAutomatic(numAutomatic);
                return {
                    ...state,
                    numAutomatic: numAutomatic
                };

            case SettingsActionTypes.RESET_NUM_AUTOMATIC:
                const numAutomaticValue = CookieManager.setToDefault(this.numAutomaticCookie);
                this.updateNumAutomatic(numAutomaticValue);
                return {
                    ...state,
                    numAutomatic: numAutomaticValue
                };

            case StoreActionTypes.STORE_READY:
                // Set the auto QOP value for any spectra
                this.updateAutoQOPs(state.assignAutoQOPs);

                // Set the default process together state
                this.updateProcessTogether(state.processTogether);

                // Set the default number of processors
                this.updateNumberProcessors(state.numberProcessors);

                // Set the default number of automatic
                this.updateNumAutomatic(state.numAutomatic);
                return state;

            default:
                return state;
        }
    }

    static getDefaultNumberProcessors() {
        let defaultValue = 2;
        try {
            if (navigator != null && navigator.hardwareConcurrency != null) {
                defaultValue = navigator.hardwareConcurrency - 1;
            }
        } catch (err) {
            log.warn("Could not fetch navigator.hardwareConcurrency");
        }

        return defaultValue;
    }

    updateAutoQOPs(value) {
        Enumerable.from(this.store.getState().s).forEach((s) => {
            s.data.processorService.spectraManager.spectraManager.setAssignAutoQOPs(value)
        });
    }

    updateProcessTogether(value) {
        Enumerable.from(this.store.getState().s).forEach((s) => {
            s.data.processorService.processorManager.setProcessTogether(value)
        });
    }

    updateNumberProcessors(value) {
        Enumerable.from(this.store.getState().s).forEach((s) => {
            s.data.processorService.processorManager.setNumberProcessors(value)
        });
    }

    updateNumAutomatic(value) {
        Enumerable.from(this.store.getState().s).forEach((s) => {
            s.data.resultsManager.resultsGenerator.setNumAutomatic(value)
        });
    }
}

export default SettingsStore;