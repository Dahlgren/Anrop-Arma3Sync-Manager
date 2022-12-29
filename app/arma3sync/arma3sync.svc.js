angular.module('app')
  .factory('Arma3SyncSvc', ['$http', function ($http) {
    return {
      build: () => {
        return $http.post('api/arma3sync/build')
      },
      init: () => {
        return $http.post('api/arma3sync/init')
      }
    }
  }])
