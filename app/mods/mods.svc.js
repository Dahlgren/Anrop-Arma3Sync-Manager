angular.module('app')
  .factory('ModsSvc', function ($http) {
    return {
      delete: (name) => {
        return $http.delete('api/mods/' + name)
      },
      mods: () => {
        return $http.get('api/mods')
      },
      refresh: () => {
        return $http.post('api/mods')
      },
      update: (name) => {
        return $http.post('api/mods/' + name + '/update')
      }
    }
  })
