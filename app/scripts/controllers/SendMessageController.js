'use strict';

angular.module('defyingGravityApp')
.controller('SendMessageController', function(User , $scope, MessagesService, AuthService, ProfileService, FirebaseService, $firebaseObject, Notification, MailService) {

 var firebaseRef = FirebaseService.getFirebaseRef(),
 usersRef = firebaseRef.child('users'),
 profile;
 $scope.sendto = User.user;
 $scope.send = send;


 updateProfile();

 function updateProfile() {     
  ProfileService.getUserProfile().then(function(data) {
    profile = data;
    $scope.profile = angular.copy(profile);
    $scope.userData = AuthService.getUserData();
    loadimage($scope.userData.id);
  });        
}

function loadimage (uid) {
  var refImg = usersRef.child(uid).child("profile");
  var ImgObj = $firebaseObject(refImg);
  ImgObj.$loaded().then(function (obj) {
    if(obj.image)
    {
      $scope.profileImage = obj.image;
    }
  }, function (error) {
    // console.log("ERROR", error);
  });
}

function send(msgtext){
  // 
  //var sender = $scope.profile;
  //var reciever =  $scope.sendto;
  //var reciever = User.user;
  var receiver_id = User.id


  var msgdata = {
    timestamp: Date.now(),
    reciever : receiver_id,
    sender :AuthService.getUserId(),
    msgtext :msgtext,
    read : false
  };
  MessagesService.sendMessage(msgdata, receiver_id).then(function() {
    $scope.$close();
    sendMail();
    Notification.success('Your message has been sent successfully');
  }, function() {
    Notification.error('Sending Failed');
  });
}

function sendMail(){
  $scope.userData = AuthService.getUserData();     
  var user = $scope.sendto; 
  if(user.profile.email){
    var message = {
            name : $scope.profile.name,
           //from : $scope.profile.email,
           //from : ' The Defying Gravity <postmaster@sandboxc9f44171420d4c69b30068dfc93141f5.mailgun.org>',
           from :' Pilot Connect/' +$scope.profile.email,
           to :  user.profile.email,
           subject : "New message Recieved",
           message : "New message received",
         }
         // console.log(message);
         MailService.SendMail(message)
         .then(function (data) {
          if(data)
          {
            // console.log(data);
          }
        });
       }
  }


   });
