/**
 * Created by jovinbm on 1/19/15.
 */
angular.module('qaApp')


    .factory('globals', ['$rootScope', function ($rootScope) {
        var myCustomUsername;
        var myUniqueCuid;
        var mySocketRoom;
        var usersOnline = {};
        var currentQuestions = {};
        var currentTop = [];
        var upvotedIndexes = [];
        var currentQuestionIndex = -1;

        return {
            customUsername: function (newCustomUsername) {
                if (newCustomUsername) {
                    myCustomUsername = newCustomUsername;
                    return myCustomUsername;
                } else {
                    return myCustomUsername;
                }
            },

            uniqueCuid: function (newUniqueCuid) {
                if (newUniqueCuid) {
                    myUniqueCuid = newUniqueCuid;
                    return myUniqueCuid;
                } else {
                    return myUniqueCuid;
                }
            },

            socketRoom: function (newSocketRoom) {
                if (newSocketRoom) {
                    mySocketRoom = newSocketRoom;
                } else {
                    return mySocketRoom;
                }
            },

            currentQuestions: function (questionArray, broadcast) {
                if (questionArray) {
                    questionArray.forEach(function (questionObject) {
                        currentQuestions[questionObject.questionIndex] = questionObject;
                    });
                    if (broadcast) {
                        $rootScope.$broadcast('currentQuestions', currentQuestions);
                    }
                    return currentQuestions;
                } else {
                    return currentQuestions;
                }
            },

            upvotedIndexes: function (newUpvotedIndexes) {
                if (newUpvotedIndexes) {
                    upvotedIndexes = newUpvotedIndexes;
                } else {
                    return upvotedIndexes;
                }
            },


            addUpvoted: function (index, broadcast) {
                upvotedIndexes.push(index);
                if (broadcast) {
                    $rootScope.$broadcast('upvotedIndexes', upvotedIndexes);
                }
                return upvotedIndexes;
            },


            currentTop: function (topArray, broadcast) {
                if (topArray) {
                    currentTop = topArray;
                }
                if (broadcast) {
                    $rootScope.$broadcast('currentTop', currentTop);
                }
                return currentTop;
            },


            usersOnline: function (newUsersOnline) {
                if (newUsersOnline) {
                    usersOnline = newUsersOnline;
                    return usersOnline;
                } else {
                    return usersOnline;
                }
            },

            currentQuestionIndex: function (newCurrentQuestionIndex) {
                if (newCurrentQuestionIndex) {
                    currentQuestionIndex = currentQuestionIndex + newCurrentQuestionIndex;
                    console.log(currentQuestionIndex);
                } else {
                    console.log(currentQuestionIndex);
                    return currentQuestionIndex;
                }
            }
        }
    }])
