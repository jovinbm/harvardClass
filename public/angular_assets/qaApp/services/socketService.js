/**
 * Created by jovinbm on 1/19/15.
 */
angular.module('qaApp')

    .factory('socket', ['$location', '$rootScope', function ($location, $rootScope) {
        var socket = io.connect($location.host());
        //return socket;
        return {
            on: function (eventName, callback) {
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },

            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                })
            }
        }
    }])


    .factory('socketService', ['$http', function ($http) {
        return {
            getSocketRoom: function () {
                return $http.get('/api/getMyRoom');
            },

            startUp: function () {
                return $http.post('/api/startUp');
            },

            ready: function () {
                return $http.post('/api/ready');
            }
        }
    }])


    .factory('logoutService', ['$http', function ($http) {
        return {
            logoutCustomChat: function () {
                return $http.post('/api/logoutCustomChat');
            },

            logoutHarvardChat: function () {
                return $http.post('/api/logoutHarvardChat');
            },

            logoutHarvardLogin: function () {
                return $http.post('/api/logoutHarvardLogin');
            }
        }
    }]);