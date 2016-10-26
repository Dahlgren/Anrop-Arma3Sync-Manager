angular.module('app')
.controller('Arma3SyncCtrl', function ($scope, Arma3SyncSvc) {
  var setDisabledState = function (disabled) {
    $scope.buildButtonDisabled = disabled;
  }
  setDisabledState(true);

  $scope.$on('socket:state', function (ev, state) {
    setDisabledState(state.building || state.downloading || state.refreshing);
  });

  $scope.build = function () {
    Arma3SyncSvc.build();
  };
});
