var userDB = require('../db/user_db.js');
var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;

var receivedLogger = function (module) {
    var rL = require('./basic.js').receivedLogger;
    rL('middleware.js', module);
};

var successLogger = function (module, text) {
    var sL = require('./basic.js').successLogger;
    return sL('middleware.js', module, text);
};

var errorLogger = function (module, text, err) {
    var eL = require('./basic.js').errorLogger;
    return eL('middleware.js', module, text, err);
};

module.exports = {

    //authenticates requests
    ensureAuthenticated: function (req, res, next) {
        var module = "ensureAuthenticated";
        consoleLogger(receivedLogger(module));

        if (req.isAuthenticated()) {
            consoleLogger(successLogger(module));
            next();
        } else {
            consoleLogger(errorLogger(module, 'user authentication failed'));
            res.redirect('index.html');
        }
    },

    ensureAuthenticatedAngular: function (req, res, next) {
        var module = "ensureAuthenticatedAngular";
        consoleLogger(receivedLogger(module));
        if (req.isAuthenticated()) {
            consoleLogger(successLogger(module));
            next();
        } else {
            consoleLogger(errorLogger(module, 'user authentication failed'));
            res.status(401).send({
                code: 401,
                notify: true,
                type: 'error',
                banner: true,
                bannerClass: 'alert alert-dismissible alert-warning',
                msg: 'You are not logged in. Please reload page',
                disable: true,
                redirect: true,
                redirectPage: '/index.html'
            });
        }
    },

    addUserData: function (req, res, next) {
        var module = "addUserData";
        consoleLogger(receivedLogger(module));
        userDB.findUserWithUniqueCuid(req.user.uniqueCuid, error, error, success);

        function success(userData) {
            if (req.customData) {
                req.customData.theUser = userData;
            } else {
                req.customData = {};
                req.customData.theUser = userData;
            }
            consoleLogger(successLogger(module));
            next();
        }

        function error(status, err) {
            consoleLogger(errorLogger(module, 'error retrieving user data', err));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'error',
                msg: 'An error occurred while retrieving your personalized info. Please reload the page'
            });
        }
    },

    checkUserIsAdmin: function (req, res, next) {
        var module = "checkUserIsAdmin";

        if (req.customData.theUser.isAdmin == 'yes') {
            consoleLogger(successLogger(module));
            next();
        } else {
            consoleLogger(errorLogger(module, 'User is not admin'));
            res.status(401).send({
                code: 401,
                banner: true,
                bannerClass: 'alert alert-dismissible alert-warning',
                msg: 'Authorization required. Please reload page to log in'
            });
        }
    }
};