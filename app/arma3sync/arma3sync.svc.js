angular.module('app')
.factory('Arma3SyncSvc', function ($http) {
  return {
    build: function () {
      return $http.post('api/arma3sync/build');
    },
  };
});
