/**
 * Created by jovinbm on 1/14/15.
 */
angular.module('qaApp')
    .filter("sortObjectToArray", [function () {
        return function (obj) {
            var result = [];
            var keys = Object.keys(obj);
            keys.sort().reverse();
            for (var i = 0, len = keys.length; i < len; i++) {
                result.push(obj[keys[i]]);
            }
            return result;
        };
    }])