class CookieManager {
    constructor()
    {
    }

    getCookie(property) {
        const vals = JSON.parse(localStorage.getItem('marz_vals')) || {};
        return vals[property];
    };

    saveCookie(property, value) {
        const vals = JSON.parse(localStorage.getItem('marz_vals')) || {};
        vals[property] = value;
        localStorage.setItem('marz_vals', JSON.stringify(vals));
    };

    setCookie(property, value) {
        try {
            this.saveCookie(property, value);
        } catch (err) {
            console.log("Error saving cookie " + property + ": " + err.message);
        }
    };
    
    registerCookieValue(property, defaultValue) {
        const defaults = JSON.parse(localStorage.getItem('marz_defaults')) || {};
        defaults[property] = defaultValue;
        localStorage.setItem('marz_defaults', JSON.stringify(defaults));

        let value = null;
        try {
            value = this.getCookie(property);
        } catch (err) {
            console.log("Error getting cookie " + property)
        }

        this.setCookie(property, value == null ? defaultValue : value);
        return this.getCookie(property);
    };
    
    setToDefault(property) {
        const defaults = JSON.parse(localStorage.getItem('marz_defaults')) || {};

        this.setCookie(property, defaults[property]);

        return defaults[property];
    };
}

export default new CookieManager();