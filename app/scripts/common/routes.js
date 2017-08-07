'use strict';

angular
    .module('defyingGravityApp').config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
        $stateProvider

            .state('home', {
                url: '/',
                views: {
                    nav: {
                        templateUrl: 'views/navbar.html'
                    },
                    content: {
                        templateUrl: 'views/home.html',
                        controller: 'HomeController'
                    }
                    // footer : {
                    // templateUrl: 'views/footer.html'
                    // },
                }
            })
            //  .state('register', {
            //   url: '/register',
            //   views: {
            //     content: {
            //       templateUrl: 'views/register.html',
            //       controller: 'RegisterController'
            //     }
            //   }
            // })
            .state('pilots', {
                url: '/pilots',
                views: {
                    nav: {
                        templateUrl: 'views/navbar.html'
                    },
                    content: {
                        templateUrl: 'views/pilots.html',
                        controller: 'PilotsController'
                    }
                },
                requiresLogin: true
            })
            .state('about', {
                url: '/about',
                views: {
                    nav: {
                        templateUrl: 'views/navbar.html'
                    },
                    content: {
                        templateUrl: 'views/about.html',
                    }
                },
                requiresLogin: false
            })
            .state('contact', {
                url: '/contact',
                views: {
                    nav: {
                        templateUrl: 'views/navbar.html'
                    },
                    content: {
                        templateUrl: 'views/contact.html',
                        controller: 'ContactController'
                    }
                },
                requiresLogin: false
            })

            //  .state('profile', {
            //   url: '/profile',
            //   views: {
            //     nav: {
            //       templateUrl: 'views/navbar.html'
            //     },
            //     content: {
            //       templateUrl: 'views/profile.html',
            //       controller: 'ProfileController'
            //     }
            //   },
            //   requiresLogin: true
            // })
            // route to show our basic form (/form)
            .state('profile', {
                url: '/profile',
                views: {
                    // nav: {
                    //     templateUrl: 'views/navbar.html'
                    // },
                    content: {
                        templateUrl: 'views/form.html',
                        controller: 'formController'
                    }
                },
                requiresLogin: true
            })

            // nested states
            // each of these sections will have their own view
            // url will be nested (/form/profile)
            // .state('profile.form', {
            //     url: '/profile',
            //     views: {
            //         content: {
            //             templateUrl: 'views/form1.html'
            //         }
            //     },
            //     requiresLogin: true
            // })
            // .state('profile.form2', {
            //     url: '/profile2',
            //     views: {
            //         content: {
            //             templateUrl: 'views/form2.html'
            //         }
            //     },
            //     requiresLogin: true
            // })
            // .state('profile.form3', {
            //     url: '/profile3',
            //     views: {
            //         content: {
            //             templateUrl: 'views/form3.html'
            //         }
            //     },
            //     requiresLogin: true
            // })
            // .state('profile.form4', {
            //     url: '/profile4',
            //     views: {
            //         content: {
            //             templateUrl: 'views/form4.html'
            //         }
            //     },
            //     requiresLogin: true
            // })
            .state('EditProfile', {
                url: '/EditProfile',
                views: {
                    nav: {
                        templateUrl: 'views/navbar.html'
                    },
                    content: {
                        templateUrl: 'views/profileEditForm.html',
                        controller: 'ProfileController'
                    }
                },
                requiresLogin: true
            })


            .state('messages', {
                url: '/messages',
                views: {
                    nav: {
                        templateUrl: 'views/navbar.html'
                    },
                    content: {
                        templateUrl: 'views/messages.html',
                        controller: 'MessagesController'
                    }
                },
                requiresLogin: true
            })
            .state('policies', {
                url: '/policies',
                views: {
                    nav: {
                        templateUrl: 'views/navbar.html'
                    },
                    content: {
                        templateUrl: 'views/policies.html',
                        controller: 'PoliciesController'
                    }
                }
            })

    })

    .run(function ($rootScope, $state, AuthService, LoginService, $location, ProfileService) {

        $rootScope.$on('userChanged', function () {
            // console.log("userChanged");
            if (AuthService.isLoggedIn()) {
                ProfileService.findUserProfile(AuthService.getUserId()).then(function (result) {
                    // console.log(result);
                    if (result == null || result.pilotRating == null) {
                        $state.go('profile');
                    }
                    else if (result) {
                        if (result.image) {
                            $rootScope.userImg = result.image;
                        }
                        // $state.go('pilots');
                    }
                })
                // console.log("AuthService.isLoggedIn(): "+ AuthService.isLoggedIn());
                // $state.transitionTo('pilots');
                // $location.path('/pilots');
            } else if (!AuthService.isLoggedIn() && $state.current.requiresLogin) {
                // $state.transitionTo('home');
                // $location.path('/');
                //   console.log("home");
                $state.go('home');
            }
        });

        $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
            if (toState.requiresLogin && !AuthService.isLoggedIn()) {
                // console.log('not logged in');
                $state.go('home');
                event.preventDefault();
                LoginService.loginAsynch().then(function () {
                    $state.transitionTo(toState.name, toParams);

                });
            }
        });


    });
