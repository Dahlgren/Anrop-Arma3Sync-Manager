angular.module('app')
.controller('PlayWithSixCtrl', function ($scope, PlayWithSixSvc) {
  $scope.download = function () {
    PlayWithSixSvc.download($scope.name).success(function () {
      $scope.name = "";
    });
  };
});
