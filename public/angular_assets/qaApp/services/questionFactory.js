/**
 * Created by jovinbm on 1/19/15.
 */
angular.module('qaApp')
    .factory('questionService', ['$http', '$rootScope', 'socket', 'socketService', 'globals', 'detailStorage', function ($http, $rootScope, socket, socketService, globals, detailStorage) {
        var alerts = {
            newQuestionAlert: {
                type: 'info',
                num: 0,
                display: false
            },
            saved: {
                type: 'info',
                msg: "Saved!"
            }
        };

        socket.on('newQuestion', function (questionObject) {
            console.log("'newQuestion' event received factory");
            globals.questionActivity(true);
            globals.currentQuestionIndex(questionObject.index);
            detailStorage.add(questionObject["question"], true);
            globals.currentQuestions(questionObject["question"]);
            if (questionObject.update == false) {
                alerts.newQuestionAlert.num++;
                alerts.newQuestionAlert.display = true;
            }
            $rootScope.$broadcast('alertStorage', alerts);
            $rootScope.$broadcast('currentQuestions', globals.currentQuestions());
        });

        return {

            alertStorage: function (key, newAlert) {
                if (key && newAlert) {
                    alerts[key] = newAlert;
                    return alerts[key];
                } else if (key) {
                    return alerts[key];
                } else {
                    return alerts;
                }
            },

            getQuestions: function (currentQuestionIndexObject) {
                return $http.post('/api/getQuestions', currentQuestionIndexObject);
            },

            retrieveQuestion: function (index) {
                return $http.post('/api/retrieveQuestion', {"index": index});
            },

            postQuestion: function (questionObject) {
                var shortQuestion = "";
                //trim 130 characters to be used for top voted
                if (questionObject.theQuestion.length > 130) {
                    for (var i = 0; i < 130; i++) {
                        shortQuestion = shortQuestion + questionObject.theQuestion[i];
                    }
                    shortQuestion = shortQuestion + "...";
                } else {
                    shortQuestion = questionObject.theQuestion;
                }
                var questionToDatabase = {
                    "heading": questionObject.theHeading,
                    "question": questionObject.theQuestion,
                    "shortQuestion": shortQuestion
                };
                return $http.post('/api/newQuestion', questionToDatabase);
            },

            postEditedQuestion: function (questionObject) {
                var shortQuestion = "";
                //trim 130 characters to be used for top voted
                if (questionObject["question"].length > 130) {
                    for (var i = 0; i < 130; i++) {
                        shortQuestion = shortQuestion + questionObject["question"][i];
                    }
                    shortQuestion = shortQuestion + "...";
                } else {
                    shortQuestion = questionObject["question"];
                }
                questionObject["shortQuestion"] = shortQuestion;
                return $http.post('/api/updateQuestion', questionObject);
            },

            postQuestionVote: function (upvoteIndex, inc) {
                var upvoteToDatabase = {
                    "upvoteIndex": upvoteIndex,
                    "inc": inc
                };
                return $http.post('/api/upvote', upvoteToDatabase);
            }
        }
    }]);