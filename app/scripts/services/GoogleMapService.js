'use strict';

angular.module('defyingGravityApp')

    .factory("GoogleMapService",
        function (appConfig, $rootScope, $compile, $timeout, MessagesService, ReviewService) {

            var map,
                markerCluster,
                pilotMarkerInfoWindow,
                searchCircle,
                bounds;
            return {
                addNewMarker: addNewMarker,
                initMap: initMap,
                setMarkers: setMarkers,
                showPilot: showPilot,
                setSearchArea: setSearchArea,
                removeSearchArea: removeSearchArea,
                removeMarkers: removeMarkers
            };

            function addMarker(pilot, coords) {
                var marker = new google.maps.Marker({
                    position: coords,
                    icon :"/images/red-dot.png"
                });
                // marker.setIcon("/images/red-dot.png");
                var min = 0.999999;
                var max = 1.000001;

                var allMarkers = markerCluster.getMarkers();
                //check to see if any of the existing markers match the latlng of the new marker
                if (allMarkers.length != 0) {
                    for (var i = 0; i < allMarkers.length; i++) {
                        var existingMarker = allMarkers[i];
                        var pos = existingMarker.getPosition();
                        var lng = pos.lng();
                        var lat = pos.lat();
                        if (coords.lat == lat && coords.lng == lng) {
                            var newLat = coords.lat + (Math.random() - .5) / 1500 * (Math.random() * (max - min) + min);
                            var newLng = coords.lng + (Math.random() - .5) / 1500 * (Math.random() * (max - min) + min);
                            var finalLatLng = new google.maps.LatLng(newLat, newLng);

                            marker = new google.maps.Marker({
                                position: finalLatLng,
                                icon :"/images/red-dot.png"
                            });
                        }
                    }
                }

                marker.addListener('click', function () {
                    resetMarkerIcons();
                    marker.setIcon("/images/icon_green.png");
                    $rootScope.$broadcast('mapmenu', pilot.id, pilot);
                });

                function resetMarkerIcons() {
                    var allMarkers = markerCluster.getMarkers();
                    //  reset all the icons back to normal except the one you clicked
                    for (var i = 0; i < allMarkers.length; i++) {
                        allMarkers[i].setIcon("/images/red-dot.png");
                    }

                }
                
                marker.addListener('mouseover', function () {
                    if (!pilotMarkerInfoWindow) {
                        createPilotMarkerInfoWindow();
                    }
                    pilotMarkerInfoWindow.setContent(createPilotMarkerInfoWindowContent(pilot));
                    $timeout(function () {
                            pilotMarkerInfoWindow.open(map, marker)
                        }
                    );
                    map.setCenter(marker.getPosition());
                });
                marker.addListener('mouseout', function () {
                    pilotMarkerInfoWindow.close();

                });
                bounds.extend(marker.getPosition());
                markerCluster.addMarker(marker);

            }

            function addNewMarker(pilot) {
                addMarker(pilot);
                map.setCenter(pilot.place.coords);
            }

            function initMap() {
                map = new google.maps.Map(document.getElementById(appConfig.mapId), {
                    center: appConfig.defaultGeolocation,
                    zoom: 6,
                    mapTypeControl: false
                });
                var options = {
                    imagePath: 'images/m'
                };
                markerCluster = new MarkerClusterer(map, "", options);

                map.addListener('zoom_changed', function () {
                        $rootScope.$broadcast('boundSearch', map.getBounds());
                        $rootScope.search = false;
                    
                });
                map.addListener('dragend', function () {
                    $rootScope.$broadcast('boundSearch', map.getBounds());
                    $rootScope.search = false;
                });

            }

            function createPilotMarkerInfoWindow() {
                pilotMarkerInfoWindow = new google.maps.InfoWindow({
                    map: map,
                    maxWidth: 400
                });
            }

            function createPilotMarkerInfoWindowContent(pilot) {
                $rootScope.pfimage = pilot.profile.image || 'images/user-01.png';
                $rootScope.argum = pilot.id + "," + pilot;
                var contentString = "<table  id='infoBox'>" + "<tr>"
                    + " <td style='margin-right : 2px'>"
                    + "<img data-ng-src='{{pfimage}}' style='width:100px; height:100px;'>"
                    + "</td>" + "<td >";
                //pilot name
                contentString += "<div style='margin-left : 8px; max-width:350px; max-height:150px;'><p><b>" + pilot.profile.name + " </b>" + "</p>";
                //pilot location
                contentString += "<p>" + pilot.place.location + "</p>";

                //pilot info
                if (pilot.profile.info) {
                    contentString += "<p>" + pilot.profile.info + "</p>";
                }
                //Rating
                var rating = pilot.rating;
                var rounded = Math.round(rating * 10) / 10;
                if (rating >= 0) {
                    contentString += "<p> <span style='position:relative; top:3px; font-size:18px; color:#FF9800;'>" + rounded + "&nbsp</span>";
                    for (var i = 0; i < 5; i++) {
                        if (rating < (i + 0.5)) {
                            contentString += ' <img src="images/star-empty-lg.png " style="height:14px;">';
                            //contentString += '&#10025;';
                        } else {
                            contentString += '<img src="images/star-fill-lg.png" style="height:14px;">'
                            //contentString += '&#10029;';
                        }
                    }
                }

                contentString += "</p>";

                contentString += '</div>' + '</td>';

                contentString += '</tr>' + '</table>';

                return $compile(contentString)($rootScope)[0];
            }
            

            function fitBounds() {
                map.fitBounds(bounds);
            }


            function setMarkers(pilots) {
                bounds = new google.maps.LatLngBounds();
                removeMarkers();
                if (pilots.length) {
                    pilots.forEach(function (pilot) {
                        var coords = pilot.place.coords;
                        addMarker(pilot, coords);
                    });
                    if ($rootScope.IsSearchOpen == true) {

                    } else {
                        if (($rootScope.filters.safety == undefined ) && ($rootScope.filters.category == undefined )) {
                            fitBounds();
                        }
                    }
                }
            }

            function setSearchArea(position, radius, zoom) {
                searchCircle = new google.maps.Circle({
                    strokeColor: '#4CC9FF',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#4CC9FF',
                    fillOpacity: 0.2,
                    map: map,
                    center: position,
                    radius: radius
                });
                map.setCenter(position);
                map.setZoom(zoom);
            }

            function showPilot(position, zoom) {
                map.setCenter(position);
                map.setZoom(zoom);
            }

            function removeElement(element) {
                if (element) {
                    element.setMap(null);
                    element = null;
                }
            }

            function removeMarkers() {
                markerCluster.clearMarkers();
            }

            function removeSearchArea() {
                removeElement(searchCircle);
            }


        });

