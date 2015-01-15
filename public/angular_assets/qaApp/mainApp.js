/**
 * Created by jovinbm on 1/12/15.
 */
angular.module('qaApp', ['angular-loading-bar', 'textAngular', 'ngSanitize'])
    .config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
        cfpLoadingBarProvider.latencyThreshold = 5;
    }]);