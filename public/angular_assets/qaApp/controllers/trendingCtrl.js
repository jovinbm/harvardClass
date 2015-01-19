/**
 * Created by jovinbm on 1/19/15.
 */
angular.module('qaApp')

    .controller('TrendinglCtrl', ['$scope', 'socket', 'globals', 'stateService',
        function ($scope, socket, globals) {
            $scope.$on("currentTop", function () {
                $scope.topVotedQuestions = globals.currentTop();
            });

            $scope.changeState('qFeed');

            $scope.topVotedQuestions = globals.currentTop();
            $scope.columnClass = stateService.trClass();
        }])

    .controller('TrendingCtrl', ['$scope', 'socket', 'globals', 'stateService',
        function ($scope, socket, globals, stateService) {
            $scope.$on("currentTop", function () {
                $scope.topVotedQuestions = globals.currentTop();
            });

            $scope.changeState('qFeed');

            $scope.topVotedQuestions = globals.currentTop();
            $scope.columnClass = stateService.trClass();
        }]);