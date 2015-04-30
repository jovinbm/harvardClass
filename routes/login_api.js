var basic = require('../functions/basic.js');
var forms = require('../functions/forms.js');
var consoleLogger = require('../functions/basic.js').consoleLogger;
var cuid = require('cuid');
var User = require("../database/users/user_model.js");
var userDB = require('../db/user_db.js');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');

var receivedLogger = function (module) {
    var rL = require('../functions/basic.js').receivedLogger;
    rL('login_api', module);
};
var successLogger = function (module, text) {
    var sL = require('../functions/basic.js').successLogger;
    return sL('login_api', module, text);
};
var errorLogger = function (module, text, err) {
    var eL = require('../functions/basic.js').errorLogger;
    return eL('login_api', module, text, err);
};

module.exports = {

    getUserData: function (req, res) {
        var module = 'getUserData';
        receivedLogger(module);

        //check if the user with the uniqueCuid in the request exists
        if (req.isAuthenticated()) {
            userDB.findUserWithUniqueCuid(req.user.uniqueCuid, serverError, serverError, success);
        } else {
            //means this is just a random unregistered visitor
            consoleLogger(successLogger(module));
            res.status(200).send({
                userData: {}
            });
        }

        function success(theSavedUser) {
            req.logIn(theSavedUser, function (err) {
                if (err) {
                    consoleLogger(errorLogger(module, err, err));
                    return res.status(500).send({
                        code: 500,
                        notify: true,
                        type: 'error',
                        msg: "A problem occurred while retrieving your personalized settings. Please reload this page"
                    });
                } else {
                    //remove private data
                    theSavedUser.password = "";
                    consoleLogger(successLogger(module));
                    return res.status(200).send({
                        userData: theSavedUser
                    });
                }
            });
        }

        function serverError() {
            consoleLogger(errorLogger(module));
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'error',
                msg: "A problem occurred while retrieving your personalized settings. Please reload this page"
            });
        }
    },


    localUserLogin: function (req, res, next) {
        var module = 'app.post /localUserLogin';
        receivedLogger(module);
        passport.authenticate('local', function (err, user, info) {

            if (err) {
                return res.status(500).send({
                    code: 500,
                    banner: true,
                    bannerClass: 'alert alert-dismissible alert-warning',
                    msg: info || err
                });
            }
            if (!user) {
                return res.status(401).send({
                    code: 401,
                    banner: true,
                    bannerClass: 'alert alert-dismissible alert-warning',
                    msg: info || err
                });
            }
            req.logIn(user, function (err) {
                if (err) {
                    consoleLogger(errorLogger('req.login', err, err));
                    return res.status(500).send({
                        code: 500,
                        banner: true,
                        bannerClass: 'alert alert-dismissible alert-warning',
                        msg: "A problem occurred when trying to log you in. Please try again"
                    });
                } else {
                    consoleLogger(successLogger(module));
                    var redirectPage = '/index.html';
                    return res.status(200).send({
                        code: 200,
                        msg: "You have successfully logged in",
                        redirect: true,
                        redirectPage: redirectPage
                    });
                }
            });
        })(req, res, next);
    },


    createAccount: function (req, res) {
        var module = "createAccount";

        var invitationCode = req.body.invitationCode;

        if (invitationCode == 'kenyamath' || invitationCode == 'kenyaadmin') {

            var isAdmin = 'no';

            if (invitationCode == 'kenyadmin') {
                isAdmin = 'yes';
            }

            var email = req.body.email;
            var firstName = req.body.firstName;
            var lastName = req.body.lastName;
            var fullName = firstName + " " + lastName;
            var username = req.body.username;
            var password = req.body.password1;
            var uniqueCuid = cuid();


            //this function validates the form and calls formValidated on success
            forms.validateRegistrationForm(req, res, firstName, lastName, username, email, password, req.body.password2, formValidated);

            function formValidated() {
                //check that nobody is using that username
                userDB.findUserWithUsername(username, errorFindingUsername, errorFindingUsername, resolveUsernameAvailability);

                //here, the application tries to find the username given. If it exists, then the function return (-1,theUser),
                // theUser being theUser with the wanted username. This means that the username is already taken this the user should be notified

                function errorFindingUsername(status, err) {
                    consoleLogger(errorLogger(module, 'Could not retrieve user', err));
                    res.status(401).send({
                        code: 401,
                        registrationBanner: true,
                        bannerClass: 'alert alert-dismissible alert-warning',
                        msg: 'Failed to create your account. Please try again'
                    });
                }

                function resolveUsernameAvailability(status, retrievedUser) {
                    //1 means username is already in use, -1 means the new user can use the username
                    if (status == -1) {
                        consoleLogger(errorLogger(module, 'username entered is already in use'));

                        //means it's a different user wanting a username that's already in use. notify the user
                        res.status(401).send({
                            code: 401,
                            registrationBanner: true,
                            bannerClass: 'alert alert-dismissible alert-warning',
                            msg: 'The username you entered is already in use. Please choose a different one'
                        });

                    } else {
                        //means username is available
                        usernameAvailable();
                    }

                    function usernameAvailable() {

                        //hash the user's password
                        bcrypt.hash(password, 10, function (err, hash) {
                            if (err) {
                                consoleLogger(errorLogger(module, 'error hashing password', err));
                                res.status(401).send({
                                    code: 401,
                                    registrationBanner: true,
                                    bannerClass: 'alert alert-dismissible alert-warning',
                                    msg: 'We could create your account. Please check your details and try again'
                                });
                            } else {
                                continueWithHashedPassword(hash);
                            }
                        });

                        function continueWithHashedPassword(hashedPassword) {

                            var theUser = new User({
                                email: email,
                                firstName: firstName,
                                lastName: lastName,
                                username: username,
                                password: hashedPassword,
                                uniqueCuid: uniqueCuid,
                                isRegistered: "yes",
                                isAdmin: isAdmin
                            });

                            //log this user into session
                            req.logIn(theUser, function (err) {
                                if (err) {
                                    consoleLogger(errorLogger('req.login', err, err));
                                    error();
                                } else {
                                    //save the new user
                                    userDB.saveUser(theUser, error, error, successSave);
                                }
                            });


                            function successSave() {
                                res.status(200).send({
                                    code: 200,
                                    redirect: true,
                                    redirectPage: '/index.html'
                                });

                                //send a welcome email
                                //emailModule.sendWelcomeEmail(theUser);
                            }
                        }
                    }

                    function error() {
                        //log the user out
                        if (req.isAuthenticated()) {
                            req.logout();
                        }
                        res.status(401).send({
                            code: 401,
                            registrationBanner: true,
                            bannerClass: 'alert alert-dismissible alert-warning',
                            msg: 'We could not create your account. Please check your details and try again'
                        });
                    }
                }
            }
        } else {

            res.status(401).send({
                code: 401,
                registrationBanner: true,
                bannerClass: 'alert alert-dismissible alert-warning',
                msg: 'It seems like you have entered a wrong invitation code. Please check and try again'
            });
        }
    }
};