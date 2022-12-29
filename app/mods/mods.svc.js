angular.module('app')
  .factory('ModsSvc', ['$http', function ($http) {
    return {
      delete: (name) => {
        return $http.delete('api/mods/' + name)
      },
      mods: () => {
        return $http.get('api/mods')
      },
      refresh: () => {
        return $http.post('api/mods')
      }
    }
  }])
