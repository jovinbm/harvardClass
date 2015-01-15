/**
 * Created by jovinbm on 1/13/15.
 */
angular.module('qaApp')
    .directive('topQaNav', [function () {
        return {
            templateUrl: 'public/partials/navs/top_qa.html',
            link: function ($scope, $element, $attrs) {
            }
        }
    }])
    .directive('bottomQaNav', [function () {
        return {
            templateUrl: 'public/partials/navs/bottom_qa.html',
            link: function ($scope, $element, $attrs) {
            }
        }
    }])
    .directive('questionModal', [function () {
        return {
            templateUrl: 'public/partials/modals/question_input.html',
            link: function ($scope, $element, $attrs) {
            }
        }
    }])
    .directive('questionFeed', [function () {
        return {
            templateUrl: 'public/partials/questionFeed.html',
            link: function ($scope, $element, $attrs) {
                $scope.columnClass = "col-lg-7 col-md-7 col-sm-8 col-xs-12";
            }
        }
    }])
    .directive('trendingSummary', [function () {
        return {
            templateUrl: 'public/partials/trending_summary.html',
            link: function ($scope, $element, $attrs) {
                $scope.columnClass = "col-lg-3 col-md-4 col-sm-4 hidden-xs";
            }
        }
    }])
    .directive('onlineFeed', [function () {
        return {
            templateUrl: 'public/partials/online.html',
            link: function ($scope, $element, $attrs) {
            }
        }
    }])
    .directive('trendingFull', [function () {
        return {
            templateUrl: 'public/partials/trending.html',
            link: function ($scope, $element, $attrs) {
                $scope.columnClass = "col-lg-10 col-md-11 col-sm-10 col-xs-12";
            }
        }
    }]);