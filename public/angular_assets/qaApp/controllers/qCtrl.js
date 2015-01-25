/**
 * Created by jovinbm on 1/19/15.
 */
angular.module('qaApp')

    .controller('qFeedCtrl', ['$scope', 'socket', 'socketService', 'globals', 'detailStorage', 'sortObjectToArrayFilter', 'stateService', 'questionService',
        function ($scope, socket, socketService, globals, detailStorage, sortObjectToArrayFilter, stateService, questionService) {

            $scope.$on("currentQuestions", function (event, data) {
                $scope.alerts = questionService.alertStorage();
                $scope.questions = sortObjectToArrayFilter(data, $scope.alerts.newQuestionAlert.num);
            });

            $scope.$on('newQAlertClosed', function (event, data) {
                $scope.alerts = questionService.alertStorage();
                $scope.questions = sortObjectToArrayFilter(globals.currentQuestions());
            });

            $scope.changeTab('home');
            $scope.changeState('qFeed');

            $scope.questions = sortObjectToArrayFilter(globals.currentQuestions(), $scope.alerts.newQuestionAlert.num);
            $scope.columnClass = stateService.qClass();

            $scope.isCollapsed = false;
            $scope.changeCollapse = function () {
                $scope.isCollapsed = !$scope.isCollapsed;
            };
        }])


    .controller('qFullCtrl', ['$window', '$scope', 'socket', '$routeParams', 'globals', 'detailStorage', 'sortObjectToArrayFilter', 'stateService', 'questionService',
        function ($window, $scope, socket, $routeParams, globals, detailStorage, sortObjectToArrayFilter, stateService, questionService) {
            $scope.currentQuestion = stateService.questionOnView($routeParams.index);
            $scope.question = {};

            $scope.changeTab('home');
            $scope.changeState('qFull');

            //2 view modes, edit and full
            $scope.viewMode = 'full';
            $scope.changeViewMode = function (newViewMode) {
                $scope.viewMode = newViewMode;
            };

            $scope.saveEditedPost = function (finalHeading, finalQuestion) {
                var temp = {};
                temp["heading"] = finalHeading;
                temp["question"] = finalQuestion;
                temp["questionIndex"] = $scope.currentQuestion;
                questionService.postEditedQuestion(temp)
                    .success(function (resp) {
                        $scope.changeViewMode('full');
                        $scope.showAlert('success', 'Saved!');
                    });
            };

            questionService.retrieveQuestion($scope.currentQuestion)
                .success(function (resp) {
                    $scope.question = resp.question[0];
                    $scope.theEditedHeading = $scope.question.heading;
                    $scope.theEditedQuestion = $scope.question["question"];
                    globals.upvotedIndexes(resp.upvotedIndexes);
                    $scope.questionReference = detailStorage.add(resp.question, true)
                })
                .error(function (errResponse) {
                    $window.location.href = "/error500.html";
                });

            $scope.columnClass = stateService.qClass();

            $scope.isCollapsed = false;
            $scope.changeCollapse = function () {
                $scope.isCollapsed = !$scope.isCollapsed;
            };

            $scope.$on("currentQuestions", function (event, data) {
                console.log(data[$scope.currentQuestion]["questionIndex"]);
                if (data[$scope.currentQuestion]["questionIndex"] == $scope.currentQuestion) {
                    $scope.question = data[$scope.currentQuestion];
                }
            });
        }])


    .controller('AskController', ['$window', '$scope', 'questionService',
        function ($window, $scope, questionService) {
            $scope.ask = function () {
                if ($scope.theQuestion.length != 0 && $scope.theHeading.length != 0) {
                    questionService.postQuestion({
                        "theQuestion": $scope.theQuestion,
                        "theHeading": $scope.theHeading
                    }).success(function (resp) {
                        $scope.theQuestion = '';
                        $scope.theHeading = '';
                        $scope.dismiss();
                    })
                        .error(function (errorResponse) {
                            $window.location.href = "/error500.html";
                        });
                }
            };

        }]);