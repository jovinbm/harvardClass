angular.module('clientHomeApp')
    .factory('mainService', ['$log', '$window', '$rootScope', 'socket', 'socketService', 'globals',
        function ($log, $window, $rootScope, socket, socketService, globals) {

            socket.on('reconnect', function () {
                $log.info("'reconnect sequence' triggered");
                $rootScope.$broadcast('reconnectSuccess');
            });

            return {
                done: function () {
                    return 1;
                }
            };
        }])

    .factory('colorpicker', function () {
        function hexFromRGB(r, g, b) {
            var hex = [r.toString(16), g.toString(16), b.toString(16)];
            angular.forEach(hex, function (value, key) {
                if (value.length === 1) hex[key] = "0" + value;
            });
            return hex.join('').toUpperCase();
        }

        return {
            refreshSwatch: function (r, g, b) {
                var color = '#' + hexFromRGB(r, g, b);
                angular.element('#swatch').css('background-color', color);
            }
        };
    });