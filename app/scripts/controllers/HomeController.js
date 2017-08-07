/**
 * Created by Vipin on 8/16/16.
 */
'use strict';

angular.module('defyingGravityApp')
.controller('HomeController',
	function($scope, appConfig, $state, $sce, Notification, AuthService, LoginService, ProfileService) {
		$scope.providers = appConfig.providers;
		$scope.openRegisterModal = openRegisterModal;
		$scope.playPauseVideo = playPauseVideo;
		$scope.videoPlaying = true;
		$scope.tourVideoUrl = $sce.trustAsResourceUrl(appConfig.takeTourVideoUrl);
		$scope.urls ={
			facebook : appConfig.facebookLink,
			twitter : appConfig.twitterLink,
			instagram : appConfig.instagramLink
		};
		
		function openRegisterModal(){
			LoginService.openRegisterWindow();
		}

		function playPauseVideo() {
			var vid = document.getElementById("videoTour");
			if (vid) {
				if ($scope.videoPlaying == true) {
					$scope.videoPlaying = false;
					vid.pause();
				} else if ($scope.videoPlaying == false) {
					$scope.videoPlaying = true;
					vid.play();
				}
			}
		}

		if (AuthService.isLoggedIn()) {
			ProfileService.findUserProfile(AuthService.getUserId()).then(function (result) {
				if(result == null){
					$state.go('profile');
				} else {
					$state.go('pilots');
				}
			})
		}


		$scope.$on('userChanged', function() {
			if (AuthService.isLoggedIn()) {
				ProfileService.findUserProfile(AuthService.getUserId()).then(function (result) {
					if(result == null){
						$state.go('profile');
					} else {
						$state.go('pilots');
					}
				})
			} 
		});

	});
