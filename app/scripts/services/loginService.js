'use strict';

angular.module('defyingGravityApp')

  .factory("LoginService", function ($q, $modal, $rootScope, AuthService) {
        var simpleLoginWindow, registerWindow, deleteConfirmationWindow;

        return {
            loginAsynch: loginAsynch,
            openSimpleLoginWindow : openSimpleLoginWindow,
            openRegisterWindow : openRegisterWindow,
            openDeleteConfirmationLoginWindow : openDeleteConfirmationLoginWindow
        };        

      function openSimpleLoginWindow(){
          simpleLoginWindow = $modal.open({
              size: 'md',
              templateUrl: 'views/login-modal.html',
              controller: 'SimpleLoginController'
          });

      }
      function openDeleteConfirmationLoginWindow(){
          deleteConfirmationWindow = $modal.open({
              size: 'md',
              templateUrl: 'views/delete-confirm-modal.html',
              controller: 'DeleteConfirmationController'
          });

      }
      function openRegisterWindow(){
          registerWindow = $modal.open({
              templateUrl: 'views/register-modal.html',
              controller: 'RegisterController'
          });

      }

        function loginAsynch() {
            var deferred = $q.defer();
                if (AuthService.isLoggedIn()) {
                    deferred.resolve();
                } else {
                    deferred.reject();
                }
            return deferred.promise;
        }

  });
