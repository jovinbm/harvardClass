var email = require("emailjs");
var basic = require('../functions/basic.js');
var basic_handlers = require('../handlers/basic_handlers.js');
var userDB = require('../db/user_db.js');


module.exports = {
    getSocketRoom: function (req, res) {
        function error(status, err) {
            if (status == -1 || status == 0) {
                res.status(500).send({msg: "ERROR: getMyRoomGET: Could not retrieve user:"});
                basic.consoleLogger("ERROR: getMyRoomGET: Could not retrieve user: " + err);
            }
        }

        function success(theUser) {
            if (theUser.customLoggedInStatus == 1) {
                res.send({
                    socketRoom: theUser.socketRoom,
                    customUsername: theUser.customUsername,
                    uniqueCuid: theUser.uniqueCuid
                });
            }
            //TODO -- redirect to custom login
        }

        userDB.findUser(req.user.id, error, error, success);
    },


    startUp: function (req, res) {
        basic.consoleLogger('STARTUP event received');
        function error(status, err) {
            if (status == -1 || status == 0) {
                res.status(500).send({msg: 'readyPOST: Could not retrieve user', err: err});
                basic.consoleLogger("ERROR: readyPOST: Could not retrieve user: " + err);
            }
        }

        function success(theUser) {
            if (theUser.customLoggedInStatus == 1) {
                basic_handlers.startUp(req, res, theUser);
            }
            //TODO -- redirect to custom login
        }

        userDB.findUser(req.user.id, error, error, success);
    },


    reconnect: function (req, res) {
        basic.consoleLogger('RECONNECT event received');
        var page = req.body.page;

        function error(status, err) {
            if (status == -1 || status == 0) {
                res.status(500).send({msg: 'reconnectPOST: Could not retrieve user', err: err});
                basic.consoleLogger("ERROR: reconnectPOST: Could not retrieve user: " + err);
            }
        }

        function success(theUser) {
            if (theUser.customLoggedInStatus == 1) {
                basic_handlers.reconnect(req, res, theUser, page);
            }
            //TODO -- redirect to custom login
        }

        userDB.findUser(req.user.id, error, error, success);
    }
};