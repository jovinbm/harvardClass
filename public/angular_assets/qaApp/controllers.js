/**
 * Created by jovinbm on 1/10/15.
 */
angular.module('qaApp')
    .controller('MainController', ['$location', '$window', '$scope', '$interval', 'socket', 'socketRoom', 'initializer', 'globals', 'detailStorage', 'upvoteService', 'logoutService',
        function ($location, $window, $scope, $interval, socket, socketRoom, initializer, globals, detailStorage, upvoteService, logoutService) {
            $scope.customUsername = globals.customUsername();
            $scope.questionReference = detailStorage.getReference();

            $scope.colClasses = {
                "onlineColumn": {
                    "home": "col-lg-2 col-md-1 hidden-sm hidden-xs",
                    "trending": "col-lg-2 col-md-1 col-sm-2 hidden-xs"
                }
            };
            $scope.currentColClasses = {
                "onlineColumn": "col-lg-2 col-md-1 hidden-sm hidden-xs"
            };

            $scope.tab = 'home';
            $scope.changeTab = function (tab) {
                console.log("clicked");
                $scope.tab = tab;
                $scope.currentColClasses.onlineColumn = $scope.colClasses.onlineColumn[tab];
            };

            $scope.upvote = function (index, $event) {
                $scope.questionReference = detailStorage.disableButton(index);
                upvoteService.postUpvote(index)
                    .error(function (errResponse) {
                        $window.location.href = "/public/error/error500.html";
                    });
            };

            $scope.logoutCustomChat = function () {
                logoutService.logoutCustomChat()
                    .success(function (response) {
                        $window.location.href = "/login1.html";
                    })
                    .error(function (errResponse) {
                        $window.location.href = "/public/error/error500.html";
                    });
            };

            $scope.logoutHarvardChat = function () {
                logoutService.logoutHarvardChat()
                    .success(function (response) {
                        $window.location.href = "/login.html";
                    })
                    .error(function (errResponse) {
                        $window.location.href = "/public/error/error500.html";
                    });
            };

            socketRoom.getMyRoom()
                .success(function (data) {
                    globals.socketRoom(data.socketRoom);
                    globals.customUsername(data.customUsername);
                    socket.emit('joinRoom', {
                        room: data.socketRoom,
                        customUsername: data.customUsername
                    });
                })
                .error(function (errResponse) {
                    $window.location.href = "/public/error/error500.html";
                });

            socket.on('joined', function () {
                //send a ready event which on success will request the recent question history
                initializer.ready()
                    .success(function () {
                        initializer.getHistory({
                            currentQuestionIndex: globals.currentQuestionIndex()
                        }).error(function (errResponse) {
                            $window.location.href = "/error/error500.html";
                        });
                    })
                    .error(function (errResponse) {
                        $window.location.href = "/public/error/error500.html";
                    });
            });

            //receives a the clients customUsername and sets it as the customUsername
            socket.on('logged-in', function (name) {
                console.log("'loggedin' event received");
                $scope.customUsername = globals.customUsername(name);
            });

            //receives this client's upvoted questions indexes
            socket.on('myUpvotedIndexes', function (indexesArray) {
                console.log("'myUpvotedIndexes' event received");
                if (indexesArray.length != 0) {
                    globals.upvotedIndexes(indexesArray);
                    $scope.questionReference = detailStorage.updateReferenceIndexes();
                }
            });

            $scope.$on('updateReference', function (event, data) {
                $scope.questionReference = data;
            });
        }])


    .controller('QuestionFeedController', ['$scope', 'socket', 'socketRoom', 'initializer', 'globals', 'detailStorage', 'sortObjectToArrayFilter',
        function ($scope, socket, socketRoom, initializer, globals, detailStorage, sortObjectToArrayFilter) {
            $scope.questions = sortObjectToArrayFilter(globals.currentQuestions());

            /*receive an array containing the recent history(this array has objects with individual questions)*/
            socket.on('questionHistory', function (historyArray) {
                console.log("'questionHistory' event received");
                $scope.$emit('updateReference', detailStorage.add(historyArray));
                $scope.questions = sortObjectToArrayFilter(globals.currentQuestions(historyArray));
            });

            //receives an object containing a question to be added to the feed. Calls 'addMessage'
            socket.on('newQuestion', function (questionObject) {
                console.log("'newQuestion' event received");
                //make a temp array to make it compatible with the factories
                var tempQuestionArray = [];
                tempQuestionArray.push(questionObject);
                $scope.$emit('updateReference', detailStorage.add(tempQuestionArray));
                $scope.questions = sortObjectToArrayFilter(globals.currentQuestions(tempQuestionArray));
            });

            /*increments currentQuestionIndex which is used to keep track of the current index the user is at*/
            socket.on('incrementCurrentIndex', function (num) {
                console.log("'incrementCurrentIndex' event received");
                globals.currentQuestionIndex(num);
            });
        }])


    .controller('TopVotedController', ['$scope', 'socket', 'globals',
        function ($scope, socket, globals) {
            $scope.topVotedQuestions = globals.currentTop();

            //receives an array containing the top voted questions
            socket.on('topVoted', function (topVotedArrayOfObjects) {
                console.log("'topVoted' event received");
                $scope.topVotedQuestions = globals.currentTop(topVotedArrayOfObjects);
            });
        }])


    .controller('OnlineUsersController', ['$scope', 'socket', 'socketRoom', 'initializer', 'globals',
        function ($scope, socket, socketRoom, initializer, globals) {
            $scope.onlineUsers = globals.usersOnline();

            /*receives an object (at regular intervals) containing the currently online users*/
            socket.on('usersOnline', function (onlineUsers) {
                console.log("'usersOnline' event received");
                $scope.onlineUsers = globals.usersOnline(onlineUsers);
            });
        }])


    .controller('AskController', ['$location', '$scope', 'socket', 'socketRoom', 'initializer', 'globals', 'userQuestions',
        function ($location, $scope, socket, socketRoom, initializer, globals, userQuestions) {
            $scope.ask = function () {
                if ($scope.theQuestion.length != 0 && $scope.theHeading.length != 0) {
                    userQuestions.postQuestion({
                        "theQuestion": $scope.theQuestion,
                        "theHeading": $scope.theHeading
                    })
                        .error(function (errorResponse) {
                            $window.location.href = "/error/error500.html";
                        });
                }
                $scope.theQuestion = '';
                $scope.theHeading = '';
            }
        }]);