/**
 * Created by jovinbm on 1/19/15.
 */
angular.module('qaApp')

    .controller('OnlineCtrl', ['$scope', '$rootScope', 'socket', 'socketService', 'globals', 'stateService',
        function ($scope, $rootScope, socket, socketService, globals, stateService) {

            $scope.onlineUsers = globals.usersOnline();
            $scope.columnClass = stateService.oClass();
            $scope.$watch('tab', function () {
                $scope.columnClass = stateService.oClass();
            });

            /*receives an object (at regular intervals) containing the currently online users*/
            socket.on('usersOnline', function (onlineUsers) {
                console.log("'usersOnline' event received");
                $scope.onlineUsers = globals.usersOnline(onlineUsers);
            });

        }]);