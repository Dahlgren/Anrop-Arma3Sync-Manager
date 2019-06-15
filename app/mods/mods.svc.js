angular.module('app')
  .factory('ModsSvc', function ($http) {
    return {
      delete: function (name) {
        return $http.delete('api/mods/' + name)
      },
      mods: function () {
        return $http.get('api/mods')
      },
      refresh: function () {
        return $http.post('api/mods')
      }
    }
  })
