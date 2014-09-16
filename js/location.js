(function(){
    var app = angular.module('Location', ['GoogleMaps']);
    
    app.controller('LocationController', ['$scope', function LoginCtrl($scope) {

	        $scope.map = {center: {latitude: 46.8944, longitude: 8.1723 }, zoom: 8, bounds: {}};
			$scope.options = {scrollwheel: false};
			$scope.markersEvents = {
			  click: function (gMarker, eventName, model) {
				if(model.$id){
				  model = model.coords;//use scope portion then
				}
			   alert("Model: event:" + eventName + " " + JSON.stringify(model));
			  }
			};
	
			var moodMarkerList = [];
			moodMarkerList.push({title:'Happy ERNIan, Zurich',latitude: 47.41661, longitude:8.55266,  iconPath: './img/smileyGood.png'});	
			moodMarkerList.push({title:'Very Happy ERNIan, Bern',latitude: 46.94733, longitude:7.44775,  iconPath: './img/smileyVeryHappy.png'});	

			var createMoodMarker = function (moodMarker, i, bounds, idKey) {
				if (idKey == null) {
					idKey = "id";
				}

				var ret = {
					latitude: moodMarker.latitude,
					longitude: moodMarker.longitude,
					title: moodMarker.title,
					icon: moodMarker.iconPath
				};
				ret[idKey] = i;
				return ret;
			};
			

			$scope.moodMarkers = [];

			// Get the bounds from the map once it's loaded and observe it
			$scope.$watch(function() { return $scope.map.bounds; }, function(nv, ov) {

				if (!ov.southwest && nv.southwest) {
					var markers = [];
					for (var i = 0; i < 2; i++) {
						markers.push(createMoodMarker(moodMarkerList[i], i, $scope.map.bounds))
					}
					$scope.moodMarkers = markers;


				}
			}, true);	

        }]);
    
})();


