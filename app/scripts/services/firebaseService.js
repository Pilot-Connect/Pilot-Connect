'use strict';

angular.module('defyingGravityApp')

  .factory("FirebaseService", function () {
      var firebaseRef =  firebase.database().ref();

    return {
      getFirebaseRef: getFirebaseRef
    };

    function getFirebaseRef() {
      return firebaseRef;
    }
  });
