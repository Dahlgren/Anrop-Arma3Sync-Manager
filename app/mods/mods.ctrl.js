angular.module('app')
  .controller('ModsCtrl', function ($scope, SweetAlert, ModsSvc) {
    var setDisabledState = function (disabled) {
      $scope.deleteButtonDisabled = disabled
      $scope.downloadButtonDisabled = disabled
      $scope.refreshButtonDisabled = disabled
    }

    var showConfirmDeleteDialog = function (mod) {
      SweetAlert.swal(
        {
          title: 'Are you sure?',
          text: 'You will delete <strong>' + mod.name + '</strong> from the server',
          type: 'warning',
          confirmButtonColor: '#DD6B55',
          confirmButtonText: 'Yes, delete it!',
          html: true,
          showCancelButton: true,
          closeOnConfirm: false,
          showLoaderOnConfirm: true
        },
        function (isConfirm) {
          if (isConfirm) {
            ModsSvc.delete(mod.name).then(function () {
              showDeletedDialog(mod)
            })
          }
        }
      )
    }

    var showDeletedDialog = function (mod) {
      SweetAlert.swal({
        title: 'Deleted!',
        text: '<strong>' + mod.name + '</strong> has been deleted',
        type: 'success',
        html: true
      })
    }

    setDisabledState(true)
    $scope.refreshButtonAnimated = false

    $scope.$on('socket:mods', function (ev, data) {
      $scope.mods = data
    })

    $scope.$on('socket:state', function (ev, state) {
      $scope.refreshButtonAnimated = state.refreshing
      setDisabledState(state.building || state.downloading || state.refreshing)
    })

    $scope.delete = function (mod) {
      showConfirmDeleteDialog(mod)
    }

    $scope.refresh = function () {
      ModsSvc.refresh().then(function () {
      })
    }
  })
