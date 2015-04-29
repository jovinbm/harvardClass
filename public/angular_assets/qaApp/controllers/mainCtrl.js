angular.module('qaApp')
    .controller('MainController', ['$window', '$location', '$scope', '$rootScope', 'socket', 'socketService', 'questionService', 'globals', 'detailStorage', 'stateService', 'mainService',
        function ($window, $location, $scope, $rootScope, socket, socketService, questionService, globals, detailStorage, stateService, mainService) {

            $scope.customUsername = globals.customUsername();
            $scope.uniqueCuid = globals.uniqueCuid();
            $scope.questionReference = detailStorage.getReference();
            $scope.questionOnView = stateService.questionOnView();
            $scope.tab = stateService.tab();
            $scope.alerts = questionService.alertStorage();

            //back functionality
            var history = [];
            $rootScope.$on('$routeChangeSuccess', function () {
                history.push($location.$$path);
            });
            $rootScope.back = function () {
                var prevUrl = history.length > 1 ? history.splice(-2)[0] : "/";
                $location.path(prevUrl);
            };


            $scope.qColumnState = 'qFeed';
            $scope.changeQColumnState = function (newState) {
                $scope.qColumnState = newState;
            };

            $scope.changeTab = function (tab) {
                $scope.tab = stateService.tab(tab);
            };

            $scope.$on('alertStorage', function (event, data) {
                $scope.alerts = data;
                $scope.changeTitle(data.newQuestionAlert.num);
            });

            $scope.showAlert = function (whatAlert, text) {
                switch (whatAlert) {
                    case 'success':
                        $scope.alerts = questionService.alertStorage();
                        toastr.success(text);
                        break;
                }
            };

            $scope.closeAlert = function (whatAlert) {
                switch (whatAlert) {
                    case 'newQuestionAlert':
                        $scope.alerts.newQuestionAlert.num = 0;
                        $scope.changeTitle($scope.alerts.newQuestionAlert.num);
                        $scope.alerts.newQuestionAlert.display = false;
                        $scope.alerts.newQuestionAlert = questionService.alertStorage('newQuestionAlert', $scope.alerts.newQuestionAlert);
                        $rootScope.$broadcast('newQAlertClosed');
                        break;
                }
            };

            $scope.upVote = function (index, state, $event) {
                //state is true when button is already upvoted, false when not
                if (state == false) {
                    $scope.questionReference = detailStorage.disableButton(index);
                    questionService.postQuestionVote(parseInt(index), 1)
                        .success(function (resp) {
                            globals.addUpvoted(index);
                            $scope.questionReference = detailStorage.updateReferenceIndexes(true);
                            $scope.questionReference[index].questionVotes++;
                            $scope.questionReference = detailStorage.toUpvotedClass(index);
                        })
                        .error(function (errResponse) {
                            $window.location.href = "/error500.html";
                        });
                }
                if (state == true) {
                    $scope.questionReference = detailStorage.disableButton(index);
                    questionService.postQuestionVote(parseInt(index), -1)
                        .success(function (resp) {
                            globals.removeUpvoted(index);
                            $scope.questionReference = detailStorage.updateReferenceIndexes(true, parseInt(index));
                            if ($scope.questionReference[index].questionVotes > 0) {
                                $scope.questionReference[index].questionVotes--
                            }
                            $scope.questionReference = detailStorage.toNotUpvotedClass(index);
                        })
                        .error(function (errResponse) {
                            $window.location.href = "/error500.html";
                        });
                }
            };

            $scope.$on('currentTop', function (event, topVotedArrayOfObjects) {
                $scope.topVotedQuestions = topVotedArrayOfObjects;
            });


            $scope.$on('questionReference', function (event, reference) {
                $scope.questionReference = reference;
            });


            socketService.getSocketRoom()
                .success(function (data) {
                    globals.socketRoom(data.socketRoom);
                    $scope.customUsername = globals.customUsername(data.customUsername);
                    $scope.uniqueCuid = globals.uniqueCuid(data["uniqueCuid"]);
                    socket.emit('joinRoom', {
                        room: data.socketRoom,
                        customUsername: data.customUsername
                    });
                })
                .error(function (errResponse) {
                    $window.location.href = "/error500.html";
                });


            $scope.$on('startUpSuccess', function (event, data) {
                $scope.uniqueCuid = data.uniqueCuid;
                $scope.questionReference = data.questionReference;
            });

            //===============logout functions===============
            $scope.logoutClient = function () {
                logoutService.logoutClient()
                    .success(function (resp) {
                        $scope.responseStatusHandler(resp);
                    })
                    .error(function (errResponse) {
                        $scope.responseStatusHandler(errResponse);
                    });
            };

            //=============end of logout===================

        }]);