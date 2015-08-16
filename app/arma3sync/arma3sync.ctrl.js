angular.module('app')
.controller('Arma3SyncCtrl', function ($scope, Arma3SyncSvc) {
  $scope.build = function () {
    Arma3SyncSvc.build();
  };
});
