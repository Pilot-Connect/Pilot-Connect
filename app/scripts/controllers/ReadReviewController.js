'use strict';

angular.module('defyingGravityApp')
.controller('ReadReviewController', 

	function(pilot, $scope, $state, AuthService ,ProfileService, $firebaseObject, FirebaseService, ReviewService){
		$scope.pilot = pilot;
		function getAllReviews(){
			$scope.average =0;
			ReviewService.getReviews(pilot.id).then(function(data){
				if(data){
					$scope.reviews = data;
					ReviewService.getAverage(pilot.id).then(function(average){
						$scope.average = average;
					})
				}
			});
		}
		getAllReviews();
	}
	);
