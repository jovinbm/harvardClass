module.exports = {

    // this function just prints on the console
    consoleLogger: function (data) {
        console.log(data);
    },

    receivedLogger: function (filename, module) {
        console.log(filename + ": " + module + " RECEIVED");
    },

    successLogger: function (filename, module, text) {
        if (text) {
            return "SUCCESS: " + filename + ": " + module + ": " + text;
        } else {
            return "SUCCESS: " + filename + ": " + module;
        }
    },

    errorLogger: function (filename, module, text, err) {
        if (text) {
            if (err) {
                return "ERROR: " + filename + ": " + module + ": " + text + ": err = " + err;
            } else {
                return "ERROR: " + filename + ": " + module + ": " + text + ":";
            }
        } else {
            if (err) {
                return "ERROR: " + filename + ": " + module + ": err = " + err;
            } else {
                return "ERROR: " + filename + ": " + module + ":";
            }
        }
    }
};