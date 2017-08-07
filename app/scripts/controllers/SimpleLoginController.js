'use strict';
'use strict';

angular.module('defyingGravityApp')
    .controller('SimpleLoginController', function($scope, appConfig, $state,$rootScope, Notification, AuthService, LoginService, ProfileService, ForgotPasswordService) {
        $scope.providers = appConfig.providers;
        $scope.simpleLogin = simpleLogin;
        $scope.openForgotPasswordModal = openForgotPasswordModal;
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
            AuthService.register(user).then(function() {
                Notification.success('You have registered successfully');
                $scope.$close();
                $state.go('profile');
            }, function(error) {
                var errorStr = " "+ error;
                errorStr = errorStr.substr(8,errorStr.length);
                Notification.error('<div class="text-center">Registration failed : ' +errorStr+ '</div>');
            });
        }
        function login(provider) {
            if (provider === $scope.providers.PASSWORD) {
                openSimpleLoginModal();
            } else {
                AuthService.login(provider).then(function(data) {
                    $scope.$close();
                    ProfileService.findUserProfile(data.id).then(function (result) {
                        if(result == null || result.pilotRating == null){
                            $state.go('profile');
                        }
                        else{
                            if(!result.image){
                                ProfileService.updateUserProfile({image : $scope.userData.profileImgUrl});
                            } else{
                                $rootScope.userImg = result.image;
                            }
                            $state.go('pilots');
                        }
                    });
                    Notification.success('You have logged in successfully');
                }, function(error) {
                    var errorStr = " "+ error;
                    errorStr = errorStr.substr(8,errorStr.length);
                    Notification.error('<div class="text-center">Login failed : ' +errorStr+ '</div>');
                });
            }
        }

        function openSimpleLoginModal(){
            LoginService.openSimpleLoginWindow();
        }

        $scope.goToPolicies = function() {
            $scope.$close();
            $state.go("policies");
        };


        
        function simpleLogin(user) {
            AuthService.simpleLogin(user).then(function() {
                $state.go('pilots');
                Notification.success('You have logged in successfully');
                $scope.$close();
            }, function(error) {
                var errorStr = " "+ error;
                errorStr = errorStr.substr(8,errorStr.length);
                Notification.error('<div class="text-center">Login failed : ' +errorStr+ '</div>');
            });
        }



        function openForgotPasswordModal(){
            ForgotPasswordService.openForgotPassWindow();
            $scope.$close();
        }
        
        $scope.$on('userChanged', function() {
            if (AuthService.isLoggedIn()) {
                $scope.userData = AuthService.getUserData();
                $scope.$close();
                ProfileService.findUserProfile($scope.userData.id).then(function (result) {
                    if(result == null || result.pilotRating == null){
                        $state.go('profile');
                    }
                    else{
                        if(!result.image){
                            ProfileService.updateUserProfile({image : $scope.userData.profileImgUrl});
                        }
                        $state.go('pilots');
                    }

                })

            }
        });
    });
