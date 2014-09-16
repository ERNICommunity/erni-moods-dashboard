(function(){
    var app = angular.module('Location', ['google-maps']);
    
    var moodsBaseUrl = 'http://moodyrest.azurewebsites.net/moods';
    
    app.controller('LocationController', ['$scope', '$http', function LoginCtrl($scope, $http) {

        $scope.map = {center: {latitude: 46.8944, longitude: 8.1723 }, zoom: 3, bounds: {}};
        $scope.options = {scrollwheel: true};
        $scope.moodMarkers = [];
        
//        $scope.markersEvents = {
//          click: function (gMarker, eventName, model) {
//            if(model.$id){
//              model = model.coords;//use scope portion then
//            }
//           //alert("Model: event:" + eventName + " " + JSON.stringify(model));
//          }
//        };

        $http.get(moodsBaseUrl)
        .success(function (data) {
            //moods = data;
            $scope.moodMarkers = data.map(function(mood, idKey){
                    return {
                        title: mood.username,
                        latitude: mood.location[0],
                        longitude: mood.location[1],
                        id: mood.id
                    };             
                });
        })
        .error(function (data) {
            alert(data.message);
        });

    }]);
    
})();


