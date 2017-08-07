'use strict';

angular.module('defyingGravityApp')
    .controller('PilotsController',
        function ($state, $scope, $http, $sce, GoogleMapService, PilotsService, $rootScope, MessagesService, LoginService, AuthService, ReviewService, $timeout, FirebaseService, ProfileService) {
            $scope.pilots = [];
            $scope.users = {};
            $scope.onePanelAtATime = true;
            $scope.isFirstPanelOpen = true;
            $scope.showPilotsList = false;
            $scope.isAddPanelOpen = false;
            $scope.pilotsLoaded = false;
            $scope.sidenav = 'sidenavWindow';
            $scope.showPilotMarker = showPilotMarker;
            $scope.groupByUsers = groupByUsers;
            $scope.getAllPilots = getAllPilots;
            $scope.getPilotsCountMessage = getPilotsCountMessage;
            $scope.isPilotsListDisabled = isPilotsListDisabled;
            $scope.toggleList = toggleList;
            $scope.setPilots = setPilots;
            $scope.openNav = openNav;
            $scope.closeNav = closeNav;
            $scope.panels = true;
            $scope.openReviewModal = openReviewModal;
            $scope.openSendMessageModal = openSendMessageModal;
            $scope.openAddPhotoModal = openAddPhotoModal;
            $scope.viewAllImagesmodal = viewAllImagesmodal;
            $scope.previous = previous;
            $scope.next = next;
            $scope.opensearch = opensearch;
            $scope.closeSearch = closeSearch;
            $scope.userData = AuthService.getUserData();
            $scope.openAllReviews = openAllReviews;
            $scope.viewProfile = viewProfile;
            $scope.videoPlaying = false;
            $scope.playPauseVideo = playPauseVideo;
            // $scope.selectFirst = selectFirst;

            var firebaseRef = FirebaseService.getFirebaseRef(),
                usersRef = firebaseRef.child('users');

            document.getElementById("mySidenav").style.display = "none";
            document.getElementById("searchMenu").style.display = "none";

            // getUserLocation();
            // function getUserLocation() {
            //
            //     var geocoder;
            //     if (navigator.geolocation) {
            //         navigator.geolocation.getCurrentPosition(
            //             function successFunction(position) {
            //                 var lat = position.coords.latitude;
            //                 var lng = position.coords.longitude;
            //                 codeLatLng(lat, lng)
            //             },
            //             function errorFunction() {
            //                 // gets users current location
            //                 $.get("http://ipinfo.io", function (response) {
            //                     $http.get('../scripts/country_names.json').success(function (data) {
            //                         var res_cou = response.country;
            //                         $scope.country = data[res_cou];
            //                     });
            //                 }, "jsonp");
            //             });
            //     }
            //
            //     //Get the latitude and the longitude;
            //     function codeLatLng(lat, lng) {
            //         geocoder = new google.maps.Geocoder();
            //         var latlng = new google.maps.LatLng(lat, lng);
            //         geocoder.geocode({'latLng': latlng}, function (results, status) {
            //             if (status == google.maps.GeocoderStatus.OK) {
            //                 console.log(results)
            //                 for (var i = 0; i < results[0].address_components.length; i++) {
            //                     var shortname = results[0].address_components[i].short_name;
            //                     var longname = results[0].address_components[i].long_name;
            //                     var type = results[0].address_components[i].types;
            //                     if (type.indexOf("country") != -1) {
            //                         console.log(shortname)
            //                         console.log(longname);
            //                         $scope.country = longname;
            //                     }
            //                 }
            //             }
            //         });
            //     }
            // }

            activate();

            function activate() {
                // console.log($scope.userData);
                GoogleMapService.initMap();
                PilotsService.loadPilots().then(function (pilots) {
                    $scope.totalpilotsCount = pilots.length === 1 ? pilots.length + ' result found' : pilots.length + ' results found';
                    setPilots(pilots);
                    groupByUsers();
                    $scope.pilotsLoaded = true;
                });
            }


            function isLoggedIn() {
                return AuthService.isLoggedIn();
            }

            function showPilotMarker(pilot) {
                //console.log(pilot);
                var position = "";
                if (pilot.place) {
                    position = pilot.place.coords;
                } else {
                    position = pilot.places[0].coords;

                }
                GoogleMapService.showPilot(position, 14);
            }

            function groupByUsers() {
                var users = {};
                _.forEach($scope.pilots, function (pilot) {
                    if (users[pilot.id]) {
                        users[pilot.id].places.push(pilot.place);
                    }
                    else {
                        users[pilot.id] = {
                            id: pilot.id,
                            profile: pilot.profile,
                            places: [pilot.place],
                            rating: pilot.rating,
                            notRealUser: pilot.notRealUser
                        };
                    }
                });
                $scope.users = users;
            }

            function getAllPilots() {
                PilotsService.getPilots().then(function (data) {
                    setPilots(data);
                });
            }

            function getPilotsCountMessage() {
                var totalpilotsCount = $scope.pilots.length === 1 ? $scope.pilots.length + ' result found' : $scope.pilots.length + ' results found';
                $scope.totalpilotsCount = totalpilotsCount;
                return totalpilotsCount;
            }

            function isPilotsListDisabled() {
                return $scope.pilots.length === 0;
            }

            function toggleList() {
                $scope.showPilotsList = !$scope.showPilotsList;
            }


            function setPilots(data) {
                $scope.pilots = data;
                GoogleMapService.setMarkers($scope.pilots);
            }

            function getStarAverage(id) {
                ReviewService.getAverage(id).then(function (average) {
                    // console.log(average);
                    $scope.emptyStars = [];
                    $scope.filledStars = [];
                    if (average) {
                        var count = 0;
                        $scope.average = average;
                        // console.log($scope.average);
                        if (average >= 0) {
                            for (var i = 0; i < 5; i++) {
                                if (average < (i + 0.5)) {
                                    count++;
                                    $scope.emptyStars.push(count);
                                } else {
                                    count++;
                                    $scope.filledStars.push(count);
                                }
                            }
                        }
                    }
                })

            }

            function getReviews(id) {
                ReviewService.getReviews(id).then(function (data) {
                    $scope.reviews = null;
                    $scope.one_star = 0;
                    $scope.two_star = 0;
                    $scope.three_star = 0
                    $scope.four_star = 0;
                    $scope.five_star = 0;
                    if (data) {
                        $scope.reviews = data;
                        for (var i = 0; i < data.length; i++) {
                            var rate = data[i].rating;
                            // console.log(rate);
                            if (rate == 5) {
                                $scope.five_star++;
                            }
                            else if (rate == 4) {
                                $scope.four_star++;
                            }
                            else if (rate == 3) {
                                $scope.three_star++;
                            }
                            else if (rate == 2) {
                                $scope.two_star++;
                            }
                            else if (rate == 1) {
                                $scope.one_star++;

                            }

                            // console.log("two_star"+$scope.two_star)
                            //     console.log("five_star"+$scope.five_star);
                            //     console.log("four_star"+$scope.four_star);
                            //     console.log("three_star"+$scope.three_star);
                            //     console.log("one_star"+$scope.one_star);
                            $scope.five = ($scope.five_star / $scope.reviews.length) * 100;
                            $scope.four = ($scope.four_star / $scope.reviews.length) * 100;
                            $scope.three = ($scope.three_star / $scope.reviews.length) * 100;
                            $scope.two = ($scope.two_star / $scope.reviews.length) * 100;
                            $scope.one = ($scope.one_star / $scope.reviews.length) * 100;
                        }

                    }
                });
            }

            function loadReviewImages(id) {
                PilotsService.loadImages(id).then(function (media) {
                    // console.log("-----media----");
                    //  console.log(media);
                    if (media.length > 0) {
                        $scope.media = media;
                        $scope.index = 0;
                        $scope.selectedimage = $scope.media[$scope.index];
                    }
                    else {
                        $scope.media = undefined;
                    }
                })
            }


            function openReviewModal(pilotdata) {
                PilotsService.openReviewWindow(pilotdata);
            }

            function openSendMessageModal(id, user) {
                //console.log(id);
                MessagesService.openSendMessageWindow(id, user);

            }

            function openAddPhotoModal(pilotdata) {
                ReviewService.openAddPhotoWindow(pilotdata);

            }

            function viewAllImagesmodal(images) {
                ReviewService.openViewImagesWindow(images);
            }

            function viewProfile(id, user) {
                //console.log("viewProfile");
                //console.log(user.id);
                //console.log(user);
                $scope.showPilotMarker(user);
                $scope.openNav(user.id, user);


            }


            function previous() {
                if ($scope.index > 0) {
                    if ($scope.videoPlaying == true) {
                        var vid = document.getElementById("videoContainer");
                        if (vid) {
                            vid.pause();
                            $scope.index--;
                            $timeout(function () {
                                $scope.selectedimage = $scope.media[$scope.index];
                            }, 1000)

                            $scope.videoPlaying = false;
                        }

                    } else {
                        $scope.index--;
                        $scope.selectedimage = $scope.media[$scope.index];
                    }
                    //  console.log($scope.index);
                }
            }

            function next() {
                if ($scope.index < $scope.media.length - 1) {

                    if ($scope.videoPlaying == true) {
                        var vid = document.getElementById("videoContainer");
                        if (vid) {
                            vid.pause();
                            $scope.index++;
                            $timeout(function () {
                                $scope.selectedimage = $scope.media[$scope.index];
                            }, 1000)
                            $scope.videoPlaying = false;
                        }

                    } else {
                        $scope.index++;
                        $scope.selectedimage = $scope.media[$scope.index];
                    }


                    // console.log($scope.index);
                }
            }

            function openAllReviews(pilot) {
                ReviewService.openAllReviewsModal(pilot);

            }

            $scope.trustSrc = function (src) {
                // console.log("----src----");
                // console.log(src);
                return $sce.trustAsResourceUrl(src);

            }

            // function filterPilots(SearchStr) {
            //     var filtered = {};
            //     var pilots = $.map($scope.users, function (el) {
            //         return el
            //     });
            //
            //     for (var i = 0; i < pilots.length; i++) {
            //         var location = "";
            //         for (var j = 0; j < pilots[i].places.length; j++) {
            //             location = JSON.stringify(pilots[i].places[j].location);
            //             if (location.includes(SearchStr)) {
            //                 //console.log(pilots[i]);
            //                 // console.log(location);
            //                 // console.log(SearchStr);
            //                 if (filtered[i]) {
            //                     filtered[i].places.push(pilots[i].places[j]);
            //                 } else {
            //                     filtered[i] = {
            //                         id : pilots[i].id,
            //                         profile: pilots[i].profile,
            //                         places: [pilots[i].places[j]],
            //                         rating :   parseInt(Math.round(pilots[i].rating)),
            //                         notRealUser: pilots[i].notRealUser
            //                     };
            //                 }
            //             }
            //         }
            //     }
            //     $rootScope.filteredPilots = filtered;
            //     console.log($rootScope.filteredPilots);
            // }

            function opensearch() {
                //filterPilots($scope.country);
                // closeNav();
                //closeSearch()
                //console.log("opensearch");
                var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;

                if (!window.cordova && width > 450) {
                    $scope.deviceIsCordova = false;
                    $scope.sidenav = 'sidenavWindow';
                    $scope.panels = false;
                    // if (width >= 1000) {
                    //     $scope.panels = true;
                    // } else {
                    //     $scope.panels = false;
                    // }

                    $timeout(function () {
                        $rootScope.IsSearchOpen = true;
                        document.getElementById("searchMenu").style.width = "25%";
                        document.getElementById("searchMenu").style.display = "block";
                        // document.getElementById("searchMenu").style.z-index = "100";
                    })
                }
                else if (window.cordova || width < 450) {
                    $scope.deviceIsCordova = true;
                    $scope.panels = false;
                    $scope.sidenav = 'sidenavCordova';
                    $timeout(function () {
                        $rootScope.IsSearchOpen = true;
                        document.getElementById("searchMenu").style.width = "100%";
                        document.getElementById("searchMenu").style.display = "block";
                    })
                }

            }

            function closeSearch() {
                var searchMenu = document.getElementById("searchMenu");
                searchMenu.scrollTop = 0;
                searchMenu.style.width = "0";
                searchMenu.style.display = "none";
                $rootScope.IsSearchOpen = false;
                $scope.panels = true;
            }

            function openNav(id, pilot) {
                // console.log(id,pilot);
                var mySidenav = document.getElementById("mySidenav");
                mySidenav.scrollTop = 0;
                //closeNav();
                //closeSearch();
                $scope.average = 0;
                $scope.rating = 0;
                $scope.media = undefined;
                $scope.reviews = null;
                $scope.one = 0;
                $scope.two = 0;
                $scope.three = 0
                $scope.four = 0;
                $scope.five = 0;
                var friends = [];
                // $scope.one_star = 0;
                // $scope.two_star = 0;
                // $scope.three_star = 0
                // $scope.four_star = 0;
                // $scope.five_star = 0;
                $scope.pilotdata = pilot;
                $scope.pilotdata.id = id;
                var profile = $scope.pilotdata.profile;
                $scope.contact = profile.safety || profile.aerial_tours || profile.general_QA
                    || profile.copilot || profile.handler || profile.help || profile.paired;

                var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
                if (!window.cordova && width > 450) {
                    $scope.deviceIsCordova = false;
                    $scope.sidenav = 'sidenavWindow';
                    $scope.panels = false;
                    // if (width >= 1000) {
                    //     $scope.panels = true;
                    // } else {
                    //     $scope.panels = false;
                    // }
                    getStarAverage(id);
                    getReviews(id);
                    loadReviewImages(id);
                    $timeout(function () {
                        document.getElementById("mySidenav").style.width = "25%";
                        document.getElementById("mySidenav").style.display = "block";
                        $scope.IsProfileViewOpen = true;
                    });

                }
                else if (window.cordova || width < 450) {
                    //console.log("cordova");
                    $scope.deviceIsCordova = true;
                    $scope.panels = false;
                    $scope.sidenav = 'sidenavCordova';
                    getStarAverage(id);
                    getReviews(id);
                    loadReviewImages(id);
                    $timeout(function () {
                        document.getElementById("mySidenav").style.width = "100%";
                        document.getElementById("mySidenav").style.display = "block";
                        $scope.IsProfileViewOpen = true;
                    });
                    // ProfileService.getFriends().then(function (friends) {
                    //     console.log("----friends----");
                    //     angular.forEach(friends, function (val) {
                    //         friends.push(val);
                    //         console.log($scope.friends);
                    //         $scope.friends = friends;
                    //     });
                    // });
                }
                // var provider = JSON.parse(window.localStorage.provider);
                // console.log(provider);
                // console.log(provider === 'facebook');
                // console.log(provider === "facebook");
                // if (provider == 'facebook') {
                //     console.log("Loading friends");
                //     ProfileService.getFriends().then(function (friends) {
                //         console.log("----friends----");
                //         console.log(friends);
                //         $scope.friends = friends;
                //     });
                // }

                // usersRef.child(id + '/rating').on('child_changed', function (data) {
                usersRef.child(id + '/review').on('child_added', function (data) {
                    if (data) {
                        //     console.log("review added :" + data);
                        getStarAverage(id);
                        getReviews(id);
                    }
                });
            }

            function closeNav() {
                $scope.IsProfileViewOpen = false;
                var mySidenav = document.getElementById("mySidenav");
                mySidenav.scrollTop = 0;
                mySidenav.style.width = "0";
                mySidenav.style.display = "none";

                if ($rootScope.IsSearchOpen) {
                    $scope.panels = false;
                } else {
                    $scope.panels = true;
                }

            }

            $scope.$on('userChanged', function () {
                if (AuthService.isLoggedIn()) {
                    $scope.userData = AuthService.getUserData();

                    ProfileService.findUserProfile($scope.userData.id).then(function (result) {
                        //console.log(result);
                        if (result == null) {
                            $state.go('profile');
                        }
                        else {
                            $rootScope.userImg = result.image;
                        }

                    })
                }
            });

            $rootScope.$on('mapmenu', function (event, id, pilot) {
                $scope.openNav(id, pilot);
            });

            // $rootScope.$on('showFilteredPilots', function (event, searchAddressDetails) {
            //     console.log(searchAddressDetails);
            //     filterPilots(searchAddressDetails);
            // });

            $rootScope.$on('opensearch', function (event) {
                opensearch();
            });
            $rootScope.$on("loadPilots", function () {
                //console.log("loadingPilots------data changed");
                $scope.pilots = [];
                $scope.users = {};
                $scope.pilotsLoaded = false;
                GoogleMapService.removeMarkers();
                $timeout(function () {
                    PilotsService.loadPilots().then(function (pilots) {
                        setPilots(pilots);
                        groupByUsers();
                        $scope.pilotsLoaded = true;
                    });
                }, 10);

            });


            $(".modal-fullscreen").on('show.bs.modal', function () {
                setTimeout(function () {
                    $(".modal-backdrop").addClass("modal-backdrop-fullscreen");
                }, 0);
            });
            $(".modal-fullscreen").on('hidden.bs.modal', function () {
                $(".modal-backdrop").addClass("modal-backdrop-fullscreen");
                var vid = document.getElementById("videoContainer");
                if (vid) {
                    vid.pause();
                }
            });

            function playPauseVideo() {
                var vid = document.getElementById("videoContainer");
                if (vid) {
                    if ($scope.videoPlaying == true) {
                        $scope.videoPlaying = false;
                        vid.pause();
                    } else if ($scope.videoPlaying == false) {
                        setTimeout(function() {
                            if (vid.paused) {
                                $scope.videoPlaying = true;
                                vid.play();
                            }
                        }, 100);
                    }
                }
            };


            //On photo upload reload data for current pilot so new uploaded videos and photos show up on profile
            $rootScope.$on('onPhotoUploadComplete', function (e, data) {
                console.log("onPhotoUploadComplete---");
                console.log(data.args);
                loadReviewImages(data.args.id);
            })


        });
