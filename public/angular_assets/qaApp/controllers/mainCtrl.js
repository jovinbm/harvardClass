/**
 * Created by jovinbm on 1/18/15.
 */
angular.module('qaApp')
    .controller('MainController', ['$window', '$scope', '$rootScope', 'socket', 'socketService', 'questionService', 'globals', 'detailStorage', 'logoutService', 'stateService',
        function ($window, $scope, $rootScope, socket, socketService, questionService, globals, detailStorage, logoutService, stateService) {

            $scope.customUsername = globals.customUsername();
            $scope.uniqueCuid = globals.uniqueCuid();
            $scope.uniqueCuid = globals.uniqueCuid();
            $scope.questionReference = detailStorage.getReference();
            $scope.questionOnView = stateService.questionOnView();
            $scope.tab = stateService.tab();

            $scope.appState = "home";
            $scope.changeState = function (newState) {
                $scope.appState = newState;
            };

            $scope.changeTab = function (tab) {
                $scope.tab = stateService.tab(tab);
            };

            $scope.upvote = function (index, $event) {
                $scope.questionReference = detailStorage.disableButton(index);
                questionService.postUpvote(parseInt(index))
                    .success(function (resp) {
                        globals.addUpvoted(index);
                        $scope.questionReference = detailStorage.updateReferenceIndexes(true);
                    })
                    .error(function (errResponse) {
                        $window.location.href = "/public/error/error500.html";
                    });
            };


            //receives this client's upvoted questions indexes
            socket.on('upvotedIndexes', function (indexesArray) {
                console.log("'upvotedIndexes' event received");
                if (indexesArray.length != 0) {
                    globals.upvotedIndexes(indexesArray);
                    $scope.questionReference = detailStorage.updateReferenceIndexes(true);
                }
            });

            //receives an array containing the top voted questions
            socket.on('topVoted', function (topVotedArrayOfObjects) {
                console.log("'topVoted' event received");
                $scope.topVotedQuestions = globals.currentTop(topVotedArrayOfObjects, true);
            });


            $scope.$on('questionReference', function (event, data) {
                $scope.questionReference = data;
            });


            socketService.getSocketRoom()
                .success(function (data) {
                    globals.socketRoom(data.socketRoom);
                    $scope.customUsername = globals.customUsername(data.customUsername);
                    $scope.uniqueCuid = globals.uniqueCuid(data["uniqueCuid"]);
                    socket.emit('joinRoom', {
                        room: data.socketRoom,
                        customUsername: data.customUsername
                    });
                })
                .error(function (errResponse) {
                    $window.location.href = "/public/error/error500.html";
                });


            socket.on('joined', function () {
                socketService.startUp()
                    .success(function (resp) {
                        var questionArray = resp.questionsArray;

                        $scope.uniqueCuid = globals.uniqueCuid(resp["uniqueCuid"]);
                        globals.questionActivity(true);
                        globals.upvotedIndexes(resp.upvotedIndexes);
                        globals.currentQuestionIndex(resp.currentQuestionIndex);
                        $scope.questionReference = detailStorage.add(questionArray, true);
                        globals.currentQuestions(questionArray, true);
                        globals.currentTop(resp.topVotedArray, true);

                    })
                    .error(function (errResponse) {
                        $window.location.href = "/public/error/error500.html";
                    });
            });

            //receives an array containing the top voted questions
            socket.on('reconnect', function () {
                console.log("'reconnect' triggered");
                socketService.reconnect()
                    .success(function (resp) {
                        console.log(JSON.stringify(resp));
                        var questionArray = resp.questionsArray;

                        $scope.uniqueCuid = globals.uniqueCuid(resp["uniqueCuid"]);
                        globals.upvotedIndexes(resp.upvotedIndexes);
                        globals.currentQuestionIndex(resp.currentQuestionIndex);
                        $scope.questionReference = detailStorage.add(questionArray, true);
                        globals.currentQuestions(questionArray, true);
                        globals.currentTop(resp.topVotedArray, true);
                        $scope.questionReference = detailStorage.updateReferenceIndexes(true);

                    })
                    .error(function (errResponse) {
                        $window.location.href = "/public/error/error500.html";
                    });
            });

        }]);