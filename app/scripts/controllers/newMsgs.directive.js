'use strict';

angular
.module('defyingGravityApp')
.directive('newMsgs', 
  function (){    
    return {
      scope: {
        id: '='
      },
      controller: function($scope, MessagesService, AuthService, FirebaseService, $timeout , $rootScope) {
        var id = $scope.id;
        var msgs =0;
        $scope.count = msgs;
        var firebaseRef = FirebaseService.getFirebaseRef();
        var usersRef = firebaseRef.child('users');        
        var msgRef = usersRef.child(AuthService.getUserId()).child('messages').child(id);   
        $timeout(function() {
          msgRef.on("child_added", function(snapshot) {


            if(snapshot.val().type == 'inbox'){
              var data = snapshot.val();
              if(data.read == false){
                msgs++;  
              }
              $scope.count = msgs;
              $scope.$apply();
            }
          });

        });
        
        $timeout(function() {
          msgRef.on("child_changed", function(snapshot) {
            if(snapshot.val().type == 'inbox'){
              var data = snapshot.val();
              if(data.read == true){
                msgs--;  
              }
              $scope.count = msgs;
              $scope.$apply();
            }

          });

        });


      },
      template: '<span ng-if="count > 0 ">{{count}}</span>'
    }
  });










