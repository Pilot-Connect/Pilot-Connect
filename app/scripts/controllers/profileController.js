'use strict';

angular.module('defyingGravityApp')
    .controller('ProfileController',
        function ($scope, $rootScope, appConfig, ProfileService, LoginService, Notification, $timeout, AuthService, FirebaseService, $firebaseObject, $state, $firebaseAuth) {
            var profile;
            $scope.pass = {};
            $scope.types = appConfig.types;
            $scope.aircraftCategories = appConfig.aircraftCategories;
            $scope.pilotRating = appConfig.pilotRating;
            $scope.provider = window.localStorage.provider;
            // $scope.provider = JSON.parse(window.localStorage.provider);
            $scope.isSaveDisabled = isSaveDisabled;
            $scope.isResetDisabled = isResetDisabled;
            $scope.reset = reset;
            $scope.save = save;
            $scope.uploadImage = uploadImage;
            $scope.deleteUserAccount = deleteUserAccount;
            $scope.changePassword = changePassword;

            $scope.userData = AuthService.getUserData();
            // console.log($scope.userData);

            updateProfile();

            function deleteUserAccount() {
                LoginService.openDeleteConfirmationLoginWindow();
            }

            function isSaveDisabled(profileForm) {

                /*  if (!($scope.profile.safety || $scope.profile.aerial_tours ||
                 $scope.profile.general_QA || $scope.profile.copilot ||
                 $scope.profile.handler || $scope.profile.help || $scope.profile.paired)) {
                 $scope.err.checkOne = true;
                 }*/

                return profileForm.$invalid || (angular.equals(profile, $scope.profile));
            }

            function isResetDisabled() {
                return angular.equals(profile, $scope.profile);
            }

            function reset() {
                $scope.profile = angular.copy(profile);
            }

            function save(profile) {
                $scope.checkOne = false;
                $scope.profile.name = $scope.profile.fname + " " + $scope.profile.lname;
                if (!($scope.profile.safety || $scope.profile.aerial_tours ||
                    $scope.profile.general_QA || $scope.profile.copilot ||
                    $scope.profile.handler || $scope.profile.help || $scope.profile.paired)) {
                    $scope.checkOne = true;
                } else {
                    ProfileService.updateUserProfile(profile).then(function () {
                        Notification.success('Profile Saved');
                        updateProfile();
                        $state.go('EditProfile');
                    }, function () {
                        Notification.error('Could not save profile');
                    });
                }


            }

            function updateProfile() {
                profile = null;
                $timeout(function () {
                    ProfileService.getUserProfile().then(function (data) {
                        profile = data;
                        $scope.profile = angular.copy(profile);

                       /* if ($scope.profile.safety == null) {
                         console.log("Safety is null");
                         $scope.profile.safety = true;
                         $scope.profile.aerial_tours = true;
                         $scope.profile.general_QA = true;
                         }

                         if ($scope.profile.safety == 'Yes') {
                         $scope.profile.safety = true;
                         } else if ($scope.profile.safety == 'No') {
                         $scope.profile.safety = false;
                         }

                         if ($scope.profile.help == 'Yes') {
                         $scope.profile.help = true;
                         } else if ($scope.profile.help == 'No') {
                         $scope.profile.help = false;
                         }
                         if ($scope.profile.paired == 'Yes') {
                         $scope.profile.paired = true;
                         } else if ($scope.profile.paired == 'No') {
                         $scope.profile.paired = false;
                         }*/

                     /*   $timeout(function () {
                            if (!angular.equals(profile, $scope.profile)) {
                                  ProfileService.updateUserProfile($scope.profile).then(function () {
                                      updateProfile();
                                      console.log("profile Updated");
                                      $state.go('EditProfile');
                                  }, function (err) {
                                      console.log(err);
                                  });
                            }
                        });*/

                        var name = $scope.profile.name.split(' ');
                        $scope.profile.fname = name[0];
                        $scope.profile.lname = name[1];
                    });
                });
            }

            function handleFileSelect(evt) {
                $scope.uploading = true;
                $scope.image = evt;
                evt.stopPropagation();
                evt.preventDefault();
                var img = new FileReader();
                var files = evt.target.files;
                var file = evt.target.files[0];
                img.onload = function (res) {
                    $scope.uploadImg = res.target.result;
                };
                var output = [];
                for (var i = 0, f; f = files[i]; i++) {
                    output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
                        f.size, ' bytes, last modified: ',
                        f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
                        '</li>');
                }
                img.readAsDataURL(file);
                ProfileService.upload(evt).then(function (Success) {
                    if (Success) {

                        ProfileService.findUserProfile($scope.userData.id).then(function (result) {
                            if (result) {
                                $rootScope.userImg = result.image;
                                $scope.uploading = false;
                            }
                        })
                    }
                });
            }

            function uploadImage() {
                var file = document.getElementById('files');
                file.click();
            }

            document.getElementById('files').addEventListener('change', handleFileSelect, false);

            function changePassword(pass) {
                var data = {
                    email: $scope.profile.email,
                    oldPassword: pass.old,
                    newPassword: pass.new
                }


                AuthService.changePassword(data)
                    .then(function () {
                        Notification.success("Password Changed Successfully ");
                        $scope.pass.old = "";
                        $scope.pass.new = "";
                    }, function (err) {
                        $scope.pass.old = "";
                        $scope.pass.new = "";
                        Notification.error("Incorrect Old Password, Please Try Again!");
                    });
            };

            $scope.$watch('profile.pilotRating', function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    if (newVal == ($scope.pilotRating[$scope.pilotRating.length - 1])) {
                        $scope.other = true;
                    } else {
                        $scope.other = false;
                    }
                }
            });

        });
