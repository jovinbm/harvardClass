angular.module('qaApp')
    .controller('OnlineCtrl', ['$scope', '$rootScope', 'socket', 'onlineService', 'globals', 'stateService',
        function ($scope, $rootScope, socket, onlineService, globals, stateService) {

            $scope.onlineUsers = globals.usersOnline();
            $scope.columnClass = stateService.oClass();
            $scope.$watch('tab', function () {
                $scope.columnClass = stateService.oClass();
            });

            $scope.$on('onlineUsers', function (event, users) {
                $scope.onlineUsers = users;
            });

        }]);