/**
 * Created by jovinbm on 1/19/15.
 */
angular.module('qaApp')

    .factory('socket', ['$location', '$rootScope', function ($location, $rootScope) {
        if($location.port()){
            var url = $location.host() + ":" + $location.port();
        }else{
            var url = $location.host();
        }
        var socket = io.connect(url);
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


    .factory('socketService', ['$http', 'globals', function ($http, globals) {
        return {
            getSocketRoom: function () {
                return $http.get('/api/getMyRoom');
            },

            startUp: function () {
                return $http.post('/api/startUp');
            },

            reconnect: function () {
                return $http.post('/api/reconnect', {
                    "currentQuestionIndex": globals.currentQuestionIndex()
                })
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