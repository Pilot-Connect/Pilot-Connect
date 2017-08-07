'use strict';

angular.module('defyingGravityApp')
.controller('ReviewController', 

	function(pilot, $scope,$rootScope, $state, AuthService ,ProfileService, $firebaseObject, FirebaseService, ReviewService, MailService, appConfig){
		var profile;
		var firebaseRef = FirebaseService.getFirebaseRef();
		var usersRef = firebaseRef.child('users');
		$scope.pilot = pilot;
		// console.log($scope.pilot);
		$scope.postReview = postReview;
		$scope.userRating = 0;
		$scope.error = false;
		var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
		if (window.cordova || width < 500) {
			$scope.deviceIsCordova = true;
		}

		init();
		function init(){
			ProfileService.getUserProfile().then(function(data) {
				profile = data;
				$scope.profile = angular.copy(profile);
				$scope.userData = AuthService.getUserData();
			});

		}
		
		function postReview(rating,review){
			if(rating > 0){
				var id =  $scope.pilot.id;
				var data = {
					timestamp : Date.now(),
					rating : rating,
					review: review || null,
					sender : $scope.profile.login || $scope.profile.name || $scope.userData.name || null,
					senderImage: $scope.profile.image || $scope.userData.profileImgUrl || null
				};

				ReviewService.post(id,data).then(function(success){
					// console.log("posted");
					$scope.$close();
					sendMail();
					ReviewService.update_average(id);
					//$rootScope.$broadcast("loadPilots");
				},function(error){
					// console.log("error");
				});
			}
			else{
				$scope.error = true;
			}
		}

		function sendMail(){
		    var message = {
				name: "Pilot Connect",
		    	//name : $scope.profile.name,
          		//from : $scope.profile.email,
				from: appConfig.notificationMail ,
		    	to : $scope.pilot.profile.email,
		    	subject : "New Review Received",
		    	//message : "New review added by " + $scope.profile.name || $scope.profile.login || 'a new user' + " ."
				message : "Hey, you just received a new review!  Sign on to see who wrote you:" + appConfig.domain,
		    }
		    // console.log(message);
			MailService.SendMail(message)
			.then(function (data) {
				if(data)
				{
					// console.log(data);
				}
			});
		}

		
});














