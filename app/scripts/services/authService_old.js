'use strict';

angular.module('defyingGravityApp')

    .factory("AuthService", function ($rootScope, $q, $firebaseAuth, FirebaseService, $firebaseArray, $firebaseObject, appConfig) {
        var firebaseRef = FirebaseService.getFirebaseRef(),
            authObj = $firebaseAuth(firebaseRef),
            // authObj = $firebaseAuth(),
            userData;

        var user = {};

        authObj.$onAuth(function (data) {
            userData = data ? constructUserData(data) : null;
            $rootScope.$broadcast('userChanged');
        });

        /*authObj.$onAuthStateChanged(function (data) {
            console.log("$onAuthStateChanged data: "+ data);
            console.log("$onAuthStateChanged data: "+ JSON.stringify(data));
            userData = data ? constructUserData(data) : null;
            $rootScope.$broadcast('userChanged');
        });*/

        return {
            simpleLogin: simpleLogin,
            register: register,
            resetpassword: resetpassword,
            getUserData: getUserData,
            getUserId: getUserId,
            getUserEmail: getUserEmail,
            login: login,
            logout: logout,
            isLoggedIn: isLoggedIn,
            createUserProfile : createUserProfile,
            deleteUserPermanently : deleteUserPermanently
        };

        function deleteUserPermanently(data) {
            console.log("data: "+ JSON.stringify(data));

            console.log("deleteUserPermanently called");
            // var userData = AuthService.getUserData();
            // console.log
            
            var deferred = $q.defer();
            // var ref = new Firebase("https://<YOUR-FIREBASE-APP>.firebaseio.com");
            firebaseRef.removeUser({
                email: "bobtony@firebase.com",
                password: "correcthorsebatterystaple"
            }, function(error) {
                if (error) {
                    switch (error.code) {
                        case "INVALID_USER":
                            console.log("The specified user account does not exist.");
                            break;
                        case "INVALID_PASSWORD":
                            console.log("The specified user account password is incorrect.");
                            break;
                        default:
                            console.log("Error removing user:", error);
                    }
                } else {
                    console.log("User account deleted successfully!");
                }
            });
            return deferred.promise;

            /*var deferred = $q.defer();
            authObj.$deleteUser().then(function(data) {
                console.log("User removed successfully!");
                deferred.resolve(data);
            }).catch(function(error) {
                console.error("Error: ", error);
                deferred.reject(error);
            });
            return deferred.promise;*/
        }

        //TODO: Check this
        function createUserProfile(id, userProfile) {
            var deferred = $q.defer();
            var usersRef = firebaseRef.child('users');
            usersRef.child(id + '/profile').set(userProfile, function (error) {
                if (!error) {
                    deferred.resolve();
                } else {
                    deferred.reject(error);
                }
            });
            return deferred.promise;
        }

        function simpleLogin(user) {

            var deferred = $q.defer();

            authObj.$authWithPassword({
                email: user.email,
                password: user.password
            }).then(function (data) {
              //  window.localStorage.provider = 'password';
                deferred.resolve(constructUserData(data));
            }).catch(function (error) {
                deferred.reject(error);
            });
            return deferred.promise;

            // console.log("login user: "+ user);
            // console.log("login user: "+ JSON.stringify(user));

           /* authObj.$signInWithEmailAndPassword(user.email, user.password).then(function (data) {
               // window.localStorage.provider = 'password';
                deferred.resolve(constructUserData(data));
            }).catch(function (error) {
                deferred.reject(error);
            });
            return deferred.promise;*/
        }

        function register(user) {
            return authObj.$createUser({email: user.email, password: user.password})
             .then(function () {
             var deferred = $q.defer();
             // authenticate so we have permission to write to Firebase

             authObj.$authWithPassword({
             email: user.email,
             password: user.password
             }).then(function (data) {
             //window.localStorage.provider = 'password';

             var newProfile = {
             login: "",
             name: "",
             type: appConfig.types.PERSONAL
             };
             if (user.email) {
             angular.extend(newProfile, {email: user.email});
             }
             //createUserProfile(data.uid, newProfile);
             deferred.resolve(constructUserData(data));
             }).catch(function (error) {
             deferred.reject(error);
             });
             return deferred.promise;
             });

            /*return authObj.$createUserWithEmailAndPassword({email: user.email, password: user.password})
                .then(function () {
                    var deferred = $q.defer();
                    // authenticate so we have permission to write to Firebase

                    authObj.$signInWithEmailAndPassword({
                        email: user.email,
                        password: user.password
                    }).then(function (data) {
                        window.localStorage.provider = 'password';

                        var newProfile = {
                            login: "",
                            name: "",
                            type: types.PERSONAL
                        };
                        if (user.email) {
                            angular.extend(newProfile, {email: user.email});
                        }
                        //createUserProfile(data.uid, newProfile);
                        deferred.resolve(constructUserData(data));
                    }).catch(function (error) {
                        deferred.reject(error);
                    });
                    return deferred.promise;
                });*/
        }

        function resetpassword(user) {
            return authObj.$resetPassword({
                email: user.email
            }).then(function (response) {
                // console.log("Password reset email sent successfully!");
                return response;
            }).catch(function (error) {
                console.error("Error: ", error.message);
                return error;
            });

            /*return authObj.$sendPasswordResetEmail({
                email: user.email
            }).then(function (response) {
                // console.log("Password reset email sent successfully!");
                return response;
            }).catch(function (error) {
                console.error("Error: ", error.message);
                return error;
            });*/
        }

        function constructUserData(data) {
            // console.log("data--: "+ JSON.stringify(data));
            return {
                id: data.uid,
                login: data[data.provider].displayName || "",
                profileImgUrl: data[data.provider].profileImageURL,
                email: data[data.provider].email
            };
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
            console.log("provider: "+ provider);
            var deferred = $q.defer();
            authObj.$authWithOAuthPopup(provider).then(function (data) {
                console.log("data: "+ data);
                deferred.resolve(constructUserData(data));
            }).catch(function (error) {
                console.log("error: "+ error);
                deferred.reject(error);
            });
           /* authObj.$signInWithPopup(provider).then(function (data) {
                console.log("data: "+ data);
                deferred.resolve(constructUserData(data));
            }).catch(function (error) {
                console.log("error: "+ error);
                deferred.reject(error);
            });
            return deferred.promise;*/
        }

        function logout() {
           // window.localStorage.clear();
            authObj.$unauth();
            // authObj.signOut();
        }

        function isLoggedIn() {
            return !!firebaseRef.getAuth();
        }

    });
