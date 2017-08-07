'use strict';

angular.module('defyingGravityApp')
.controller('ContactController', 
	function( $scope, $state, FirebaseService, MailService,  $timeout, appConfig){
		$scope.send = send;
		$scope.deviceIsCordova = false;
		var firebaseRef = FirebaseService.getFirebaseRef(),
    	usersRef = firebaseRef.child('users');
		var CLIENT_ID ='853923741533-5grbnpsvrfi6bql0eblk44r2nvgg9dn1.apps.googleusercontent.com';
		var SCOPES = ['https://mail.google.com/', 'https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.modify', 'https://www.googleapis.com/auth/gmail.labels'];
		var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;

		if(!window.cordova && width > 450){
			$scope.deviceIsCordova = false;
		}
		else if (window.cordova || width < 450) {
			$scope.deviceIsCordova = true;
		}

		function send(){
		    var message ={
		    	//from : ' Mailgun Sandbox <postmaster@sandbox9a7d19be10104c6a8106aa611155e8d2.mailgun.org>',
		    	//from : ' The Defying Gravity <postmaster@sandboxc9f44171420d4c69b30068dfc93141f5.mailgun.org>',
		   		from : $('#compose-from').val(),
				to: appConfig.contactEmail,
		    	name:$('#compose-name').val(),
		    	subject : $('#compose-subject').val() || '',
		    	message : $('#compose-message').val()
		    }
		    console.log(message);
		    $timeout(function() {
			MailService.SendMail(message)
			.then(function (data) {
				if(data)
				{
					console.log(data);
					$('#compose-from').val(' ');
					$('#compose-name').val('');
					$('#compose-subject').val('');
					$('#compose-message').val('');
				}
			});
			});
		}
		
	});
