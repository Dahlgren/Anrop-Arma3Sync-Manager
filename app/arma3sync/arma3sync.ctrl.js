angular.module('app')
  .controller('Arma3SyncCtrl', function ($scope, Arma3SyncSvc) {
    const setDisabledState = (disabled) => {
      $scope.buildButtonDisabled = disabled
    }
    setDisabledState(true)
    $scope.buildButtonAnimated = false

    $scope.$on('socket:state', (ev, state) => {
      $scope.buildButtonAnimated = state.building
      setDisabledState(state.building || state.downloading || state.refreshing)
    })

    $scope.build = () => {
      Arma3SyncSvc.build()
    }
  })
