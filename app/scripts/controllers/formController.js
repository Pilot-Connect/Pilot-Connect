/**
 * Created by Vipin on 8/16/16.
 */
'use strict';

angular.module('defyingGravityApp')
    .controller('formController',
        function ($scope, $rootScope, $state, appConfig, ProfileService, AuthService, Notification, $timeout, PlacesService, MailService) {

            var el;
            $scope.airport = true;
            $scope.types = appConfig.types;
            $scope.aircraftCategories = appConfig.aircraftCategories;
            $scope.pilotRating = appConfig.pilotRating;
            $scope.profile = {};
            $scope.name = {};
            $scope.createProfile = createProfile;
            $scope.isCompleteProfileDisabled = isCompleteProfileDisabled;
            $scope.isSaveDisabled = isSaveDisabled;
            $scope.isChangePassDisabled = isChangePassDisabled;
            $scope.changestate = changestate;
            $scope.addAirport = addAirport;
            //$scope.removeAirport = removeAirport;
            $scope.deletePlace = deletePlace;
            $scope.uploadImage = uploadImage;
            $scope.save = save;

            $scope.address = {
                location: null,
                options: null,
                details: null
            };



            //console.log("$scope.userData : "+ JSON.stringify($scope.userData));

            function activate() {
                $scope.changestate(1);
                //console.log("AuthService.isLoggedIn(): "+ AuthService.isLoggedIn());
                if (AuthService.isLoggedIn()) {
                    $scope.userData = AuthService.getUserData();

                    $timeout(function () {
                        //console.log("$scope.userData: "+ JSON.stringify($scope.userData));
                        if ($scope.userData.name) {
                            $scope.profile.name = $scope.userData.name;
                            var name = $scope.profile.name.split(' ');
                            $scope.profile.fname = name[0];
                            $scope.profile.lname = name[1];
                        }
                        if ($scope.userData.email) {
                            $scope.profile.email = $scope.userData.email;
                        }
                        ProfileService.findUserProfile($scope.userData.id).then(function (result) {
                            if (result != null && result.image != null) {
                                $scope.image = result.image;
                            } else if ($scope.userData.profileImgUrl) {
                                $scope.image = $scope.userData.profileImgUrl;
                            } else {
                                $scope.image = "images/user-01.png";
                            }
                        });
                        updatePlaces();
                    }, 1000)
                } else {
                    $state.go('home');
                }
            }


            function createProfile() {
                if (!$scope.userPlaces) {
                    $scope.err.airport = true;
                } else {
                    $scope.err.airport = false;
                    $scope.profile.name = $scope.name.fname + " " + $scope.name.lname;
                    if ($scope.image == "images/user-01.png" || $scope.image == $scope.userData.profileImgUrl) {
                        $scope.profile.image = $scope.userData.profileImgUrl;
                    }
                    console.log($scope.profile);

                    AuthService.createUserProfile($scope.userData.id, $scope.profile).then(
                        function () {
                            $state.go('pilots');
                            console.log($scope.userData.email);
                             MailService.AddUserEmailToMailchimp($scope.userData.email)
                             .then(function (d) {
                             console.log("data AddUserEmailToMailchimp: " + d);
                             console.log("data AddUserEmailToMailchimp: " + JSON.stringify(d));
                             });
                        }
                    );
                }
            }

            function handleFileSelect(evt) {
                $scope.uploading = true;
                ProfileService.upload(evt).then(function (Success) {
                    if (Success) {
                        ProfileService.findUserProfile($scope.userData.id).then(function (result) {
                            //console.log(result);
                            if (result) {
                                $scope.image = result.image;
                                $scope.uploading = false;
                            }
                        })
                    }
                });
            }



            function uploadImage() {
                el = document.getElementById('imgupload');
                el.click();
            }

            function validateEmail(email) {
                var atpos = email.indexOf("@");
                var dotpos = email.lastIndexOf(".");
                if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= email.length) {
                    //console.log("Not a valid e-mail address");
                    return false;
                } else {
                    //console.log("Valid e-mail address");
                    return true;
                }
            }

            $scope.err = {};
            function changestate(form) {

                if (form == 1) {
                    $scope.page1 = true;
                    $scope.page2 = false;
                    $scope.page3 = false;
                    $scope.page4 = false;

                } else if (form == 2) {
                    $scope.err.fname = false;
                    $scope.err.lname = false;
                    $scope.err.email = false;
                    $scope.err.emailFormat = false;
                    if ($scope.name.fname && $scope.name.lname && $scope.profile.email) {
                        if (validateEmail($scope.profile.email)) {

                            $scope.page1 = false;
                            $scope.page2 = true;
                            $scope.page3 = false;
                            $scope.page4 = false;
                            $scope.form1Valid = true;
                        } else {
                            $scope.err.emailFormat = true;
                        }

                    } else {
                        if (!$scope.name.fname) {
                            $scope.err.fname = true;
                        }
                        if (!$scope.name.lname) {
                            $scope.err.lname = true;
                        }
                        if (!$scope.profile.email) {
                            $scope.err.email = true;
                        }
                        $scope.form1Valid = false;
                    }

                } else if (form == 3) {
                    //Select
                    $scope.err.category = false;
                    $scope.err.pilotRating = false;
                    $scope.err.other = false;
                    $scope.err.checkOne = false;

                    //checkboxes
                    /*   $scope.err.safety = false;
                     $scope.err.aerial_tours = false;
                     $scope.err.general_QA = false;
                     $scope.err.copilot = false;
                     $scope.err.handler = false;

                     $scope.err.help = false;
                     $scope.err.paired = false;*/
                    
                    if (!($scope.profile.safety || $scope.profile.aerial_tours ||
                        $scope.profile.general_QA || $scope.profile.copilot ||
                        $scope.profile.handler || $scope.profile.help || $scope.profile.paired)) {
                        $scope.err.checkOne = true;
                    }
                    /* if (($scope.form1Valid && $scope.profile.category && $scope.profile.pilotRating && $scope.profile.safety && $scope.profile.help && $scope.profile.paired)
                     && (!$scope.other || ($scope.other && $scope.profile.otherRatings))) {*/
                    if (($scope.form1Valid && $scope.profile.category && $scope.profile.pilotRating ) && !$scope.err.checkOne
                        && (!$scope.other || ($scope.other && $scope.profile.otherRatings))) {
                        $scope.page1 = false;
                        $scope.page2 = false;
                        $scope.page3 = true;
                        $scope.page4 = false;
                        $scope.form2Valid = true;

                    } else {
                        if (!$scope.profile.pilotRating) {
                            $scope.err.pilotRating = true;
                        }
                        if (!$scope.profile.category) {
                            $scope.err.category = true;
                        }
                        if ($scope.other && !$scope.profile.otherRatings) {
                            $scope.err.other = true;
                        }
                       
                        
                        /* if (!$scope.profile.safety) {
                         $scope.err.safety = true;
                         }
                         if (!$scope.profile.aerial_tours) {
                         $scope.err.aerial_tours = true;
                         }
                         if (!$scope.profile.general_QA) {
                         $scope.err.general_QA = true;
                         }
                         if (!$scope.profile.copilot) {
                         $scope.err.copilot = true;
                         }
                         if (!$scope.profile.handler) {
                         $scope.err.handler = true;
                         }
                         if (!$scope.profile.help) {
                         $scope.err.help = true;
                         }
                         if (!$scope.profile.paired) {
                         $scope.err.paired = true;
                         }*/

                        $scope.form2Valid = false;
                    }

                } else if (form == 4) {

                    if ($scope.form1Valid && $scope.form2Valid) {
                        $scope.page1 = false;
                        $scope.page2 = false;
                        $scope.page3 = false;
                        $scope.page4 = true;
                    }
                }
            }

            function resetAddress() {
                $scope.address = {
                    location: null,
                    options: null,
                    details: null
                };

            }


            function constructAddressObject(add) {
                return {
                    location: add.location,
                    coords: {
                        lat: add.details.geometry.location.lat(),
                        lng: add.details.geometry.location.lng()
                    }
                }
            }

            function save(address) {
                $scope.err.places = false;
                PlacesService.addPlace(constructAddressObject(address));
                Notification.success('Place added');
                resetAddress();
                updatePlaces();
                $scope.airport = false;
            }


            function updatePlaces() {
                PlacesService.getCurrentUserPlaces().then(function (userPlaces) {
                    $scope.userPlaces = userPlaces;
                });
            }

            function deletePlace(id) {
                PlacesService.deletePlace(id);
                updatePlaces();
                Notification.success('Address deleted');
            }

            function isSaveDisabled() {
                return !$scope.address.details;
            }

            function addAirport() {
                $scope.err.places = false;
                $scope.airport = true;
            }


            function isCompleteProfileDisabled() {
                return !$scope.userPlaces;
            }

            function isChangePassDisabled() {
                if ($scope.p)
                    return !$scope.pass;
            }

            $scope.$watch('profile.pilotRating', function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    if (newVal == ($scope.pilotRating[$scope.pilotRating.length - 1])) {
                        $scope.other = true;
                    } else {
                        $scope.other = false;
                        $scope.err.other = false;
                    }
                }
            });


            activate();

            $timeout(function () {
                el = document.getElementById('imgupload');
                el.addEventListener('change', handleFileSelect, false);

                var pac_input = document.getElementById('form_airport');
                (function pacSelectFirst(input) {
                    console.log(input);
                    // store the original event binding function
                    var _addEventListener = (input.addEventListener) ? input.addEventListener : input.attachEvent;
                    function addEventListenerWrapper(type, listener) {
                        console.log("calling listener--1");
                        // Simulate a 'down arrow' keypress on hitting 'return' when no pac suggestion is selected,
                        // and then trigger the original listener.
                        console.log(type);
                        if (type == "keydown") {
                            var orig_listener = listener;
                            listener = function (event) {
                                var suggestion_selected = $(".pac-item-selected").length > 0;
                                console.log(event.which);
                                console.log(event.which == 13 && !suggestion_selected)
                                if (event.which == 13 && !suggestion_selected) {
                                    console.log("calling listener--2");
                                    var simulated_downarrow = $.Event("keydown", {keyCode: 40, which: 40});
                                    console.log("calling listener---3");
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

            }, 100);

            $scope.$on('userChanged', function () {
                //console.log("onstate change");
                if (AuthService.isLoggedIn()) {
                    $scope.userData = AuthService.getUserData();
                    ProfileService.findUserProfile($scope.userData.id).then(function (result) {
                        //console.log(result);
                        if (result !== null && result.pilotRating !== null) {
                            $state.go('pilots');
                        }
                    })
                } else {
                    $state.go('home');
                }
            });

        })
;
