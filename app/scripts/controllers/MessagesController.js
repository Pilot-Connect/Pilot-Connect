'use strict';

angular.module('defyingGravityApp')
    .controller('MessagesController', function ($scope, MessagesService, ProfileService, $timeout, AuthService, PilotsService, FirebaseService, $firebaseObject, $rootScope, MailService,appConfig) {

        $scope.messages = [];
        var firebaseRef = FirebaseService.getFirebaseRef();
        var usersRef = firebaseRef.child('users');
        var profile;
        $scope.getConversation = getConversation;
        $scope.reply = reply;
        $scope.loadpilots = loadpilots;
        $scope.loadchats = loadchats;
        $scope.search = {};
        $scope.search.pilot = '';
        $scope.back = back;
        $scope.deleteChat = deleteChat;
        $scope.getUserProfile = getUserProfile;
        $scope.closeUserProfile = closeUserProfile;
        init();

        var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;


        if (window.cordova || width < 450) {
            // running on device/emulator
            $scope.deviceIsCordova = true;
            document.getElementById("side").style.width = "100%";
            document.getElementById("read").style.width = "0%"

        } else {
            // running in dev mode
            $scope.deviceIsCordova = false;
            document.getElementById("side").style.width = "30%";
            document.getElementById("read").style.width = "70%";
        }

        function updateScroll() {
            $timeout(function () {
                var element = document.getElementById("ReadView");
                if (element) {
                    element.scrollTop = element.scrollHeight;
                }
            }, 10);
        }

        function back() {
            document.getElementById("side").style.width = "100%";
            document.getElementById("read").style.width = "0%";
            $rootScope.selected = null;
            $('#side').show();
            $('#read').hide();
        }

        function init() {
            $timeout(function () {
                ProfileService.getUserProfile().then(function (data) {
                    profile = data;
                    $scope.profile = angular.copy(profile);
                    loadimage();
                });
                loadchats();
            });

        }

        function loadimage() {
            var uid = AuthService.getUserData();
            var refImg = usersRef.child(uid.id).child("profile");
            var ImgObj = $firebaseObject(refImg);
            ImgObj.$loaded().then(function (obj) {
                if (obj.image) {
                    $scope.pfImage = obj.image;
                }
                else {
                    $scope.userData = AuthService.getUserData();
                }
            }, function (error) {
                // console.log("ERROR", error);
            });
        }


        function loadpilots() {
            var allPilots = document.getElementById('pilots');
            var chats = document.getElementById('chats');
            PilotsService.loadPilots().then(function (pilots) {
                $scope.pilots = pilots;
                $scope.chatsloaded = false;
                $scope.pilotsLoaded = true;
                groupByUsers(pilots);
                if ($scope.pilotsLoaded && allPilots) {
                    allPilots.style.backgroundColor = '#03A9F4';
                    chats.style.backgroundColor = '#ffffff';
                    allPilots.style.color = '#ffffff';
                    chats.style.color = '#03A9F4';
                }

            });
        }

        function loadchats() {
            var pilots = document.getElementById('pilots');
            var chats = document.getElementById('chats');
            getAllUsers();
            $scope.pilotsLoaded = false;
            $scope.chatsloaded = true;

            if ($scope.chatsloaded && chats) {
                pilots.style.backgroundColor = '#ffffff';
                chats.style.backgroundColor = '#03A9F4';
                pilots.style.color = '#03A9F4';
                chats.style.color = '#ffffff';
            }
        }

        function groupByUsers(pilots) {
            $scope.pilotusers = [];
            var users = {};
            _.forEach(pilots, function (pilot) {
                if (pilot.id !== AuthService.getUserId()) {
                    var pilotData = {
                        id: pilot.id,
                        profile: pilot.profile,
                        places: [pilot.place],
                        notRealUser: pilot.notRealUser
                    };
                    if (users[pilot.id]) {
                        users[pilot.id].places.push(pilot.place);
                    } else {
                        users[pilot.id] = pilotData;
                    }
                }
            });
            _.forEach(users, function (user) {
                $scope.pilotusers.push(user);
            })

        }

        function getAllUsers() {
            var msgRef = usersRef.child(AuthService.getUserId()).child('messages');
            var users = [];
            msgRef.on("child_added", function (snapshot) {
                if (snapshot) {
                    users.push(snapshot.key);
                }
                getalluserData(users);

            })
        }


        function getalluserData(users) {
            MessagesService.getAllUsersData(users).then(function (user_data) {
                $scope.users = user_data;
            })
        }


        function getAllMsgs(id) {
            $scope.messages = [];
            $timeout(function () {
                MessagesService.getAllMessages(id, $scope.selected_user.id).then(function (msgs) {
                    $scope.messages = msgs;
                });
                $scope.$apply();

            });
        }

        function getConversation(user, callback) {
            closeUserProfile();
            $scope.selected_user = user;
            $rootScope.selected = user;

            getAllMsgs(user.id);
            if (window.cordova || width < 450) {
                document.getElementById("side").style.width = "0%";
                document.getElementById("read").style.width = "100%";
                $('#side').hide();
                $('#read').show();
            }
            if (callback == 'chats') {
                loadchats();
            }
        }


        function reply(text) {
            if (text.length > 0) {
                var reciever = $scope.selected_user;
                var receiver_id = reciever.id
                var msgdata = {
                    timestamp: Date.now(),
                    reciever: receiver_id,
                    sender: AuthService.getUserId(),
                    msgtext: text,
                };

                MessagesService.sendMessage(msgdata, receiver_id).then(function (success) {
                    document.getElementById('msgTextArea').value = "";
                    updateScroll();
                    sendMail();
                }, function (error) {
                    // console.log('Sending Failed');
                });
            }
        }


        function deleteChat(data) {
           // console.log("deleteChat" + data.id);
            MessagesService.deletechat(data.id).then(function (success) {
                // console.log('Your chat has been deleted successfully');
                loadchats();
            }, function (error) {
                // console.log("Couldn't Delete Chat");
            });

        }

        function sendMail() {
            var user = $rootScope.selected.value || $rootScope.selected.profile;
            if (user) {
                var message = {
                    // name : $scope.profile.name,
                    name: "Pilot Connect",
                    //from :$scope.profile.email,
                    from: appConfig.notificationMail ,
                    to: user.email,
                    subject: "New message Recieved",
                    message: "Hey, you just received a new message!  Sign on to see who wrote you: " + appConfig.domain,
                }

                MailService.SendMail(message)
                    .then(function (data) {
                        if (data) {
                            //   console.log(data);
                        }
                    });
            }
        }


        $scope.profileInfo = "";
        function getUserProfile(user, id) {
            $scope.profileInfo = user.profile || user.value;
            $timeout(function () {
                $(id).popover({
                    html: true,
                    content: function () {
                        return $("#userProfile").html();
                    },
                    title: function () {
                        return $("#profileTitle").html();
                    },
                    trigger: 'hover'
                }).popover('show');
            }, 10)

        }

        function closeUserProfile() {
            document.getElementById('userProfile').style.display = "none";
        }

        $scope.$on('userChanged', function () {
            $scope.userData = AuthService.getUserData();
        });

        $rootScope.$on('msgRecieved', function (Event) {
            updateScroll();
        })


    });

