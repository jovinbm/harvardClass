/**
 * Created by jovinbm on 1/12/15.
 */
angular.module('qaApp', ['ngAnimate', 'textAngular', 'ngSanitize', 'ui.bootstrap', 'ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'public/partials/views/home.html'
            })
            .when('/fullQuestion/:index/', {
                templateUrl: 'public/partials/views/question_full.html'
            })
            .when('/trendingFull/', {
                templateUrl: 'public/partials/views/trending.html'
            })
            .otherwise({redirectTo: '/'});
    }]);