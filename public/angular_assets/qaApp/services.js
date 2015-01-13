/**
 * Created by jovinbm on 1/10/15.
 */
angular.module('qaApp')
    .factory('socket', ['$location', '$rootScope', function ($location, $rootScope) {
        var socket = io.connect($location.host());
        //return socket;
        return {
            on: function (eventName, callback) {
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },

            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                })
            }
        }
    }])


    .factory('socketRoom', ['$http', function ($http) {
        return {
            getMyRoom: function () {
                return $http.get('/api/getMyRoom');
            }
        }
    }])


    .factory('initializer', ['$http', function ($http) {
        return {
            ready: function () {
                return $http.post('/api/ready');
            },

            getHistory: function (currentQuestionIndexObject) {
                return $http.post('/api/getHistory', currentQuestionIndexObject);
            }
        }
    }])


    .factory('globals', [function () {
        var myCustomUsername;
        var mySocketRoom;
        var questionFeedDate;
        var usersOnline = {};

        /*myUpvotedIndexes is an array storing button indexes corresponding to all the questions this client has upvoted. It should be updated on every start and when the topVoted function is called*/
        var myUpvotedIndexes = [];

        /*currentQuestionIndex stores the current question index. The initial value is -1
         because the server queries results greater than -1 i.e. $gt -1 means from 0 onwards*/
        var currentQuestionIndex = -1;

        //these returned functions 'set' the variables if passed arguments, else they return the variables
        return {
            customUsername: function (newCustomUsername) {
                if (newCustomUsername) {
                    myCustomUsername = newCustomUsername;
                } else {
                    return myCustomUsername;
                }
            },

            socketRoom: function (newSocketRoom) {
                if (newSocketRoom) {
                    mySocketRoom = newSocketRoom;
                } else {
                    return mySocketRoom;
                }
            },

            questionFeedDate: function (newQuestionFeedDate) {
                if (newQuestionFeedDate) {
                    questionFeedDate = newQuestionFeedDate;
                } else {
                    return questionFeedDate;
                }
            },

            upvotedIndexes: function (newUpvotedIndexes) {
                if (newUpvotedIndexes) {
                    myUpvotedIndexes = newUpvotedIndexes;
                } else {
                    return myUpvotedIndexes;
                }
            },

            usersOnline: function (newUsersOnline) {
                if (newUsersOnline) {
                    usersOnline = newUsersOnline;
                } else {
                    return usersOnline;
                }
            },

            currentQuestionIndex: function (newCurrentQuestionIndex) {
                if (newCurrentQuestionIndex) {
                    currentQuestionIndex = newCurrentQuestionIndex;
                } else {
                    return currentQuestionIndex;
                }
            }
        }
    }])


    .factory('detailStorage', ['globals', function (globals) {
        var detailPrototype = {};
        return {
            add: function (questionArray) {
                questionArray.forEach(function (questionObject) {
                    var temp = {};
                    //change time-string from mongodb to actual time
                    var mongoDate = new Date(questionObject.timeAsked);
                    //temp.questionTime = mongoDate.getHours() + ":" + mongoDate.getMinutes();
                    temp.questionTime = mongoDate.toDateString() + " " + mongoDate.toLocaleTimeString();

                    var myUpvotedIndexes = globals.upvotedIndexes();
                    var questionIndex = questionObject.questionIndex;
                    var questionClass = "a" + questionIndex;
                    temp.questionIndex = questionIndex;
                    temp.questionClass = questionClass;

                    function searchArrayIfExists(name, theArray) {
                        return (theArray.indexOf(name) > -1)
                    }

                    /*if already updated, insert a new button class with a btn-warning class, and a disabled attribute*/
                    if (searchArrayIfExists(questionIndex, myUpvotedIndexes)) {
                        temp.buttonClass = questionClass + "b" + " btn btn-warning btn-xs upvote";
                        temp.ifDisabled = true;
                    } else {
                        temp.buttonClass = questionClass + "b" + " btn btn-info btn-xs upvote";
                        temp.ifDisabled = false;
                    }

                    detailPrototype[questionIndex] = temp;
                });

                return detailPrototype;
            },

            updateReferenceIndexes: function () {
                //check first that the detailPrototype is not empty
                if (Object.keys(detailPrototype).length !== 0) {
                    var currentIndexes = globals.upvotedIndexes();
                    currentIndexes.forEach(function (index) {
                        detailPrototype[index].buttonClass = "a" + index + "b" + " btn btn-warning btn-xs upvote";
                        detailPrototype[index].ifDisabled = true;
                    });
                }
                return detailPrototype;
            },


            disableButton: function (index) {
                //disable button by updating the detailPrototype
                detailPrototype[index].ifDisabled = true;
                detailPrototype[index].buttonClass = "a" + index + "b" + " btn btn-warning btn-xs upvote";
                return detailPrototype;
            }
        }
    }])


    .factory('userQuestions', ['$http', function ($http) {
        return {
            postQuestion: function (questionString) {
                var shortQuestion = "";
                //trim 130 characters to be used for top voted
                if (questionString.length > 130) {
                    for (var i = 0; i < 130; i++) {
                        shortQuestion = shortQuestion + questionString[i];
                    }
                    shortQuestion = shortQuestion + "...";
                } else {
                    shortQuestion = questionString;
                }
                var questionToDatabase = {
                    "question": questionString,
                    "shortQuestion": shortQuestion
                };
                return $http.post('/api/newQuestion', questionToDatabase);
            }
        }
    }])


    .factory('upvoteService', ['$http', function ($http) {
        return {
            postUpvote: function (upvoteIndex) {
                var upvoteToDatabase = {
                    "upvoteIndex": upvoteIndex,
                };
                return $http.post('/api/newUpvote', upvoteToDatabase);
            }
        }
    }])


    .factory('logoutService', ['$http', function ($http) {
        return {
            logoutCustomChat: function () {
                return $http.post('/api/logoutCustomChat');
            },

            logoutHarvardChat: function () {
                return $http.post('/api/logoutHarvardChat');
            },

            logoutHarvardLogin: function () {
                return $http.post('/api/logoutHarvardLogin');
            }
        }
    }])