'use strict';

(function () {
    angular.module('defyingGravityApp')

        .service('PilotsService',
            function ($http, $q, $timeout, $firebaseArray, FirebaseService, GoogleMapService, $modal, $firebaseObject, ReviewService) {
                var firebaseRef = FirebaseService.getFirebaseRef(),
                    usersRef = firebaseRef.child('users'),
                    pilots = [],
                    ReviewWindow;
                return {
                    getPilots: getPilots,
                    loadPilots: loadPilots,
                    findPilotsInArea: findPilotsInArea,
                    findPilotsWithinBound: findPilotsWithinBound,
                    filterPilots: filterPilots,
                    openReviewWindow: openReviewWindow,
                    loadImages: loadImages
                };

                function getPilots() {
                    var deferred = $q.defer();
                    if (pilots) {
                        // console.log("pilots---1: "+ pilots.length);
                        deferred.resolve(pilots);
                    } else {
                        loadPilots().then(function () {
                            // console.log("pilots---2: "+ pilots.length);
                            deferred.resolve(pilots);
                        });
                    }
                    return deferred.promise;
                }

                function loadPilots() {
                    var deferred = $q.defer();
                    usersRef.on('value', function (snapshot) {
                        pilots = [];
                        var users = snapshot.val();
                        _.forEach(users, function (user, id) {
                            _.forEach(user.places, function (place) {
                                if (user.rating) {
                                    _.forEach(user.rating, function (rating) {
                                        pilots.push({
                                            id: id,
                                            profile: user.profile,
                                            place: place,
                                            rating: rating,
                                            notRealUser: user.notRealUser
                                        });
                                    })
                                }
                                else {
                                    pilots.push({
                                        id: id,
                                        profile: user.profile,
                                        place: place,
                                        rating: 0,
                                        notRealUser: user.notRealUser
                                    });
                                }


                            });
                        });
                        // console.log("pilots---3: "+ pilots.length);
                        deferred.resolve(pilots);
                    });
                    return deferred.promise;
                }

                function findPilotsInArea(coords, radius) {
                    var foundPilots = [];
                    pilots.forEach(function (pilot) {
                        if (getDistance(coords, pilot.place.coords) <= radius) {
                            foundPilots.push(pilot);
                        }
                    });
                    return foundPilots;
                }

                function findPilotsWithinBound(bounds) {
                    var foundPilots = [];
                    //console.log(pilots);
                    pilots.forEach(function (pilot) {
                        if(bounds.contains(pilot.place.coords)){
                            //console.log(pilot);
                            foundPilots.push(pilot);
                        }
                    });
                    return foundPilots;
                }

                function getPositionObject(coords) {
                    return new google.maps.LatLng({
                        lat: coords.lat,
                        lng: coords.lng
                    });
                }

                function getDistance(position1, position2) {
                    return google.maps.geometry.spherical.computeDistanceBetween(
                        getPositionObject(position1),
                        getPositionObject(position2)
                    );
                }
                
                function filterPilots(category, safe, filtered_pilots) {
                    var filteredPilots = [];
                    GoogleMapService.removeSearchArea();
                    if (filtered_pilots !== null) {
                        filtered_pilots.forEach(function (pilot) {
                            if (!category || pilot.profile.category == category) {
                                if (!safe) {
                                    filteredPilots.push(pilot);
                                } else if (safe == 'No' || false) {
                                    if (pilot.profile.safety == 'No' || false) {
                                        filteredPilots.push(pilot);
                                    }
                                } else if (safe == 'Yes' || true) {
                                    if (pilot.profile.safety !== 'No' || false) {
                                        filteredPilots.push(pilot);
                                    }
                                }
                            }
                        });
                    } else {
                        pilots.forEach(function (pilot) {
                            if (pilot.profile) {
                                if (!category || pilot.profile.category == category) {
                                    if (!safe) {
                                        filteredPilots.push(pilot);
                                    } else if (safe == 'No' || false) {
                                        if (pilot.profile.safety == 'No' || false) {
                                            filteredPilots.push(pilot);
                                        }
                                    } else if (safe == 'Yes' || true) {
                                        if (!pilot.profile.safety || pilot.profile.safety !== ('No' || false)) {
                                            filteredPilots.push(pilot);
                                        }
                                    }
                                }
                            }

                        });
                    }

                    return filteredPilots;
                }


                function openReviewWindow(pilotdata) {
                    ReviewWindow = $modal.open({
                        size: 'md',
                        templateUrl: 'views/review-modal.html',
                        controller: 'ReviewController',
                        resolve: {
                            pilot: function () {
                                return pilotdata;
                            }
                        }
                    });
                }

                function loadImages(id) {
                    var media = [];
                    var imageRef = usersRef.child(id).child("Images");
                    var videoRef = usersRef.child(id).child("Videos");
                    var deferred = $q.defer();
                    imageRef.on("child_added", function (image) {
                        media.push(image.val());
                    });
                    videoRef.on("child_added", function (video) {
                      //  console.log(video);
                        media.push(video.val());
                       /* var v = document.createElement("video");
                        v.setAttribute('src', video.val().video);
                        var theCanvas =document.createElement("canvas");
                        $timeout(function () {
                           // v.addEventListener('pause', function () {
                                var vid = {
                                    video : video.val().video,
                                    thumb:  drawImage(v, theCanvas) || ""
                                };
                                console.log(vid);
                                media.push(vid);
                         //   }, false);

                        })*/
                    });
                    deferred.resolve(media);
                    return deferred.promise;
                }

                /*function drawImage(video, theCanvas) {
                    // get the canvas context for drawing
                    //var context = theCanvas.getContext('2d');

                    // draw the video contents into the canvas x, y, width, height
                    //context.drawImage(video, 0, 0, theCanvas.width, theCanvas.height);
                    theCanvas.getContext('2d').drawImage(video, 0, 0);

                    // get the image data from the canvas object
                   // var dataURL = theCanvas.toDataURL();
                    var dataURL = theCanvas.toDataURL("image/png");

                    // set the source of the img tag
                   // img.setAttribute('src', dataURL);
                    return dataURL;
                }*/

            });


})();
