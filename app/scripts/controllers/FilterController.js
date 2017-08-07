'use strict';

angular.module('defyingGravityApp')
  .controller('FilterController',
    function($scope, appConfig, PilotsService) {
        
      $scope.aircraftCategories = appConfig.aircraftCategories;
      $scope.safety = appConfig.safety;

      $scope.reset = reset;
      function reset() {
        $scope.category = '';
        $scope.safe = '';
        $scope.getAllPilots();
      }
      $scope.$watch('category', function(newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.setPilots(PilotsService.filterPilots( $scope.category, $scope.safe));
        }
      });
       $scope.$watch('safe', function(newVal, oldVal) {
        if (newVal !== oldVal) {
         // console.log("calculate");
          $scope.setPilots(PilotsService.filterPilots( $scope.category, $scope.safe));
        }
      });
    });
