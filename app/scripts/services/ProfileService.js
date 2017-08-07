'use strict';

angular.module('defyingGravityApp')

    .factory("ProfileService", function ($rootScope, $q, $firebaseAuth, FirebaseService, AuthService, appConfig) {
        var firebaseRef = FirebaseService.getFirebaseRef(),
            usersRef = firebaseRef.child('users'),
            profile = null;

        return {
            getUserProfile: getUserProfile,
            findUserProfile: findUserProfile,
            updateUserProfile: updateUserProfile,
            upload: upload,
            getFriends: getFriends
        };


        function constructUserProfile(userData) {
            var newProfile = {
                login: userData.login,
                name: userData.login,
                type: appConfig.types.PERSONAL,
                image: userData.profileImgUrl
            };
            if (userData.email) {
                angular.extend(newProfile, {email: userData.email});
            }

            return newProfile;
        }

        function createUserProfile(id, userProfile) {
            var deferred = $q.defer();
            usersRef.child(id + '/profile').set(userProfile, function (error) {
                if (!error) {
                    deferred.resolve();
                } else {
                    deferred.reject(error);
                }
            });
            return deferred.promise;
        }

        function getUserProfile() {
            var deferred = $q.defer();
            if (profile) {
                deferred.resolve(profile);
            } else {
                getCurrentUserProfile().then(function (profile) {
                    deferred.resolve(profile);
                }, function () {
                    deferred.reject();
                });
            }
            return deferred.promise;
        }

        function retrieveOrCreateUserProfile(userData) {
            var deferred = $q.defer();
            findUserProfile(userData.id).then(function (data) {
                if (data) {
                    deferred.resolve(data);
                } else {
                    var newUser = constructUserProfile(userData);
                    createUserProfile(userData.id, newUser).then(function () {
                        deferred.resolve(newUser);
                    }, function (error) {
                        deferred.reject(error);
                    });
                }
            });
            return deferred.promise;
        }


        function getCurrentUserProfile() {
            var deferred = $q.defer(),
                userData = AuthService.getUserData();
            if (profile) {
                deferred.resolve(user);
            } else if (userData) {
                retrieveOrCreateUserProfile(userData).then(function (data) {
                    profile = data;
                    deferred.resolve(profile);
                });
            }
            return deferred.promise;
        }

        function findUserProfile(id) {
            var deferred = $q.defer();
            usersRef.child(id + '/profile').once("value", function (snapshot) {
                deferred.resolve(snapshot.val());
            });
            return deferred.promise;
        }

        function updateUserProfile(newProfile) {
            var deferred = $q.defer();
            usersRef.child(AuthService.getUserId() + '/profile').update(newProfile, function (error) {
                if (error) {
                    deferred.reject();
                } else {
                    profile = newProfile;
                    deferred.resolve();
                }
            });
            return deferred.promise;
        }

        function upload(evt) {
            // console.log("review service");
            var storageRef = firebase.storage().ref();
            var ImageRef = usersRef.child(AuthService.getUserId()).child('profile');
            var deferred = $q.defer();
            var file = evt.target.files[0];
            var metadata = {
                contentType: 'image.*'
            };
            // Push to child path.
            var uploadTask = storageRef.child(AuthService.getUserId() + '.jpg').put(file, metadata);
            // Listen for errors and completion of the upload.
            // [START oncomplete]
            uploadTask.on('state_changed', null,
                function (error) {
                    // [START onfailure]
                    //  console.error('Upload failed:', error);
                    // [END onfailure]
                },
                function () {
                    //console.log('Uploaded', uploadTask.snapshot.totalBytes, 'bytes.');
                    //console.log(uploadTask.snapshot.metadata);
                    var url = uploadTask.snapshot.metadata.downloadURLs[0];
                    // console.log('File available at', url);
                    // [START_EXCLUDE]
                    //console.log(url);
                    // [END_EXCLUDE]
                    ImageRef.update({image: url})
                        .then(function () {
                            deferred.resolve('success');
                        }, function (err) {
                            //console.log(err)
                        });
                });
            // [END oncomplete]
            return deferred.promise;
        }

        function getFriends() {
            console.log("getting friends");
            var providerData = JSON.parse(window.localStorage.providerData);
            var self_id = providerData.id;
            // console.log(token);
            var deferred = $q.defer();
            var friends = {};
            console.log(providerData);
            FB.api('/me/friends', 'get', {
                access_token: providerData.accessToken,
                fields: "id,name,picture, gender, email"
            }, function (response) {
                if (response && !response.error) {
                    console.log(response);

                    angular.forEach(response.data, function (val, key) {
                        console.log(val);
                        if (!friends[val.id] && val.id !== self_id) {
                            friends[val.id] = val;
                        }
                       getFriendsOfFriends(val.id).then(function (friends_of_friends) {
                           console.log(friends_of_friends);
                           angular.forEach(friends_of_friends, function (value, id) {
                               console.log(val);
                               if (!friends[value.id] && value.id !== self_id) {
                                   friends[value.id] = value;
                               }
                               if (key == response.data.length - 1 && id == friends_of_friends.length -1) {
                                   deferred.resolve(friends);
                               }
                           });
                        });
                    });
                } else {
                    //  console.log(response.error);
                    deferred.reject(response.error);
                }

            });
            return deferred.promise;
        }

        function getFriendsOfFriends(friendId) {
            var providerData = JSON.parse(window.localStorage.providerData);
            var deferred = $q.defer();
            var friends = {};
            var path = '/' + friendId + '/friends';
            console.log(path);

            FB.api(path, 'get', {
                access_token: providerData.accessToken,
                fields: "id,name,picture, gender, email"
            }, function (res) {
                if (res && !res.error) {
                    console.log("Friends of friend");
                    console.log(res.data);
                    deferred.resolve(res.data);

                } else {
                    console.log(res.error);
                }

            });
            return deferred.promise;
        }
    });

