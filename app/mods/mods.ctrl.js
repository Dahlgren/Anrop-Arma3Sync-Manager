angular.module('app')
  .controller('ModsCtrl', function ($scope, SweetAlert, ModsSvc) {
    const setDisabledState = (disabled) => {
      $scope.deleteButtonDisabled = disabled
      $scope.downloadButtonDisabled = disabled
      $scope.refreshButtonDisabled = disabled
    }

    const showConfirmDeleteDialog = (mod) => {
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
        (isConfirm) => {
          if (isConfirm) {
            ModsSvc.delete(mod.name).then(() => {
              showDeletedDialog(mod)
            })
          }
        }
      )
    }

    const showDeletedDialog = (mod) => {
      SweetAlert.swal({
        title: 'Deleted!',
        text: '<strong>' + mod.name + '</strong> has been deleted',
        type: 'success',
        html: true
      })
    }

    setDisabledState(true)
    $scope.refreshButtonAnimated = false

    $scope.$on('socket:mods', (ev, data) => {
      $scope.mods = data
    })

    $scope.$on('socket:state', (ev, state) => {
      $scope.refreshButtonAnimated = state.refreshing
      setDisabledState(state.building || state.downloading || state.refreshing)
    })

    $scope.delete = (mod) => {
      showConfirmDeleteDialog(mod)
    }

    $scope.refresh = (force) => {
      ModsSvc.refresh(force)
    }

    $scope.update = (mod) => {
      ModsSvc.update(mod.name)
    }

    $scope.needsUpdate = (mod) => {
      if (!mod.steamWorkshop || !mod.steamWorkshop.files) {
        return false
      }

      const files = mod.steamWorkshop.files
      return files.extra.length > 0 || files.missing.length > 0 || files.outdated.length > 0
    }
  })
