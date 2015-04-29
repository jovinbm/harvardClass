var userDB = require('../db/user_db.js');
var basic = require('../functions/basic.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var path = require('path');

var receivedLogger = function (module) {
    var rL = require('./basic.js').receivedLogger;
    rL('forms.js', module);
};

var successLogger = function (module, text) {
    var sL = require('./basic.js').successLogger;
    return sL('forms.js', module, text);
};

var errorLogger = function (module, text, err) {
    var eL = require('./basic.js').errorLogger;
    return eL('forms.js', module, text, err);
};

function getTheUser(req) {
    return req.customData.theUser;
}

var usernameRegex = /^[a-zA-Z0-9_]*$/;
var emailRegex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
var passwordRegex = /^[a-zA-Z0-9_]*$/;

module.exports = {
    validateRegistrationForm: function (req, res, firstName, lastName, username, email, password1, password2, success) {
        var errors = 0;

        //check the firstName
        if (firstName.length > 30 && errors == 0) {
            consoleLogger("YES");
            error('First name should have at most 30 characters');
            ++errors;
        }
        if (firstName.length < 2 && errors == 0) {
            error('First name should have at least 2 characters');
            ++errors;
        }

        //check the lastName
        if (lastName.length > 30 && errors == 0) {
            ++errors;
            error('Last name should have at most 30 characters');
        }
        if (lastName.length < 2 && errors == 0) {
            ++errors;
            error('Last name should have at least 2 characters');
        }

        //check the username
        if (!(usernameRegex.test(username)) && errors == 0) {
            ++errors;
            error('Please enter a valid username. Only letters, numbers and underscores allowed');
        }
        if (username.length > 10 && errors == 0) {
            ++errors;
            error('Username should have at most 10 characters');
        }
        if (username.length < 4 && errors == 0) {
            ++errors;
            error('Username should have at least 2 characters');
        }

        //check the email
        if (!(emailRegex.test(email)) && errors == 0) {
            ++errors;
            error('Please enter a valid email');
        }

        //check passwords
        if (!(passwordRegex.test(password1)) && errors == 0) {
            ++errors;
            error('Please enter a valid password. Only letters, numbers and underscores allowed');
        }
        if ((password1 != password2) && errors == 0) {
            ++errors;
            error("The passwords you entered don't match");
        }

        if (errors == 0) {
            success(1);
        }

        function error(errorMessage) {
            consoleLogger(errorLogger(module, errorMessage));
            res.status(401).send({
                code: 401,
                registrationBanner: true,
                bannerClass: 'alert alert-dismissible alert-warning',
                msg: errorMessage
            });
        }
    },

    validateUsername: function (req, res, username, success) {
        var errors = 0;

        //check the username
        if (!(usernameRegex.test(username)) && errors == 0) {
            ++errors;
            error('Please enter a valid username. Only letters, numbers and underscores allowed');
        }
        if (username.length > 10 && errors == 0) {
            ++errors;
            error('Username should have at most 10 characters');
        }
        if (username.length < 4 && errors == 0) {
            ++errors;
            error('Username should have at least 4 characters');
        }

        if (errors == 0) {
            success(1);
        }

        function error(errorMessage) {
            consoleLogger(errorLogger(module, errorMessage));
            res.status(401).send({
                code: 401,
                registrationBanner: true,
                bannerClass: 'alert alert-dismissible alert-warning',
                msg: errorMessage
            });
        }
    },

    validatePassword: function (req, res, password, success) {
        var errors = 0;

        //check passwords
        if (!(passwordRegex.test(password)) && errors == 0) {
            ++errors;
            error('Please enter a valid password. Only letters, numbers and underscores allowed');
        }

        if (errors == 0) {
            success(1);
        }

        function error(errorMessage) {
            consoleLogger(errorLogger(module, errorMessage));
            res.status(401).send({
                code: 401,
                registrationBanner: true,
                bannerClass: 'alert alert-dismissible alert-warning',
                msg: errorMessage
            });
        }
    },

    validateContactUs: function (req, res, email, message, success) {
        var errors = 0;

        //check the email
        if (!(emailRegex.test(email)) && errors == 0) {
            ++errors;
            error('Please enter a valid email');
        }

        if (message) {
            if (message.length == 0) {
                ++errors;
                error('Please enter a message');
            }
        } else {
            ++errors;
            error('Please enter a message');
        }

        if (errors == 0) {
            success(1);
        }

        function error(errorMessage) {
            consoleLogger(errorLogger(module, errorMessage));
            res.status(401).send({
                code: 401,
                registrationBanner: true,
                bannerClass: 'alert alert-dismissible alert-warning',
                msg: errorMessage
            });
        }
    },

    passportValidateUsernameAndPassword: function (username, password) {
        var errors = 0;

        //check the username
        if (!(usernameRegex.test(username)) && errors == 0) {
            ++errors;
            error('Please enter a valid username. Only letters, numbers and underscores allowed');
        }
        if (username.length > 10 && errors == 0) {
            ++errors;
            error('Username should have at most 10 characters');
        }
        if (username.length < 4 && errors == 0) {
            ++errors;
            error('Username should have at least 4 characters');
        }

        //check passwords
        if (!(passwordRegex.test(password)) && errors == 0) {
            ++errors;
            error('Please enter a valid password. Only letters, numbers and underscores allowed');
        }

        if (errors == 0) {
            return 1;
        } else {
            return -1;
        }
    }
};