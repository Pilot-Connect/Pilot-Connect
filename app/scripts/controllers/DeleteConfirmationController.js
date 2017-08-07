'use strict';

angular.module('defyingGravityApp')
    .controller('DeleteConfirmationController', function($scope, $state, Notification, AuthService, ForgotPasswordService) {
        $scope.userData = AuthService.getUserData();
        $scope.deleteUser = deleteUser;
        // $scope.provider = window.localStorage.provider;
        $scope.provider = JSON.parse(window.localStorage.provider);
        $scope.err = {};
        function deleteUser (pass){
            $scope.err.pass = false;
            if($scope.provider == 'password'){
                if(pass !== null){
                    AuthService.reAuthenticate(pass).then(function(response){
                        if(response){
                            $scope.$close();
                        }
                        AuthService.deleteUserPermanently().then(function(response){
                            console.log(response);
                            $scope.$close();
                            $state.go('home');
                        });
                    });
                } else{
                    $scope.err.pass = true;
                }

            } else{
                AuthService.login($scope.provider).then(function(data) {
                    if(data){
                        $scope.$close();
                    }
                    $scope.$close();
                    AuthService.deleteUserPermanently().then(function(response){
                        $scope.$close();
                        $state.go('home');
                    });
                });
            }

        }
    });
