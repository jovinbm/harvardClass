/**
 * Created by jovinbm on 12/25/14.
 */
//import modules
var basic = require('../functions/basic.js');
var ioJs = require('../functions/io.js');
var online = require('../functions/online.js');
var questionDB = require('../db/question_db.js');

//define and export all the event handlers
module.exports = {

    startUp: function (req, res, theHarvardUser) {
        basic.consoleLogger('startUp: STARTUP handler called');
        var limit = 30;
        ioJs.emitToAll("usersOnline", online.getUsersOnline());

        var temp = {};
        temp['upvotedIndexes'] = theHarvardUser.votedQuestionIndexes;
        temp['uniqueCuid'] = theHarvardUser.uniqueCuid;
        //get some Questions

        function getQuestionsErr(status, err) {
            if (status == -1) {
                basic.consoleLogger("startUp handler: GetQuestions: Error while retrieving home details" + err);
                res.status(500).send({msg: 'startUp: GetQuestions: Error while retrieving home details', err: err});
                basic.consoleLogger('startUp: failed!');
            } else if (status == 0) {
                temp['questionsArray'] = [];
                temp['currentQuestionIndex'] = 0;
                basic.consoleLogger('startUp: Did not find any questions, continuing');
                getTop();
            }
        }

        function getTopErr(status, err) {
            if (status == -1) {
                basic.consoleLogger("startUp handler: GetTop: Error while retrieving home details" + err);
                res.status(500).send({msg: 'startUp: GetTop: Error while retrieving home details', err: err});
                basic.consoleLogger('startUp: failed!');
            } else if (status == 0) {
                temp['topVotedArray'] = [];
                basic.consoleLogger('startUp: success: Did not find any top voted');
                done([]);
            }
        }

        function done(topVotedArray) {
            temp['topVotedArray'] = topVotedArray;
            res.status(200).send(temp);
            basic.consoleLogger("StartUp success");
        }

        function getTop() {
            questionDB.findTopVotedQuestions(-1, 10, getTopErr, getTopErr, done);
        }

        function success(questionsArray) {
            temp['questionsArray'] = questionsArray;
            temp['currentQuestionIndex'] = questionsArray.length;
            getTop();
        }

        questionDB.getQuestions(-1, -1, limit, getQuestionsErr, getQuestionsErr, success)
    },


    reconnect: function (req, res, theHarvardUser, currentQuestionIndex) {
        basic.consoleLogger('reconnect: RECONNECT handler called');
        var limit = 30;
        ioJs.emitToOne(theHarvardUser.socketRoom, "usersOnline", online.getUsersOnline());

        var temp = {};
        temp['uniqueCuid'] = theHarvardUser.uniqueCuid;
        temp['upvotedIndexes'] = theHarvardUser.votedQuestionIndexes;
        //get some Questions

        function getQuestionsErr(status, err) {
            if (status == -1) {
                basic.consoleLogger("reconnect handler: getQuestions: Error while retrieving home details" + err);
                res.status(500).send({msg: 'reconnect: getQuestions: Error while retrieving home details', err: err});
                basic.consoleLogger('reconnect: failed!');
            } else if (status == 0) {
                temp['questionsArray'] = [];
                basic.consoleLogger('reconnect: Did not find any questions, continuing');
                getTop();
            }
        }

        function getTopErr(status, err) {
            if (status == -1) {
                basic.consoleLogger("reconnect handler: GetTop: Error while retrieving home details" + err);
                res.status(500).send({msg: 'reconnect: GetTop: Error while retrieving home details', err: err});
                basic.consoleLogger('reconnect: failed!');
            } else if (status == 0) {
                temp['topVotedArray'] = [];
                basic.consoleLogger('reconnect: success: Did not find any top voted');
                done([]);
            }
        }

        function done(topVotedArray) {
            temp['topVotedArray'] = topVotedArray;
            res.status(200).send(temp);
            basic.consoleLogger("reconnect success");
        }

        function getTop() {
            questionDB.findTopVotedQuestions(-1, 10, getTopErr, getTopErr, done);
        }

        function success(questionsArray) {
            temp['questionsArray'] = questionsArray;
            temp['currentQuestionIndex'] = questionsArray.length;
            getTop();
        }

        questionDB.getQuestions(-1, currentQuestionIndex, limit, getQuestionsErr, getQuestionsErr, success)
    }


};