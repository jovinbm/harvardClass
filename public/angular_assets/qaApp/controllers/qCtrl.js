/**
 * Created by jovinbm on 1/19/15.
 */
angular.module('qaApp')

    .controller('qFeedCtrl', ['$scope', 'socket', 'socketService', 'globals', 'detailStorage', 'sortObjectToArrayFilter', 'stateService',
        function ($scope, socket, socketService, globals, detailStorage, sortObjectToArrayFilter, stateService) {
            $scope.$on("currentQuestions", function () {
                $scope.questions = sortObjectToArrayFilter(globals.currentQuestions());
            });

            $scope.changeTab('home');
            $scope.changeState('qFeed');

            $scope.questions = sortObjectToArrayFilter(globals.currentQuestions());
            $scope.columnClass = stateService.qClass();

            $scope.isCollapsed = false;
            $scope.changeCollapse = function () {
                $scope.isCollapsed = !$scope.isCollapsed;
            };

            socket.on('newQuestion', function (questionObject) {
                console.log("'newQuestion' event received");
                var tempQuestionArray = [];
                globals.currentQuestionIndex(questionObject.index);
                tempQuestionArray.push(questionObject.question);
                detailStorage.add(tempQuestionArray, true);
                $scope.questions = sortObjectToArrayFilter(globals.currentQuestions(tempQuestionArray));
            });
        }])


    .controller('qFullCtrl', ['$window', '$scope', '$routeParams', 'globals', 'detailStorage', 'sortObjectToArrayFilter', 'stateService', 'questionService',
        function ($window, $scope, $routeParams, globals, detailStorage, sortObjectToArrayFilter, stateService, questionService) {
            $scope.currentQuestion = stateService.questionOnView($routeParams.index);
            $scope.changeTab('home');
            $scope.changeState('qFull');

            questionService.retrieveQuestion($scope.currentQuestion)
                .success(function (resp) {
                    $scope.question = resp.question;
                    globals.upvotedIndexes(resp.upvotedIndexes);
                    $scope.questionReference = detailStorage.add(resp.question, true)
                })
                .error(function (errResponse) {
                    $window.location.href = "/public/error/error500.html";
                });

            $scope.columnClass = stateService.qClass();

            $scope.isCollapsed = false;
            $scope.changeCollapse = function () {
                $scope.isCollapsed = !$scope.isCollapsed;
            };

        }])


    .controller('AskController', ['$scope', 'questionService',
        function ($scope, questionService) {
            $scope.ask = function () {
                if ($scope.theQuestion.length != 0 && $scope.theHeading.length != 0) {
                    questionService.postQuestion({
                        "theQuestion": $scope.theQuestion,
                        "theHeading": $scope.theHeading
                    })
                        .error(function (errorResponse) {
                            $window.location.href = "/error/error500.html";
                        });
                }
                $scope.theQuestion = '';
                $scope.theHeading = '';
            };

        }]);