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
            }
        }
    }])
    .directive('questionFull', [function () {
        return {
            templateUrl: 'public/partials/question_full.html',
            link: function ($scope, $element, $attrs) {
            }
        }
    }])
    .directive('commentFull', ['socket', 'socketRoom', 'commentService', function (socket, socketRoom, commentService) {
        return {
            templateUrl: 'public/partials/comment_full.html',
            link: function ($scope, $element, $attrs) {
                $scope.questionIndex = $scope.questionOnView;
                $scope.cmntsReference = {};
                $scope.myPromotes = [];
                $scope.lastCommentIndex = -1;
                $scope.comments = [];

                $scope.increaseIndex = function (index, num) {
                    if (index) {
                        $scope.lastCommentIndex = index;
                    } else if (num) {
                        $scope.lastCommentIndex++;
                    }
                };

                $scope.promote = function (questionIndex, commentIndex, uniqueId, $event) {
                    commentService.postPromote(questionIndex, commentIndex, uniqueId)
                        .success(function (resp) {
                            $scope.myPromotes.push("q" + questionIndex + "c" + commentIndex);
                            $scope.cmntsReference[commentIndex].ifDisabled = true;
                        })
                        .error(function (errResponse) {
                            $window.location.href = "/public/error/error500.html";
                        });
                };

                socket.on('comments', function (commentObject) {
                    console.log("'comments' event received");
                    console.log("comments = " + JSON.stringify(commentObject));
                    $scope.myPromotes = commentObject.myPromotes;
                    $scope.increaseIndex(commentObject.index);
                    $scope.cmntsReference = commentService.commentsReference
                    (
                        commentObject.comments,
                        $scope.myPromotes,
                        $scope.cmntsReference
                    );

                    $scope.comments = commentObject.comments;
                });

                socket.on('newComment', function (commentObject) {
                    console.log("'newComment' event received");
                    $scope.increaseIndex(null, "1");
                    var temp = [];
                    var newComment = commentObject.comment;
                    temp.push(newComment);
                    $scope.cmntsReference = commentService.commentsReference
                    (
                        temp,
                        $scope.myPromotes,
                        $scope.cmntsReference
                    );

                    $scope.comments.unshift(newComment);
                });

                commentService.getComments($scope.questionIndex, $scope.lastCommentIndex)
                    .error(function (errorResponse) {
                        $window.location.href = "/error/error500.html";
                    });
            }
        }
    }])
    .directive('trendingSummary', [function () {
        return {
            templateUrl: 'public/partials/trending_summary.html',
            link: function ($scope, $element, $attrs) {
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
            }
        }
    }]);