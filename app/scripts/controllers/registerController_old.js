'use strict';

angular.module('defyingGravityApp')
  .controller('RegisterController', function($scope, appConfig, $state, Notification, AuthService, LoginService, ProfileService) {
        $scope.providers = appConfig.providers;
        $scope.login = login;
        $scope.register = register;
        if (window.cordova) {
            // running on device/emulator
            // console.log("on cordova");
            $scope.deviceIsCordova = true;
            $scope.loginClass = 'loginContainerCordova';
          } else {
            // running in dev mode
            // console.log("not on cordova");
            $scope.deviceIsCordova = false;
            $scope.loginClass = 'loginContainerWindow';
            
          }

      function register(user) {
            // console.log(user);
            AuthService.register(user).then(function() {
                Notification.success('You have registered successfully');
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
                // console.log(data);
                ProfileService.findUserProfile(data.id).then(function (result) {
                  // console.log(result);
                  if(result == nulls){
                    $state.go('profile');
                  }
                  else{
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

        
        $scope.$on('userChanged', function() {
            // console.log(" userChanged loginCtrl");
            if (AuthService.isLoggedIn()) {
              $scope.userData = AuthService.getUserData();
              //console.log($scope.userData);
              ProfileService.findUserProfile($scope.userData.id).then(function (result) {
                  // console.log(result);
                  if(result == null){
                    $state.go('profile');
                  }
                  else{
                    $state.go('pilots');
                  }
                  if(result){
                    if(!result.image){
                      ProfileService.updateUserProfile({image : $scope.userData.profileImgUrl});
                    }
                  }
                })
                
            }
          });

  });
