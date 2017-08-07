'use strict';

angular
  .module('defyingGravityApp')
  .config(['NotificationProvider' , function(NotificationProvider) {
    NotificationProvider.setOptions({
      delay: 5000,
      startTop: 20,
      startRight: 50,
      verticalSpacing: 20,
      horizontalSpacing: 20,
      positionX: 'center',
      positionY: 'bottom'
    });

  }]);
