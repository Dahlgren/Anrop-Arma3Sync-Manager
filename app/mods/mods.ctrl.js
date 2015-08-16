angular.module('app')
.controller('ModsCtrl', function ($scope, ModsSvc) {
  $scope.reload = function() {
    ModsSvc.mods().success(function (mods) {
      $scope.mods = mods;
    });
  };

  $scope.delete = function (mod) {
    ModsSvc.delete(mod.name).then(function () {
      $scope.reload();
    });
  };

  $scope.reload();
});
