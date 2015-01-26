/**
 * Created by jovinbm on 1/19/15.
 */
angular.module('qaApp')
    .factory('questionService', ['$window', '$location', '$http', '$rootScope', 'socket', 'socketService', 'globals', 'detailStorage',
        function ($window, $location, $http, $rootScope, socket, socketService, globals, detailStorage) {
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

            var pagination = {
                "totalItems": 20,
                "items-per-page": 20,
                "currentPage": 1
            };

            socket.on('newQuestion', function (questionObject) {
                console.log("'newQuestion' event received factory");
                if (questionObject.questionCount) {
                    pagination['totalItems'] = questionObject.questionCount;
                }
                detailStorage.add(questionObject["question"], true);
                if (questionObject.update == false) {
                    alerts.newQuestionAlert.num++;
                    alerts.newQuestionAlert.display = true;
                }
                if (pagination.currentPage == 1) {
                    globals.currentQuestions(questionObject["question"]);
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

                getPagination: function () {
                    return pagination;
                },

                getCurrPage: function () {
                    return pagination.currentPage;
                },

                totalQuestions: function (count) {
                    pagination['totalItems'] = count;
                    $rootScope.$broadcast('pagination', pagination);
                },

                navigate: function (page) {
                    pagination.currentPage = page;
                    $location.path('/' + page);
                },

                loadChange: function (currPage) {
                    $http.post('/api/getQuestions', {
                        "page": currPage
                    }).success(function (resp) {
                        pagination.totalItems = resp.questionCount;
                        detailStorage.add(resp.questionArray, true);
                        globals.currentQuestions(resp.questionArray, true);
                        $rootScope.$broadcast('pagination', pagination);
                    })
                        .error(function (errResponse) {
                            $window.location.href = "/error500.html";
                        });
                    return currPage;
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