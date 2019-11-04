class LocalStorageManager {
    constructor(store, index) {
        this.store = store;
        this.index = index;

        if (LocalStorageManager.supportsLocalStorage()) {
            this.active = true;
            LocalStorageManager.purgeOldStorage();
        } else {
            this.active = false;
            alert('Your browser does not support local storage. Please use another browser.')
        }
    }

    getData() {
        return this.store.getState().getData();
    }

    static purgeOldStorage() {
        let ratio = decodeURIComponent(JSON.stringify(localStorage)).length / (5 * 1024 * 1024);
        if (ratio > 0.85) {
            console.log('Pruning local storage. Currently at ' + Math.ceil(ratio*100) + '%');
            const dates = [];
            for (let i = 0; i < localStorage.length; i++) {
                dates.push(JSON.parse(localStorage[localStorage.key(i)])[0]);
            }
            dates.sort();
            const mid = dates[Math.floor(dates.length / 2)];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (JSON.parse(localStorage[key])[0] <= mid) {
                    localStorage.removeItem(key);
                }
            }
            ratio = decodeURIComponent(JSON.stringify(localStorage)).length / (5 * 1024 * 1024);
            console.log('Pruned local storage. Currently at ' + Math.ceil(ratio*100) + '%');
        }
    };

    static supportsLocalStorage() {
        try {
            const value = 'localStorage' in window && window['localStorage'] !== null;
            if (value) {
                try {
                    localStorage.setItem('localStorage', 1);
                    localStorage.removeItem('localStorage');
                    return true;
                } catch (e) {
                    Storage.prototype._setItem = Storage.prototype.setItem;
                    Storage.prototype.setItem = () => {};
                    Storage.prototype._getItem = Storage.prototype.getItem;
                    Storage.prototype.getItem = () => {};
                    console.warn('Your web browser does not support storing settings locally. In Safari, the most common cause of this is using "Private Browsing Mode". Some settings may not save or some features may not work properly for you.');
                    return false;
                }
            }
        } catch (e) {
            console.warn('Local storage is not available.');
            return false;
        }
    };

    static getKeyFromSpectra(spectra) {
        let v = "";
        if (spectra.version !== "1.0.0") {
            v = spectra.version.substring(0, spectra.version.lastIndexOf("."));
        }
        return v + spectra.filename + spectra.name;
    };

    clearFile() {
        const filename = this.getData().fitsFileName;
        console.log("Clearing", filename);
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.indexOf(filename, 0) !== -1) {
                localStorage.removeItem(key);
                i--;
            }
        }
    }

    static clearAll() {
        // todo: This will also clear any non spectra local storage settings such as initials
        console.log("All storage cleared");
        localStorage.clear();
    }

    saveSpectra(spectra, resultsManager) {
        if (!this.active) return;
        const key = LocalStorageManager.getKeyFromSpectra(spectra);
        const val = [resultsManager.getLocalStorageResult(spectra)];
        if (val[0]['qop'] !== 0) {
            val.unshift(Date.now());
            localStorage[key] = JSON.stringify(val);
        }
    };

    loadSpectra(spectra) {
        if (!this.active) return null;
        const key = LocalStorageManager.getKeyFromSpectra(spectra);
        let val = localStorage[key];
        if (val != null) {
            val = JSON.parse(val)[1];
        }
        return val;
    }

    setActive(val) {
        this.active = val;
    }
}

export default LocalStorageManager;