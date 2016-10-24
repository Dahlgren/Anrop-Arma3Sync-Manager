angular.module('app')
.controller('ModsCtrl', function ($scope, ModsSvc) {
  $scope.$on('socket:mods', function (ev, data) {
    $scope.mods = data;
  });

  $scope.delete = function (mod) {
    ModsSvc.delete(mod.name).then(function () {
    });
  };
});
