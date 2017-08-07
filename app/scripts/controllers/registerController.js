'use strict';

angular.module('defyingGravityApp')
    .controller('RegisterController', function ($scope, appConfig, $timeout, $state, $rootScope, Notification, AuthService, LoginService, ProfileService) {
        $scope.providers = appConfig.providers;
        $scope.login = login;
        $scope.register = register;
        if (window.cordova) {
            // running on device/emulator
            $scope.deviceIsCordova = true;
            $scope.loginClass = 'loginContainerCordova';
        } else {
            // running in dev mode
            $scope.deviceIsCordova = false;
            $scope.loginClass = 'loginContainerWindow';
        }

        function register(user) {
            AuthService.register(user).then(function () {
                Notification.success('You have registered successfully');
                $scope.$close();
                $state.go('profile');
            }, function (error) {
                var errorStr = " " + error;
                errorStr = errorStr.substr(8, errorStr.length);
                Notification.error('<div class="text-center">Registration failed : ' + errorStr + '</div>');
            });
        }

        function login(provider) {
            if (provider ===  $scope.providers.PASSWORD) {
                openSimpleLoginModal();
            } else {
                AuthService.login(provider).then(function (data) {
                    window.localStorage.provider = JSON.stringify(provider);
                    $scope.$close();
                    ProfileService.findUserProfile(data.id).then(function (result) {
                        if (result == null || result.pilotRating == null) {
                            $state.go('profile');
                        }
                        else {
                           /* console.log(result);
                            var profile_data = result;
                            var data = angular.copy(profile_data);

                            if (!result.image) {
                                // ProfileService.updateUserProfile({image: $scope.userData.profileImgUrl});
                                data.image = $scope.userData.profileImgUrl
                            } else {
                                $rootScope.userImg = result.image;
                            }

                            if (result.safety == 'Yes') {
                                data.safety = true;
                                data.aerial_tours = true;
                                data.general_QA = true;
                            } else if (result.safety == 'No') {
                                data.safety = false;
                            }

                            if (result.help == 'Yes') {
                                data.aerial_tours = true;
                            } else if (result.help == 'No') {
                                data.aerial_tours =  false;
                            }

                            if (result.paired == 'Yes') {
                                data.general_QA = true;
                            } else if (result.paired == 'No') {
                                data.general_QA = false;
                            }

                            $timeout(function () {
                                if (!angular.equals(profile_data, data)) {
                                    ProfileService.updateUserProfile(data).then(function (res) {
                                        console.log(res);
                                        console.log("profile Updated");
                                    }, function (err) {
                                        console.log(err);
                                    });
                                }
                            });*/

                            $state.go('pilots');
                        }
                    });
                    Notification.success('You have logged in successfully');
                }, function (error) {
                    var errorStr = " " + error;
                    errorStr = errorStr.substr(8, errorStr.length);
                    Notification.error('<div class="text-center">Login failed : ' + errorStr + '</div>');
                });
            }
        }

        function openSimpleLoginModal() {
            LoginService.openSimpleLoginWindow();
        }

        $scope.goToPolicies = function () {
            $scope.$close();
            $state.go("policies");
        };


        $scope.$on('userChanged', function () {
            if (AuthService.isLoggedIn()) {
                $scope.userData = AuthService.getUserData();
                $scope.$close();
                ProfileService.findUserProfile($scope.userData.id).then(function (result) {
                    if (result == null || result.pilotRating == null) {
                        $state.go('profile');
                    }
                    else {
                        if (!result.image) {
                            ProfileService.updateUserProfile({image: $scope.userData.profileImgUrl});
                        }
                        $state.go('pilots');
                    }

                })

            }
        });
    });
