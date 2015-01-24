/**
 * Created by jovinbm on 1/24/15.
 */
angular.module('qaApp')
    .factory('mainService', ['$window', '$rootScope', 'socket', 'socketService', 'globals', 'detailStorage',
        function ($window, $rootScope, socket, socketService, globals, detailStorage) {

            socket.on('upvotedIndexes', function (indexesArray) {
                console.log("'upvotedIndexes' event received");
                globals.upvotedIndexes(indexesArray);
                detailStorage.updateReferenceIndexes(true);
            });

            socket.on('topVoted', function (topVotedArrayOfObjects) {
                console.log("'topVoted' event received");
                globals.currentTop(topVotedArrayOfObjects, true);
            });

            socket.on('joined', function () {
                socketService.startUp()
                    .success(function (resp) {
                        var questionArray = resp.questionsArray;
                        var temp = {};

                        temp["uniqueCuid"] = globals.uniqueCuid(resp["uniqueCuid"]);
                        globals.questionActivity(true);
                        globals.upvotedIndexes(resp.upvotedIndexes);
                        globals.currentQuestionIndex(resp.currentQuestionIndex);
                        temp.questionReference = detailStorage.add(questionArray, true);
                        globals.currentQuestions(questionArray, true);
                        globals.currentTop(resp.topVotedArray, true);
                        $rootScope.$broadcast('startUpSuccess', temp);
                    })
                    .error(function (errResponse) {
                        $window.location.href = "/public/error500.html";
                    });
            });

            socket.on('reconnect', function () {
                console.log("'reconnect' triggered");
                socketService.reconnect()
                    .success(function (resp) {
                        var questionArray = resp.questionsArray;
                        var temp = {};

                        temp.uniqueCuid = globals.uniqueCuid(resp["uniqueCuid"]);
                        globals.upvotedIndexes(resp.upvotedIndexes);
                        globals.currentQuestionIndex(resp.currentQuestionIndex);
                        temp.questionReference = detailStorage.add(questionArray, true);
                        globals.currentQuestions(questionArray, true);
                        globals.currentTop(resp.topVotedArray, true);
                        $rootScope.$broadcast('reconnectSuccess', temp);
                    })
                    .error(function (errResponse) {
                        $window.location.href = "/error500.html";
                    });
            });

            return {
                done: function () {
                    return 1;
                }
            }
        }]);