'use strict';

angular.module('defyingGravityApp')

    .factory("AuthService", function ($http, $rootScope, $q, $firebaseAuth, FirebaseService, $firebaseArray, $firebaseObject, Notification, appConfig) {
        var firebaseRef = FirebaseService.getFirebaseRef(),
            authObj = $firebaseAuth(),
            userData;
        var user = {};

        authObj.$onAuthStateChanged(function (data) {
            // console.log("$onAuthStateChanged data: " + data);
            // console.log("$onAuthStateChanged data: " + JSON.stringify(data));
            userData = data ? constructUserData(data) : null;
            $rootScope.$broadcast('userChanged');
        });

        return {
            simpleLogin: simpleLogin,
            register: register,
            resetpassword: resetpassword,
            changePassword: changePassword,
            getUserData: getUserData,
            getUserId: getUserId,
            getUserEmail: getUserEmail,
            login: login,
            logout: logout,
            isLoggedIn: isLoggedIn,
            createUserProfile: createUserProfile,
            deleteUserPermanently: deleteUserPermanently,
            reAuthenticate: reAuthenticate,

        };
        function reAuthenticate(password) {
            var user = firebase.auth().currentUser;
            var email = user.providerData[0].email;

            var credential = firebase.auth.EmailAuthProvider.credential(
                email,
                password
            );
            // Prompt the user to re-provide their sign-in credentials
            return user.reauthenticate(credential).then(function () {
                // User re-authenticated.
            }, function (error) {
                // An error happened.
            });

        }

        function deleteUserPermanently(data) {
            var deferred = $q.defer();
            authObj.$deleteUser().then(function (error) {
                if (error) {
                    switch (error.code) {
                        case "INVALID_USER":
                            // console.log("The specified user account does not exist.");
                            break;
                        case "INVALID_PASSWORD":
                            // console.log("The specified user account password is incorrect.");
                            break;
                        default:
                        //   console.log("Error removing user:", error);
                    }
                } else {

                    deleteUserProfile();
                    logout();
                    //console.log("User account deleted successfully!");
                    Notification.success('Account Deleted');
                    window.location.reload();
                }
            });
            return deferred.promise;
        }

        //TODO: Check this
        function createUserProfile(id, userProfile) {
            console.log(id);
            console.log(userProfile)
            var deferred = $q.defer();
            var usersRef = firebaseRef.child('users');
            usersRef.child(id + '/profile').update(userProfile, function (error) {
                if (!error) {
                    console.log("created");
                    deferred.resolve();
                } else {
                    deferred.reject(error);
                }
            });
            return deferred.promise;
        }

        function deleteUserProfile() {
            var usersRef = firebaseRef.child('users');
            usersRef.child(userData.id).remove();
        }

        function simpleLogin(user) {
            var deferred = $q.defer();
            authObj.$signInWithEmailAndPassword(user.email, user.password).then(function (data) {
                window.localStorage.provider = JSON.stringify('password');
                deferred.resolve(constructUserData(data));
            }).catch(function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        }

        function register(user) {
            return authObj.$createUserWithEmailAndPassword(user.email, user.password)
                .then(function () {
                    var deferred = $q.defer();
                    // authenticate so we have permission to write to Firebase
                    authObj.$signInWithEmailAndPassword(
                        user.email,
                        user.password
                    ).then(function (data) {
                        console.log(data);
                        window.localStorage.provider = JSON.stringify('password');
                        // var newProfile = {
                        //     login: "",
                        //     name: "",
                        //     type: appConfig.types.PERSONAL
                        // };
                        // if (user.email) {
                        //     angular.extend(newProfile, {email: user.email});
                        // }
                        //createUserProfile(data.uid, newProfile);
                        deferred.resolve(constructUserData(data));
                    }).catch(function (error) {
                        deferred.reject(error);
                    });
                    return deferred.promise;
                });
        }

        function resetpassword(user) {
            return authObj.$sendPasswordResetEmail(user.email).then(function (response) {
                return response;
            }).catch(function (error) {
                //  console.error("Error: ", error.message);
                return error;
            });
        }

        //Allows User to change Password When Logged in
        function changePassword(user) {
            return authObj.$updatePassword(user.newPassword);
        }

        function constructUserData(data) {
            var img;
            // var provider = JSON.parse(window.localStorage.provider);
            var provider = window.localStorage.provider;
            if (provider == 'password') {
                img = appConfig.defaultUserImage;

            } else {
                img = data.providerData[0].photoURL;
            }
            var userInfo = {
                id: data.uid,
                login: data.providerData[0].displayName || "",
                profileImgUrl: img,
                email: data.providerData[0].email || ""
            };
            return userInfo;
        }

        function getUserData() {
            return userData;
        }

        function getUserId() {
            if (userData) {
                return userData.id;
            } else if (user) {
                return user.uid;
            }
        }

        function getUserEmail() {
            return userData.email;
        }

        function login(provider) {
            var deferred = $q.defer();
            window.localStorage.provider = JSON.stringify(provider);
            var pro = "";
            if (provider == 'google') {
                pro = new firebase.auth.GoogleAuthProvider();
                pro.addScope('https://www.googleapis.com/auth/plus.login');
                pro.addScope('https://www.googleapis.com/auth/userinfo.email');
                pro.addScope('https://www.googleapis.com/auth/userinfo.profile');
            }
            else if (provider == 'facebook') {
                pro = new firebase.auth.FacebookAuthProvider();
                pro.addScope('email');
                pro.addScope('user_friends');
            }
            else if (provider == 'twitter') {
                pro = new firebase.auth.TwitterAuthProvider();
                // pro.addScope('screen_name');
            }

            authObj.$signInWithPopup(pro).then(function (data) {
                console.log("-----data-----");
                console.log(data);
                var credentials = {
                    accessToken: data.credential.accessToken,
                    id: data.user.providerData[0].uid
                };
                window.localStorage.providerData = JSON.stringify(credentials);
                console.log(credentials);
                deferred.resolve(constructUserData(data.user));
            }).catch(function (error) {
                // console.log("error: " + error);
                deferred.reject(error);
            });
            return deferred.promise;
        }


        function logout() {
            window.localStorage.clear();
            authObj.$signOut();
        }

        function isLoggedIn() {
            return firebase.auth().currentUser;
        }

    });
