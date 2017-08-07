'use strict';

angular.module('defyingGravityApp')
    .controller('UserController', function ($scope, $rootScope, $state, AuthService, Notification, LoginService, FirebaseService, $firebaseObject, $templateCache, $location, $timeout, MessagesService, ProfileService,appConfig) {

        $scope.logout = logout;
        $scope.isLoggedIn = isLoggedIn;
        $rootScope.selected = null;
        $scope.openRegisterModal = openRegisterModal;
        $scope.openSimpleLoginModal = openSimpleLoginModal;

        var firebaseRef = FirebaseService.getFirebaseRef();
        var usersRef = firebaseRef.child('users');
        $scope.newMsgs = 0;
        $scope.urls ={
            facebook : appConfig.facebookLink,
            twitter : appConfig.twitterLink,
            instagram : appConfig.instagramLink
        };

        init();

        function init() {
            if (isLoggedIn()) {
                $scope.userData = AuthService.getUserData();
                $timeout(function () {
                    if ($scope.userData) {
                        // console.log("UserController");
                        ProfileService.findUserProfile($scope.userData.id).then(function (result) {
                            //console.log(result);
                            if (result == null) {
                                $state.go('profile');
                            }
                            else {
                                // $scope.profile = result;
                                // console.log(result);
                                $scope.profile = angular.copy(result);

                                if (!result.image) {
                                    // ProfileService.updateUserProfile({image: $scope.userData.profileImgUrl});
                                    $scope.profile.image = $scope.userData.profileImgUrl;
                                } else {
                                    $rootScope.userImg = result.image;
                                }

                                if (result.safety == 'Yes') {
                                    $scope.profile.safety = true;
                                    $scope.profile.aerial_tours = true;
                                    $scope.profile.general_QA = true;
                                } else if (result.safety == 'No') {
                                    $scope.profile.safety = false;
                                }

                                if (result.help == 'Yes') {
                                    $scope.profile.help = true;
                                } else if (result.help == 'No') {
                                    $scope.profile.help = false;
                                }

                                if (result.paired == 'Yes') {
                                    $scope.profile.paired = true;
                                } else if (result.paired == 'No') {
                                    $scope.profile.paired = false;
                                }

                                $timeout(function () {
                                    if (!angular.equals(result, $scope.profile)) {
                                        ProfileService.updateUserProfile($scope.profile).then(function () {
                                            // console.log("profile Updated");
                                            ProfileService.getUserProfile().then(function (data) {
                                                // console.log(data);
                                                $scope.profile = data;
                                            });
                                        }, function (err) {
                                            console.log(err);
                                        });
                                    }
                                });
                            }
                        })
                        CheckForNewMsg();
                    }
                }, 10);
            }
        }

        /*function logout() {
         AuthService.logout();
         //$templateCache.removeAll();
         $templateCache.remove('/views/profile.html');
         $templateCache.remove('/views/profileEditForm.html');

         $location.path('/home');
         // $state.go('home')
         window.location.reload();
         Notification.success('You have logged out');
         }*/

        function logout() {
            AuthService.logout();
            $location.path('/home');
            Notification.success('You have logged out');
            $timeout(function () {
                $location.path('/home');
                $templateCache.remove('/views/profile.html');
                $templateCache.remove('/views/profileEditForm.html');
                $templateCache.remove('/views/form.html');
                // $templateCache.removeAll();
                window.location.reload();
            }, 100);
        }

        function isLoggedIn() {
            return AuthService.isLoggedIn()
        }


        function CheckForNewMsg() {
            var msgRef = usersRef.child(AuthService.getUserId()).child('messages');
            var ids = [];
            MessagesService.getAllUsers().then(function (users) {
                if (users) {
                    $rootScope.ReadingMsgs = false;
                    ids = users;
                    for (var i = 0; i < ids.length; i++) {
                        var inboxRef = msgRef.child(ids[i]).orderByChild('type').equalTo('inbox');
                        update(inboxRef);
                    }
                }
            });
        }

        function update(inboxRef) {
            $scope.newMsgs = 0
            $timeout(function () {
                inboxRef.on("child_added", function (snapshot) {
                    var data = snapshot.val();
                    if (data.read == false) {
                        ;
                        $scope.newMsgs++;

                    }
                    //  console.log($scope.newMsgs);
                    $scope.$apply();
                });
            });

            $timeout(function () {
                inboxRef.on("child_changed", function (snapshot) {
                    var data = snapshot.val();
                    if (data.read == true && $scope.newMsgs > 0) {
                        $scope.newMsgs--;
                    }
                    $scope.$apply();
                });
            });
        }

        function openRegisterModal() {
            LoginService.openRegisterWindow();
        }

        function openSimpleLoginModal() {
            LoginService.openSimpleLoginWindow();
        }

        $scope.$on('userChanged', function () {
            //console.log("onstate change");
            if (AuthService.isLoggedIn()) {
                $scope.userData = AuthService.getUserData();
                ProfileService.findUserProfile($scope.userData.id).then(function (result) {
                    //console.log(result);
                    if (result == null) {
                        $state.go('profile');
                    }
                    else {
                        $scope.profile = result;
                        $rootScope.userImg = result.image;
                    }
                })
            }
        });

    });


