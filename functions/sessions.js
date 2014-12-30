/**
 * Created by jovinbm on 12/26/14.
 */
//functions to manipulate and check sessions

//import modules
var routes = require('./../routes/router.js');
var Question = require("../database/questions/question_model.js");

//define logger
var consoleLogger = function (data) {
    console.log(data);
};

module.exports = {
    //this function checks if a user is logged in. It returns a boolean
    checkIfLoggedIn: function (req) {
        consoleLogger("s.checkIfLoggedIn: Function 'checkIfLogged' called");
        if (req.session.loggedInStatus == 1) {
            return true;
        } else {
            return false;
        }
    },

    //this function checks is a user logged out
    checkIfLoggedOut: function (req) {
        consoleLogger("s.checkIfLoggedOut: Function 'checkIfLoggedIn' called");
        if (req.session.loggedInStatus == 0) {
            return true;
        } else {
            return false;
        }
    },

    //this function toggles the logged in status on the users session object
    toggleLoggedInSession: function (req, status) {
        consoleLogger('s.toggleLoggedInSession: Function "toggleLoggedInSession" called');
        req.session.loggedInStatus = status;
    }
};