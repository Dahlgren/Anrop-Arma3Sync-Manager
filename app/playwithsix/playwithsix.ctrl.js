angular.module('app')
.controller('PlayWithSixCtrl', function ($scope, PlayWithSixSvc) {
  $scope.download = function (mod) {
    PlayWithSixSvc.download(mod.name).then(function () {
    });
  };

  $scope.search = function () {
    PlayWithSixSvc.search($scope.name).success(function (data) {
      $scope.results = data.mods;
    });
  };
});
