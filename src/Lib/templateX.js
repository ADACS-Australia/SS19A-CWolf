class TemplateX {
    constructor(name) {
        this.id = null;
        this.name = null;
        this.shift = false;
        this.redshift = null;
        this.start_lambda = null;
        this.end_lambda = null;
        this.z_start = null;
        this.z_end = null;
        this.z_end2 = null;
        this.log_linear = false;
        this.isStar = false;
        this.quasar = false;
        //
        this.weights = {};
        this.spec = [];
    }
    fromDictionary(dict)
    {
        if (dict["id"]) {
            this.id = dict["id"];
        }
        if (dict["name"]) {
            this.name = dict["name"];
        }
        if (dict["shift"]) {
            this.shift = dict["shift"];
        }
        if (dict["redshift"]) {
            this.redshift = dict["redshift"];
        }
        if (dict["start_lambda"]) {
            this.start_lambda = dict["start_lambda"];
        }
        if (dict["end_lambda"]) {
            this.end_lambda = dict["end_lambda"];
        }
        if (dict["z_start"]) {
            this.z_start = dict["z_start"];
        }
        if (dict["z_end"]) {
            this.z_end = dict["z_end"];
        }
        if (dict["z_end2"]) {
            this.z_end2 = dict["z_end2"];
        }
        if (dict["log_linear"]) {
            this.log_linear = dict["log_linear"];
        }
        if (dict["isStar"]) {
            this.isStar = dict["isStar"];
        }
        if (dict["quasar"]) {
            this.quasar = dict["quasar"];
        }

        if (dict["weights"]) {
            this.weights = dict["weights"];
        }
        if (dict["spec"]) {
            this.spec = dict["spec"];
        }
    }
}

export default TemplateX;
