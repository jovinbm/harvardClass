var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var logout_handler = require('../handlers/logout_handlers.js');

var receivedLogger = function (module) {
    var rL = require('../functions/basic.js').receivedLogger;
    rL('logout_api', module);
};

var successLogger = function (module, text) {
    var sL = require('../functions/basic.js').successLogger;
    return sL('logout_api', module, text);
};

var errorLogger = function (module, text, err) {
    var eL = require('../functions/basic.js').errorLogger;
    return eL('logout_api', module, text, err);
};

module.exports = {
    logoutClient: function (req, res) {
        var module = 'logoutClient';
        receivedLogger(module);
        logout_handler.logoutClient(req, res);
    }
};