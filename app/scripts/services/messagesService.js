'use strict';

angular.module('defyingGravityApp')
.factory('MessagesService',
  function($q, AuthService, FirebaseService ,$modal, $firebaseObject, $firebaseArray, $timeout, $rootScope, MailService) {
    var sendMessageWindow;
    var firebaseRef = FirebaseService.getFirebaseRef();
    var usersRef = firebaseRef.child('users');
    return {
      openSendMessageWindow : openSendMessageWindow,
      sendMessage : sendMessage,      
      getAllUsers: getAllUsers,
      getAllUsersData: getAllUsersData,
      getAllMessages : getAllMessages,
      deletechat : deletechat,
    };

    
    function openSendMessageWindow(id, user){
      // console.log(id);
      sendMessageWindow = $modal.open({
        size: 'md',
        templateUrl: 'views/sendMessage-modal.html',
        controller: 'SendMessageController',
        backdrop: 'static',
        keyboard: false,
        resolve:{
          User : function(){ return {user : user, id : id} }
        }
      });
    }


    function sendMessage(msg, id){
      var deferred = $q.defer();
      var msgRef = usersRef.child(AuthService.getUserId()).child('messages');
      var newPostKey = msgRef.child(id).child('outbox').push().key;
      var inbox = {};
      var outbox = {};
      var inboxMsg = {
        msgtext: msg.msgtext,
        reciever: msg.reciever,
        sender: msg.sender,
        timestamp:  msg.timestamp,
        type : 'inbox',
        read : false
      }
      var outboxMsg = {
        msgtext: msg.msgtext,
        reciever: msg.reciever,
        sender: msg.sender,
        timestamp:  msg.timestamp,
        type : 'outbox',
        read : false
      }
      inbox['/'+ newPostKey] = inboxMsg;
      outbox['/'+ newPostKey] = outboxMsg;
          //add msgs to sent folder of the sender
          msgRef.child(id).update(outbox,function (error) {
            if (!error) {
                  // If sent add the msg to recieve folder
                  usersRef.child(id).child('messages').child(AuthService.getUserId()).update(inbox);
                  deferred.resolve();
                } else {
                  deferred.reject(error);
                }
              });
          return deferred.promise;
        }

        function getAllUsers(){
          var msgRef = usersRef.child(AuthService.getUserId()).child('messages');
          var users =[];
          var deferred = $q.defer();
          msgRef.on("child_added", function(snapshot) {
            if(snapshot)
            {
              users.push(snapshot.key);
            }
            deferred.resolve(users);
          })
          return deferred.promise;
        }

        function getAllUsersData(users){
          var userData =[];
          var deferred = $q.defer();
          for(var u=0; u< users.length ; u++)
          {
            var id = users[u];
            usersRef.child(id).child('profile').on("value", function(value) {
              if(value)
              {
                userData.push({id : id ,value: value.val()});
              }           
              deferred.resolve(userData);
            });
          }
          return deferred.promise;
        }

        function getAllMessages(id, selected){
          var msgRef = usersRef.child(AuthService.getUserId()).child('messages').child(id);
          var msgs =[]; 
          var deferred = $q.defer();
          msgRef.orderByChild('timestamp').on("child_added", function(snapshot) {
            if(snapshot.val())
            {
              var msgData = {
                key: snapshot.key,
                value: snapshot.val()
              };
              
              if($rootScope.selected != null)
              {
                if(id == $rootScope.selected.id){
                  if(msgData.value.type == 'inbox' && msgData.value.read == false){
                    msgRef.child(snapshot.key).update({"read": true});
                    usersRef.child(id).child('messages').child(AuthService.getUserId()).child(snapshot.key).update({"read": true});
                  }                      
                  // if(msgData.value.type == 'outbox' && msgData.value.read == false){
                  //   var message = {
                  //         from : ' Mailgun Sandbox <postmaster@sandbox9a7d19be10104c6a8106aa611155e8d2.mailgun.org>',
                  //           to : 'priya@sookshum-labs.com',
                  //         //to : $scope.pilot.profile.email,
                  //         //from : $scope.profile.email,
                  //         subject : "New Review Recieved",
                  //         message : "New review added."
                  //       }
                  //       console.log(message);
                  //     MailService.SendMail(message)
                  //     .then(function (data) {
                  //       if(data)
                  //       {
                  //         console.log(data);
                  //       }
                  //     });
                  // }                      
                }
                $rootScope.$broadcast('msgRecieved');
                msgs.push(msgData);
              }
            }
          deferred.resolve(msgs);
        });
          return deferred.promise;
        }

        function deletechat(id){
          var msgRef = usersRef.child(AuthService.getUserId()).child('messages');
          var deletechat = msgRef.child(id);
          return deletechat.remove();
        }

        

      });
