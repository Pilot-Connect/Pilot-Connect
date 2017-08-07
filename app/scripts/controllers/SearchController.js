'use strict';

angular.module('defyingGravityApp')
    .controller('SearchController',
        function ($scope, $rootScope, PilotsService, GoogleMapService, $timeout, appConfig) {

            $rootScope.searchParams = {
                searchAddress: "",
                searchAddressDetails: "",
                searchAddressOptions: {},
                searchAreaRadius: 100000,
                keyword: ""
            };

            $scope.areasOfSearch = [{
                name: 'Within 10 km',
                valueInMeters: 10000
            }, {
                name: 'Within 100 km',
                valueInMeters: 100000
            }, {
                name: 'Within 200 km',
                valueInMeters: 200000
            }, {
                name: 'Within 500 km',
                valueInMeters: 500000
            }, {
                name: 'Within 1000 km',
                valueInMeters: 1000000
            }];

            $rootScope.searchParams.searchAreaRadius = $scope.areasOfSearch[1].valueInMeters;
            $scope.moveSearch = false;
            // $scope.isSearchButtonDisabled = isSearchButtonDisabled;
            $scope.searchForCurrentPosition = searchForCurrentPosition;
            $scope.reset = reset;
            $scope.searchPilots = searchPilots;
            $scope.aircraftCategories = appConfig.aircraftCategories;
            $scope.safety = appConfig.safety;
            $scope.showFilters = true;
            $scope.showPilots = false;
            $scope.searchPilotsByBounds = searchPilotsByBounds;
            $scope.searchPilotsInBound = searchPilotsInBound;
            $rootScope.filters = {
                safety: undefined,
                category: undefined
            };

            // $scope.selectFirst = selectFirst;

            /*function isSearchButtonDisabled() {
                if ($scope.moveSearch == true) {
                    console.log("true");
                    return true;
                } else {
                    console.log(!($scope.searchParams.searchAddressDetails || $rootScope.filters.category || $rootScope.filters.safety));
                    return !($scope.searchParams.searchAddressDetails || $rootScope.filters.category || $rootScope.filters.safety);
                }
            }*/

            function searchForCurrentPosition() {
                GeolocationService.getCurrentGeolocation().then(function (position) {
                    searchPilotsByPosition(position, $scope.searchParams.searchAreaRadius);
                })
            }

            function searchPilots() {
                $rootScope.search = true;
                $scope.showPilots = true;
                $timeout(function () {
                    var searchAddressDetails = $rootScope.searchParams.searchAddressDetails;
                    console.log(searchAddressDetails);
                    console.log(searchAddressDetails.geometry.location);

                    if (searchAddressDetails.geometry.location != "" || undefined) {
                        $rootScope.$broadcast('opensearch');
                        var position = {
                            lat: searchAddressDetails.geometry.location.lat(),
                            lng: searchAddressDetails.geometry.location.lng()
                        };
                        searchPilotsByPosition(position, $scope.searchParams.searchAreaRadius);
                    }
                    else {
                        $scope.setPilots(PilotsService.filterPilots($rootScope.filters.category, $rootScope.filters.safety, null));
                    }

                });
            }


            function searchPilotsByPosition(position, radius) {
                var zoom = 6;
                GoogleMapService.removeSearchArea();
                var pilots = PilotsService.findPilotsInArea(position, radius);
                $scope.setPilots(pilots);
                var filtered_pilots = PilotsService.filterPilots($rootScope.filters.category, $rootScope.filters.safety, pilots)
                $rootScope.filteredPilots = filtered_pilots;

                $scope.setPilots(filtered_pilots);
                if (radius == 1000000) {
                    zoom = 5;
                } else if (radius >= 200000) {
                    zoom = 6;
                } else {
                    zoom = 8;
                }

                GoogleMapService.setSearchArea(position, radius, zoom);
            }


            function searchPilotsByBounds(bounds) {
                // GoogleMapService.removeSearchArea();
                var pilotsInBound = PilotsService.findPilotsWithinBound(bounds);
                $scope.setPilots(pilotsInBound);
                $timeout(function () {
                    $rootScope.filteredPilots = pilotsInBound;
                    $scope.$apply();
                }, 100)

            }

            function searchPilotsInBound(val) {
                $scope.moveSearch = val;
            }

            function reset() {
                $rootScope.IsSearchOpen = false;
                GoogleMapService.removeSearchArea();
                $rootScope.filters.category = undefined;
                $rootScope.filters.safety = undefined;
                $rootScope.searchParams.searchAddress = undefined;
                $rootScope.searchParams.searchAddressDetails = undefined;
                $rootScope.searchAreaRadius = $scope.areasOfSearch[1].valueInMeters;
                $rootScope.searchParams.searchAreaRadius = $scope.areasOfSearch[1].valueInMeters;
                $rootScope.filteredPilots = [];
                $scope.getAllPilots();
            }

            var searchBox = document.getElementById("searchBox");

            /*function selectFirst(event) {
                // console.log("enter");
                // console.log($scope.searchParams.searchAddressOptions);
                var firstResult = $(".pac-container .pac-item:first").text();
                console.log(firstResult);
                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({"address": firstResult}, function (results, status) {
                    console.log(results);
                    if (status == google.maps.GeocoderStatus.OK) {

                        var lat = results[0].geometry.location.lat(),
                            lng = results[0].geometry.location.lng(),
                            placeName = results[0].formatted_address,
                            latlng = new google.maps.LatLng(lat, lng);
                        $rootScope.searchParams.searchAddress = placeName;
                        $rootScope.searchParams.searchAddressDetails = results[0];
                        $scope.$apply();
                        // console.log($rootScope.searchParams);
                        $(".pac-container .pac-item:first").addClass("pac-selected");
                        $(".pac-container").css("display", "none");
                        // $("#searchBox").val(placeName);
                        // $(".pac-container").css("visibility","hidden");


                    }
                });
            }*/

            var pac_input;

            if (document.getElementById('searchBox1')) {
                pac_input = document.getElementById('searchBox1');
            } else if (document.getElementById('searchBox2')) {
                pac_input = document.getElementById('searchBox2');
            }


            if (pac_input) {
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
            }

            $scope.$on('boundSearch', function (event, bounds) {
                if ($rootScope.IsSearchOpen == true && $rootScope.search == false) {
                    searchPilotsByBounds(bounds);
                }

            });
        });
