/**
 * Created by jovinbm on 1/14/15.
 */
angular.module('qaApp')
    .filter("sortObjectToArray", [function () {
        return function (obj) {
            var result = [];
            var keys = Object.keys(obj);
            var parsedKeys = keys.map(function (x) {
                return parseInt(x);
            });
            parsedKeys.sort(function (a, b) {
                return a - b;
            }).reverse();
            for (var i = 0, len = keys.length; i < len; i++) {
                result.push(obj[parsedKeys[i]]);
            }
            return result;
        };
    }])