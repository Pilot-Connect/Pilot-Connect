'use strict';

angular.module('defyingGravityApp')
    .controller('ForgotPassController', function($scope, appConfig, $state, Notification, AuthService) {

        $scope.providers = appConfig.providers;
        $scope.forgotPass = forgotPass;


        function forgotPass(user) {
            AuthService.resetpassword(user).then(function(response) {
                // console.log("response: "+ JSON.stringify(response));
                Notification.success('Password reset successful');
                $scope.$close();
            }, function(error) {
                // console.log("response: "+ JSON.stringify(error));
                Notification.error('Password reset failed' +error);
            });
        }
    });
