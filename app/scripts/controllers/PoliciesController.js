'use strict';

angular.module('defyingGravityApp')
    .controller('PoliciesController', function($scope, appConfig) {
    
    	$scope.termsOfUse = true;
    	$scope.privacyPolicy = false;
    	$scope.trademarkpolicy  = false;
    	$scope.licenseAgreement = false;
		$scope.email = appConfig.contactEmail;

    	$scope.displayPolicy= function (policy) {
    		// console.log(policy);
    		if(policy == 'termsOfUse'){
    			$scope.termsOfUse = true;
		    	$scope.privacyPolicy = false;
		    	$scope.trademarkpolicy  = false;
		    	$scope.licenseAgreement = false;
    		} else if(policy == 'privacyPolicy'){
    			$scope.termsOfUse = false;
		    	$scope.privacyPolicy = true;
		    	$scope.trademarkpolicy  = false;
		    	$scope.licenseAgreement = false;
    		} else if(policy == 'trademarkpolicy'){
    			$scope.termsOfUse = false;
		    	$scope.privacyPolicy = false;
		    	$scope.trademarkpolicy  = true;
		    	$scope.licenseAgreement = false;
    		} else if(policy == 'licenseAgreement'){
    			$scope.termsOfUse = false;
		    	$scope.privacyPolicy = false;
		    	$scope.trademarkpolicy  = false;
		    	$scope.licenseAgreement = true;
    		}
    	
    	}

    });
