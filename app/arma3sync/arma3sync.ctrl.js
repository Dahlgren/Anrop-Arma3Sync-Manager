angular.module('app')
  .controller('Arma3SyncCtrl', ['$scope', 'Arma3SyncSvc', function ($scope, Arma3SyncSvc) {
    const setDisabledState = (disabled) => {
      $scope.buildButtonDisabled = disabled
      $scope.initButtonDisabled = disabled
    }
    setDisabledState(true)
    $scope.buildButtonAnimated = false
    $scope.initButtonAnimated = false

    $scope.$on('socket:state', (ev, state) => {
      $scope.buildButtonAnimated = state.building
      $scope.buildButtonVisible = state.initialized
      $scope.initButtonAnimated = state.building
      $scope.initButtonVisible = !state.initialized
      setDisabledState(state.building || state.downloading || state.refreshing)
    })

    $scope.build = () => {
      Arma3SyncSvc.build()
    }

    $scope.init = () => {
      Arma3SyncSvc.init()
    }
  }])
