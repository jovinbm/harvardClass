/**
 * Created by jovinbm on 1/19/15.
 */
angular.module('qaApp')

    .controller('TrendingCtrl', ['$scope', 'socket', 'globals', 'stateService',
        function ($scope, socket, globals, stateService) {
            $scope.$on("currentTop", function () {
                $scope.topVotedQuestions = globals.currentTop();
            });

            $scope.topVotedQuestions = globals.currentTop();
            $scope.changeTab('trending');
            $scope.columnClass = stateService.trClass();

            //receives an array containing the top voted questions
            socket.on('topVoted', function (topVotedArrayOfObjects) {
                console.log("'topVoted' event received");
                $scope.topVotedQuestions = globals.currentTop(topVotedArrayOfObjects);
            });
        }])

    .controller('TrendingSummaryCtrl', ['$scope', 'socket', 'globals', 'stateService',
        function ($scope, socket, globals, stateService) {
            $scope.$on("currentTop", function () {
                $scope.topVotedQuestions = globals.currentTop();
            });

            $scope.topVotedQuestions = globals.currentTop();
            $scope.columnClass = stateService.trClass();

            //receives an array containing the top voted questions
            socket.on('topVoted', function (topVotedArrayOfObjects) {
                console.log("'topVoted' event received");
                $scope.topVotedQuestions = globals.currentTop(topVotedArrayOfObjects);
            });
        }]);