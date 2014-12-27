/**
 * Created by jovinbm on 12/26/14.
 */
var routes = require('./../routes');

var consoleLogger = function (data) {
    console.log(data);
};

module.exports = {
    checkIfLoggedIn: function (req) {
        consoleLogger("s.checkIfLoggedIn: Function 'checkIfLogged' called");
        if (req.session.loggedInStatus == 1) {
            return true;
        } else {
            return false;
        }
    },

    checkIfLoggedOut: function (req) {
        consoleLogger("s.checkIfLoggedOut: Function 'checkIfLoggedIn' called");
        if (req.session.loggedInStatus == 0) {
            return true;
        } else {
            return false;
        }
    },

    toggleLoggedInSession: function (req, status) {
        consoleLogger('s.toggleLoggedInSession: Function "toggleLoggedInSession" called');
        req.session.loggedInStatus = status;
        consoleLogger('s.toggleLoggedInSession: req.session.loggedInStatus = ' + req.session.loggedInStatus);
    }
};