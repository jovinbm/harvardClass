angular.module('adminHomeApp')

    .factory('globals', ['$window', '$rootScope', 'socketService',
        function ($window, $rootScope, socketService) {
            var userData = {};
            return {

                userData: function (data) {
                    if (data) {
                        userData = data;
                        return userData;
                    } else {
                        return userData;
                    }
                }
            };
        }]);