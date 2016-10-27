angular.module('app')
.controller('Arma3SyncCtrl', function ($scope, Arma3SyncSvc) {
  var setDisabledState = function (disabled) {
    $scope.buildButtonDisabled = disabled;
  }
  setDisabledState(true);
  $scope.buildButtonAnimated = false;

  $scope.$on('socket:state', function (ev, state) {
    $scope.buildButtonAnimated = state.building;
    setDisabledState(state.building || state.downloading || state.refreshing);
  });

  $scope.build = function () {
    Arma3SyncSvc.build();
  };
});
