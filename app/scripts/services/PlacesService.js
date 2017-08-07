'use strict';

angular.module('defyingGravityApp')
.factory('PlacesService',
  function($q, AuthService, FirebaseService) {
    var firebaseRef = FirebaseService.getFirebaseRef(),
    usersRef = firebaseRef.child('users');
    return {
      addPlace: addPlace,
      deletePlace: deletePlace,
      editPlace: editPlace,
      getCurrentUserPlaces: getCurrentUserPlaces
    };

    function addPlace(place) {
      
      usersRef.child(AuthService.getUserId() + '/places').push(place);
    }

    function deletePlace(id) {
     usersRef.child(AuthService.getUserId() + '/places/' + id).remove();

   }

   function editPlace(id, place) {
    usersRef.child(AuthService.getUserId() + '/places/' + id).update(place);
  }

  function getUserPlaces(userId) {
    var deferred = $q.defer();
    var userPlacesRef = usersRef.child(userId + '/places');
    userPlacesRef.on('value', function(snapshot) {
      deferred.resolve(snapshot.val());
    });
    return deferred.promise;
  }

  function getCurrentUserPlaces() {
    return getUserPlaces(AuthService.getUserId());
  }

});
