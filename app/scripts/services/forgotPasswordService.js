'use strict';

angular.module('defyingGravityApp')

    .factory("ForgotPasswordService", function ($q, $modal, $rootScope, AuthService) {
        var ForgotPassWindow;


        return {
            openForgotPassWindow: openForgotPassWindow
        };

        function openForgotPassWindow() {
            initForgotPassWindow();
        }


        function initForgotPassWindow() {
            ForgotPassWindow = $modal.open({
                size: 'md',
                templateUrl: 'views/forgot-modal.html',
                controller: 'ForgotPassController'
            });
        }


    });
