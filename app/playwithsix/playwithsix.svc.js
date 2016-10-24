angular.module('app')
.factory('PlayWithSixSvc', function ($http) {
  return {
    download: function (name) {
      return $http.post('api/playwithsix', {name: name});
    },
    search: function (query) {
      return $http.post('api/playwithsix/search', {query: query});
    },
  };
});
