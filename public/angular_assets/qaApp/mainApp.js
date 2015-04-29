angular.module('qaApp', [
    'ngAnimate',
    'textAngular',
    'ngSanitize',
    'ui.bootstrap',
    'ngRoute',
    'angular-loading-bar',
    'angulartics',
    'angulartics.google.analytics'
])
    .run(function ($templateCache, $http) {
        $http.get('views/client/partials/questionFeed.html', {cache: $templateCache});
        $http.get('views/client/partials/question_full.html', {cache: $templateCache});
        $http.get('views/client/partials/views/question_full.html', {cache: $templateCache});
        $http.get('views/client/partials/modals/question_input.html', {cache: $templateCache});
        $http.get('views/client/partials/modals/question_edit.html', {cache: $templateCache});
        $http.get('views/client/partials/views/trending.html', {cache: $templateCache});
        $http.get('views/client/partials/trending_summary.html', {cache: $templateCache});
        $http.get('views/client/partials/comment_full.html', {cache: $templateCache});
        $http.get('views/client/partials/modals/comment_edit.html', {cache: $templateCache});
        $http.get('views/client/partials/online.html', {cache: $templateCache});
        $http.get('views/client/partials/views/home.html', {cache: $templateCache});
    })
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/home/', {
                redirectTo: '/1'
            })
            .when('/:page/', {
                templateUrl: 'views/client/partials/views/home.html'
            })
            .when('/fullQuestion/:index/', {
                templateUrl: 'views/client/partials/views/question_full.html'
            })
            .when('/trending/full/', {
                templateUrl: 'views/client/partials/views/trending.html'
            })
            .otherwise({redirectTo: '/1'});
    }]);