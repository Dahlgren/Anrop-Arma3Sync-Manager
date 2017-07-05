angular.module('app')
.controller('ModsCtrl', function ($scope, SweetAlert, ModsSvc, PlayWithSixSvc) {
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

  var showRequiredDialog = function (mod) {
    var requiredBy = mod.playWithSix.requiredBy.map(function (mod) {
      return '<strong>' + mod.name + '</strong>'
    }).join(', ')

    SweetAlert.swal(
      {
        title: 'Are you sure?',
        text: 'You will delete <strong>' + mod.name + '</strong> from the server. It\'s required by ' + requiredBy,
        type: 'error',
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
    if (mod.playWithSix && mod.playWithSix.requiredBy && mod.playWithSix.requiredBy.length > 0) {
      showRequiredDialog(mod)
    } else {
      showConfirmDeleteDialog(mod)
    }
  }

  $scope.refresh = function () {
    ModsSvc.refresh().then(function () {
    })
  }

  $scope.update = function (mod) {
    PlayWithSixSvc.download(mod.name).then(function () {
    })
  }

  $scope.hasAllRequired = function (mod) {
    if (!mod.playWithSix) {
      return true
    }

    var missingMods = mod.playWithSix.requires.filter(function (requiredMod) {
      return !requiredMod.exists
    })

    return missingMods.length === 0
  }

  $scope.showModsPopup = function (title, subtitle, mods) {
    var names = mods.map(function (mod) {
      return mod.name
    }).join(', ')

    SweetAlert.swal(
      {
        title: title,
        text: '<strong>' + subtitle + '</strong><br/>' + names,
        type: 'info',
        html: true,
        closeOnConfirm: true
      }
    )
  }
})
