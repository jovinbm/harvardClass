var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;

var receivedLogger = function (module) {
    var rL = require('../functions/basic.js').receivedLogger;
    rL('logout_handler', module);
};

var successLogger = function (module, text) {
    var sL = require('../functions/basic.js').successLogger;
    return sL('logout_handler', module, text);
};

var errorLogger = function (module, text, err) {
    var eL = require('../functions/basic.js').errorLogger;
    return eL('logout_handler', module, text, err);
};

module.exports = {

    logoutClient: function (req, res) {
        var module = 'logoutClient';
        receivedLogger(module);

        req.logout();
        consoleLogger(successLogger(module));
        res.status(200).send({
            code: 200,
            notify: false,
            redirect: true,
            redirectPage: "/index.html"
        });
    }
};