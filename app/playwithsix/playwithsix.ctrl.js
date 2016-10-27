angular.module('app')
.controller('PlayWithSixCtrl', function ($scope, PlayWithSixSvc) {
  var setDisabledState = function (disabled) {
    $scope.downloadButtonDisabled = disabled;
  }
  setDisabledState(true);

  $scope.$on('socket:state', function (ev, state) {
    setDisabledState(state.building || state.downloading || state.refreshing);
  });

  $scope.download = function (mod) {
    PlayWithSixSvc.download(mod.name).then(function () {
    });
  };

  $scope.searchButtonDisabled = false;
  $scope.search = function () {
    $scope.searchButtonDisabled = true;
    PlayWithSixSvc.search($scope.name).success(function (data) {
      $scope.results = data.mods;
    }).finally(function() {
      $scope.searchButtonDisabled = false;
    });
  };
});
