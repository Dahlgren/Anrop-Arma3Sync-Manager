angular.module('app')
.controller('ModsCtrl', function ($scope, ModsSvc, PlayWithSixSvc) {
  var setDisabledState = function (disabled) {
    $scope.deleteButtonDisabled = disabled;
    $scope.downloadButtonDisabled = disabled;
    $scope.refreshButtonDisabled = disabled;
  }
  setDisabledState(true);

  $scope.$on('socket:mods', function (ev, data) {
    $scope.mods = data;
  });

  $scope.$on('socket:state', function (ev, state) {
    setDisabledState(state.building || state.downloading || state.refreshing);
  });

  $scope.delete = function (mod) {
    ModsSvc.delete(mod.name).then(function () {
    });
  };

  $scope.refresh = function () {
    ModsSvc.refresh().then(function () {
    });
  };

  $scope.update = function (mod) {
    PlayWithSixSvc.download(mod.name).then(function () {
    });
  };
});
