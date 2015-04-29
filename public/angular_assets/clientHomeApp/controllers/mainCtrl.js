angular.module('clientHomeApp')
    .controller('MainController', ['$q', '$filter', '$log', '$interval', '$window', '$location', '$scope', '$rootScope', 'socket', 'mainService', 'socketService', 'globals', '$modal', 'logoutService', 'colorpicker',
        function ($q, $filter, $log, $interval, $window, $location, $scope, $rootScope, socket, mainService, socketService, globals, $modal, logoutService, colorpicker) {

            //variable to hold the registered state of the client
            $scope.clientIsRegistered = false;

            //===============request error handler===============

            //universalDisable variable is used to disable everything crucial in case an error
            //occurs.This is sometimes needed if a reload did not work
            $scope.universalDisable = false;
            $scope.showBanner = false;
            $scope.bannerClass = "";
            $scope.bannerMessage = "";

            $scope.showRegistrationBanner = false;
            $scope.registrationBannerClass = "";
            $scope.registrationBannerMessage = "";

            $scope.universalDisableTrue = function () {
                $scope.universalDisable = true;
            };
            $scope.universalDisableFalse = function () {
                $scope.universalDisable = false;
            };

            $scope.responseStatusHandler = function (resp) {
                if (resp) {
                    if (resp.redirect) {
                        if (resp.redirect) {
                            $window.location.href = resp.redirectPage;
                        }
                    }
                    if (resp.disable) {
                        if (resp.disable) {
                            $scope.universalDisableTrue();
                        }
                    }
                    if (resp.notify) {
                        if (resp.type && resp.msg) {
                            $scope.showToast(resp.type, resp.msg);
                        }
                    }
                    if (resp.banner) {
                        if (resp.bannerClass && resp.msg) {
                            $scope.showBanner = true;
                            $scope.bannerClass = resp.bannerClass;
                            $scope.bannerMessage = resp.msg;
                        }
                    }
                    if (resp.registrationBanner) {
                        if (resp.bannerClass && resp.msg) {
                            $scope.showRegistrationBanner = true;
                            $scope.registrationBannerClass = resp.bannerClass;
                            $scope.registrationBannerMessage = resp.msg;
                        }
                    }
                    if (resp.reason) {
                        $log.warn(resp.reason);
                    }
                } else {
                    //do nothing
                }
            };

            $rootScope.$on('responseStatusHandler', function (event, resp) {
                $scope.responseStatusHandler(resp);
            });


            //===============end of request error handler===============


            //===============isLoading functions to disable elements while content is loading or processing===============
            $scope.isLoading = false;

            $scope.isLoadingTrue = function () {
                $scope.isLoading = true;
            };
            $scope.isLoadingFalse = function () {
                $scope.isLoading = false;
            };

            $rootScope.$on('isLoadingTrue', function () {
                $scope.isLoading = true;
            });

            $rootScope.$on('isLoadingFalse', function () {
                $scope.isLoading = false;
            });

            //===============end of isLoading functions===============

            //===============toastr show functions===============
            $scope.showToast = function (toastType, text) {
                switch (toastType) {
                    case "success":
                        toastr.clear();
                        toastr.success(text);
                        break;
                    case "warning":
                        toastr.clear();
                        toastr.warning(text, 'Warning', {
                            closeButton: true,
                            tapToDismiss: true
                        });
                        break;
                    case "error":
                        toastr.clear();
                        toastr.error(text, 'Error', {
                            closeButton: true,
                            tapToDismiss: true,
                            timeOut: false
                        });
                        break;
                    default:
                        //clears current list of toasts
                        toastr.clear();
                }
            };

            $rootScope.$on('showToast', function (event, data) {
                var toastType = data.toastType;
                var text = data.text;

                $scope.showToast(toastType, text);
            });

            //===============end of toastr show functions===============

            //initial requests
            socketService.getUserData()
                .success(function (resp) {
                    $scope.userData = globals.userData(resp.userData);
                    if ($scope.userData.isRegistered == 'yes') {
                        $scope.clientIsRegistered = true;
                    }

                    //join a socketRoom for websocket connection, equivalent to user's uniqueCuid
                    socket.emit('joinRoom', {
                        room: resp.userData.uniqueCuid
                    });

                    $scope.responseStatusHandler(resp);
                })
                .error(function (errResponse) {
                    $scope.responseStatusHandler(errResponse);
                });

            socket.on('joined', function () {
                console.log("JOIN SUCCESS");
            });

            //===============the sliders

            $scope.myPoints = 0;
            $scope.checkInterval = 100;
            $scope.level = 1;

            function rgbToHex(r, g, b) {
                return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
            }

            $scope.color_block = {
                red: Math.floor(Math.random() * 255) + 1,
                green: Math.floor(Math.random() * 255) + 1,
                blue: Math.floor(Math.random() * 255) + 1
            };

            function prepareNewColorBlock() {
                $scope.color_block.red = Math.floor(Math.random() * 255) + 1;
                $scope.color_block.green = Math.floor(Math.random() * 255) + 1;
                $scope.color_block.blue = Math.floor(Math.random() * 255) + 1;
            }

            $scope.checkMatch = function () {
                var errors = 0;
                if (($scope.color_block.red < $scope.colorpicker.red - $scope.checkInterval) || ($scope.color_block.red > $scope.colorpicker.red + $scope.checkInterval)) {
                    errors++;
                }

                if (($scope.color_block.green < $scope.colorpicker.green - $scope.checkInterval) || ($scope.color_block.green > $scope.colorpicker.green + $scope.checkInterval)) {
                    errors++;
                }

                if (($scope.color_block.blue < $scope.colorpicker.blue - $scope.checkInterval) || ($scope.color_block.blue > $scope.colorpicker.blue + $scope.checkInterval)) {
                    errors++;
                }

                if (errors > 0) {
                    $scope.showToast('warning', 'Hmm, not quite right, please try again');
                } else {
                    $scope.showToast('success', 'Nailed it!');
                    $scope.myPoints++;

                    if ($scope.myPoints >= 0 && $scope.myPoints <= 4) {
                        if ($scope.checkInterval != 100) {
                            $scope.checkInterval = 100;
                        }
                    }

                    if ($scope.myPoints >= 5 && $scope.myPoints <= 9) {
                        if ($scope.checkInterval != 50) {
                            $scope.checkInterval = 50;
                            $scope.level++;
                        }
                    }

                    if ($scope.myPoints >= 10 && $scope.myPoints <= 14) {
                        if ($scope.checkInterval != 25) {
                            $scope.checkInterval = 25;
                            $scope.level++;
                        }
                    }

                    if ($scope.myPoints >= 15 && $scope.myPoints <= 19) {
                        if ($scope.checkInterval != 10) {
                            $scope.checkInterval = 10;
                            $scope.level++;
                        }
                    }

                    if ($scope.myPoints >= 20 && $scope.myPoints <= 24) {
                        if ($scope.checkInterval != 5) {
                            $scope.checkInterval = 5;
                            $scope.level++;
                        }
                    }

                    if ($scope.myPoints >= 25 && $scope.myPoints <= 29) {
                        if ($scope.checkInterval != 2) {
                            $scope.checkInterval = 2;
                            $scope.level++;
                        }
                    }

                    if ($scope.myPoints >= 30) {
                        if ($scope.checkInterval != 0) {
                            $scope.checkInterval = 0;
                            $scope.level++;
                        }
                    }

                    changeHexValue();
                    prepareNewColorBlock()
                }
            };

            function changeHexValue() {
                $scope.colorpicker.hexValue = rgbToHex($scope.colorpicker.red, $scope.colorpicker.green, $scope.colorpicker.blue);
            }

            function refreshSwatch(ev, ui) {
                var red = $scope.colorpicker.red,
                    green = $scope.colorpicker.green,
                    blue = $scope.colorpicker.blue;
                changeHexValue();
                colorpicker.refreshSwatch(red, green, blue);
            }

            // Slider options with event handlers
            $scope.slider = {
                'options': {
                    start: function (event, ui) {
                        $log.info('Event: Slider start - set with slider options', event);
                    },
                    stop: function (event, ui) {
                        $log.info('Event: Slider stop - set with slider options', event);
                    }
                }
            };

            $scope.colorpicker = {
                red: 255,
                green: 140,
                blue: 60,
                hexValue: "",
                options: {
                    orientation: 'horizontal',
                    min: 0,
                    max: 255,
                    range: 'min',
                    change: refreshSwatch,
                    slide: refreshSwatch
                }
            };

            changeHexValue();

            //end of sliders

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


            //===============socket listeners===============

            $rootScope.$on('reconnectSuccess', function () {
            });

            $log.info('MainController booted successfully');

        }
    ]);