/**
 * Created by jovinbm on 1/19/15.
 */
angular.module('qaApp')

    .controller('qFeedCtrl', ['$scope', 'socket', 'socketService', 'globals', 'detailStorage', 'sortObjectToArrayFilter', 'stateService',
        function ($scope, socket, socketService, globals, detailStorage, sortObjectToArrayFilter, stateService) {
            $scope.$on("currentQuestions", function () {
                $scope.questions = sortObjectToArrayFilter(globals.currentQuestions());
                globals.questionActivity(true);
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
                globals.questionActivity(true);
                globals.currentQuestionIndex(questionObject.index);
                detailStorage.add(questionObject["question"], true);
                $scope.questions = sortObjectToArrayFilter(globals.currentQuestions(questionObject["question"]));
            });
        }])


    .controller('qFullCtrl', ['$window', '$scope', 'socket', '$routeParams', 'globals', 'detailStorage', 'sortObjectToArrayFilter', 'stateService', 'questionService',
        function ($window, $scope, socket, $routeParams, globals, detailStorage, sortObjectToArrayFilter, stateService, questionService) {
            $scope.currentQuestion = stateService.questionOnView($routeParams.index);
            $scope.question = [];

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
                    });
            };

            questionService.retrieveQuestion($scope.currentQuestion)
                .success(function (resp) {
                    $scope.question = resp.question;
                    $scope.theEditedHeading = $scope.question[0].heading;
                    $scope.theEditedQuestion = $scope.question[0]["question"];
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

            socket.on('newQuestion', function (questionObject) {
                console.log("'newQuestion' event received");
                globals.questionActivity(true);
                globals.currentQuestionIndex(questionObject.index);
                detailStorage.add(questionObject["question"], true);
                globals.currentQuestions(questionObject["question"], true);
                if (questionObject["question"][0]["questionIndex"] == $scope.currentQuestion) {
                    $scope.question = questionObject["question"];
                }
            });

        }])


    .controller('AskController', ['$scope', 'questionService',
        function ($scope, questionService) {
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
                            $window.location.href = "/error/error500.html";
                        });
                }
            };

        }]);