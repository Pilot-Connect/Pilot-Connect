'use strict';

angular.module('defyingGravityApp')
  .controller('PlacesController',
    function($scope, PlacesService, Notification, $timeout) {

      $scope.showPlaceEditor = false;
      $scope.placeToEditId = null;
      $scope.editPlace = editPlace;
      $scope.deletePlace = deletePlace;
      $scope.dismiss = dismiss;
      $scope.getButtonCaption = getButtonCaption;
      $scope.isSaveDisabled = isSaveDisabled;
      $scope.isEdited = isEdited;
      $scope.noPlaces = noPlaces;
      $scope.save = save;
        // $scope.selectFirst = selectFirst;

      activate();

        // function selectFirst(event) {
        //     // console.log("enter");
        //     // console.log($scope.searchParams.searchAddressOptions);
        //     var firstResult = $(".pac-container .pac-item:first").text();
        //     console.log(firstResult);
        //     var geocoder = new google.maps.Geocoder();
        //     geocoder.geocode({"address": firstResult}, function (results, status) {
        //         console.log(results);
        //         if (status == google.maps.GeocoderStatus.OK) {
        //
        //             var lat = results[0].geometry.location.lat(),
        //                 lng = results[0].geometry.location.lng(),
        //                 placeName = results[0].formatted_address,
        //                 latlng = new google.maps.LatLng(lat, lng);
        //             $scope.address.location = placeName;
        //             $scope.address.details = results[0];
        //             $scope.$apply();
        //             // console.log($scope.address);
        //             $(".pac-container .pac-item:first").addClass("pac-selected");
        //             $(".pac-container").css("display", "none");
        //             // $("#searchBox").val(placeName);
        //             // $(".pac-container").css("visibility","hidden");
        //
        //
        //         }
        //     });
        // }

        var pac_input = document.getElementById('searchTextField');

        (function pacSelectFirst(input) {
            // store the original event binding function
            var _addEventListener = (input.addEventListener) ? input.addEventListener : input.attachEvent;

            function addEventListenerWrapper(type, listener) {
                // Simulate a 'down arrow' keypress on hitting 'return' when no pac suggestion is selected,
                // and then trigger the original listener.

                if (type == "keydown") {
                    var orig_listener = listener;
                    listener = function (event) {
                        var suggestion_selected = $(".pac-item-selected").length > 0;
                        if (event.which == 13 && !suggestion_selected) {
                            var simulated_downarrow = $.Event("keydown", {keyCode: 40, which: 40})
                            orig_listener.apply(input, [simulated_downarrow]);
                        }

                        orig_listener.apply(input, [event]);
                    };
                }

                // add the modified listener
                _addEventListener.apply(input, [type, listener]);
            }

            if (input.addEventListener)
                input.addEventListener = addEventListenerWrapper;
            else if (input.attachEvent)
                input.attachEvent = addEventListenerWrapper;

        })(pac_input);

      function activate() {
        resetAddress();
          $timeout(function () {
              updatePlaces();
          },100)

      }

      function constructAddressObject(address) {
        return {
          location: address.location,
          coords: {
            lat: address.details.geometry.location.lat(),
            lng: address.details.geometry.location.lng()
          }
        }
      }

      function editPlace(id) {
        $scope.placeToEditId = id;
      }

      function deletePlace(id) {
        PlacesService.deletePlace(id);
        updatePlaces();
        Notification.success('Address deleted');
      }

      function dismiss() {
        resetAddress();
        $scope.placeToEditId = null;
      }

      function getButtonCaption() {
        return $scope.placeToEditId ? 'Change' : 'Add';
      }

      function isSaveDisabled() {
        return !$scope.address.details;
      }

      function isEdited(id) {
        return id === $scope.placeToEditId;
      }

      function resetAddress() {
        $scope.address = {
          location: '',
          options: null,
          details: null
        };
      }

      function noPlaces() {

              return !$scope.userPlaces || $scope.userPlaces === 0;
      }

      function save(id, address) {
          //console.log(address);
          // console.log($scope.address);
        if (id) {
          PlacesService.editPlace(id, constructAddressObject(address));
          Notification.success('Place edited');
          $scope.placeToEditId = null;
        } else {
          PlacesService.addPlace(constructAddressObject(address));
          Notification.success('Place added');
        }
        resetAddress();
        updatePlaces();
      }

      function updatePlaces() {
         // console.log("update places");
        PlacesService.getCurrentUserPlaces().then(function(userPlaces) {
          //  console.log(userPlaces);
          $scope.userPlaces = userPlaces;
        });
      }
    });
