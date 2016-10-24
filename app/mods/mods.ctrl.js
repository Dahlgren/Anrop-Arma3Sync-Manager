angular.module('app')
.controller('ModsCtrl', function ($scope, ModsSvc, PlayWithSixSvc) {
  $scope.$on('socket:mods', function (ev, data) {
    $scope.mods = data;
  });

  $scope.delete = function (mod) {
    ModsSvc.delete(mod.name).then(function () {
    });
  };

  $scope.update = function (mod) {
    PlayWithSixSvc.download(mod.name).then(function () {
    });
  };
});
