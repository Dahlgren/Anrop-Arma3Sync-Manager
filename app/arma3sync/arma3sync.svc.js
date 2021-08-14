angular.module('app')
  .factory('Arma3SyncSvc', ($http) => {
    return {
      build: () => {
        return $http.post('api/arma3sync/build')
      }
    }
  })
