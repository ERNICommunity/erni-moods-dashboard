(function () {
    angular.module('RestangularApp', ["restangular"]);

    angular.module('RestangularApp').config(function (RestangularProvider, $httpProvider) {

        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        RestangularProvider.setBaseUrl('https://api.mongolab.com/api/1/databases/visualfacilitation/collections');
        RestangularProvider.setDefaultRequestParams({
            apiKey: 'mFxXtZ1opPpsET7fdrmZ7LNjI3pd2OhB'
        })
        RestangularProvider.setRestangularFields({
            id: '_id.$oid'
        });
        RestangularProvider.setRequestInterceptor(function (elem, operation, what) {
            if (operation === 'put') {
                elem._id = undefined;
                return elem;
            }
            return elem;
        });
    });

	angular.module('GoogleMaps', ['google-maps']);

    var app = angular.module('app', ['RestangularApp', 'ngRoute', 'ngCookies', 'GoogleMaps']);

    app.config(['$routeProvider',
            function ($routeProvider) {
                $routeProvider.
                    when('/moodselection', {
                        templateUrl: 'Sections/moodselection.html',
                        controller: 'MoodSelectionController'
                    }).
                    when('/location', {

                        templateUrl: 'Sections/location.html',
                        controller: 'LocationController'
                    }).
                    when('/history', {
                        templateUrl: 'Sections/history.html',
                        controller: 'HistoryController'
                    }).
					when('/about', {
                        templateUrl: 'Sections/about.html',
                        controller: 'AboutController'
                    }).
                    when('/login', {

                        templateUrl: 'Sections/login.html',
                        controller: 'LoginController'
                    }).
					when('/register', {

                        templateUrl: 'Sections/register.html',
                        controller: 'LoginController'
                    }).
                    when('/', {

                        redirectTo: '/moodselection'
                    });
            }]).run(function ($rootScope, $location) {
            // register listener to watch route changes
            $rootScope.$on("$routeChangeStart", function (event, next, current) {
                if ($rootScope.loggedUser == null) {
                    // no logged user, we should be going to #login
                    if (next.templateUrl == "Sections/login.html") {
                        // already going to #login, no redirect needed
                    } else {
                        if (next.templateUrl != "Sections/register.html")//not going to #login or #register, we should redirect now
                            $location.path("/login");
                    }
                } else {
                }
            });
        }).service('Global', ['$location', '$rootScope', function ($location) {
            var global;

            return {
                showCurrentUser: function () {
                    return $rootScope.loggedUser;
                }

            }
        }]);
		
    app.controller('RegistrationController', ['$scope', 'Restangular', '$routeParams', '$http',
        function RegistrationCtrl($scope, db, $routeParams, $http) {

            $scope.title = $routeParams.tag;
            $scope.register = function () {
                if ($scope.details.password !== $scope.details.confirmPassword) {
                    alert("Passwords do not match.");
                    return;
                }

                $http({
                    method: 'POST',
                    url: 'http://moodyrest.azurewebsites.net/users',
                    headers: {'Content-Type': 'application/json'},
                    data: JSON.stringify($scope.details)})
                    .success(function (data) {
                        alert('User created successfully');

                    })
                    .error(function (data) {
                        alert(data.message);
                    });
            };
        }]);

    app.controller('LoginController', ['$scope', '$rootScope', 'Restangular', '$routeParams', '$http', '$cookies',
        function LoginCtrl($scope, $rootScope, db, $routeParams, $http, $cookies) {

            $scope.setUserProfileInViewsModel = function () {
                $scope.profile = angular.fromJson($cookies.UserCredential);
            }

            /*set defaults based on user credentials cookie*/
            if ($cookies.UserCredential != undefined) {
//                $scope.setUserProfileInViewsModel();
                $rootScope.loggedUser = $cookies.UserCredential;

            } else {
                $rootScope.loggedUser = null;
                $scope.profile = null;
            }

            $scope.logout = function () {
                $scope.profile = undefined;
                $cookies.UserCredential = undefined;
                $rootScope.loggedUser = null;
                changeLocation('/#/login', false);

            }

            $scope.showUserName = function () {
                if ($rootScope.loggedUser) {
                    var loggedUser = JSON.parse($rootScope.loggedUser);
                    return loggedUser.username;
                } else {
                    return 'Login';
                }
            }

            //be sure to inject $scope and $location
            changeLocation = function (url, forceReload) {
                $scope = $scope || angular.element(document).scope();
                if (forceReload || $scope.$$phase) {
                    window.location = url;
                }
                else {
                    //only use this if you want to replace the history stack
                    //$location.path(url).replace();

                    //this this if you want to change the URL and add it to the history stack
                    $location.path(url);
                    $scope.$apply();
                }
            };

            $scope.login = function () {
                $http({ method: 'GET', url: 'http://moodyrest.azurewebsites.net/users/' + $scope.credentials.username + '/' + $scope.credentials.password })
                    .success(function (data) {
                        $cookies.UserCredential = JSON.stringify(data);
                        $scope.setUserProfileInViewsModel();
                        window.location.href = '/';
                    })
                    .error(function (data) {
                        alert('login error');
                    });
            }

            $scope.register = function () {
                if ($scope.details.password !== $scope.details.confirmPassword) {
                    alert("Passwords do not match.");
                    return;
                }

                $http({
                    method: 'POST',
                    url: 'http://moodyrest.azurewebsites.net/users',
                    headers: {'Content-Type': 'application/json'},
                    data: JSON.stringify($scope.details)})
                    .success(function (data) {
                        alert('User created successfully');
                        window.location.href = '/#/login';

                    })
                    .error(function (data) {
                        alert(data.message);
                    });
            };

        }]);
		
   app.controller('MoodSelectionController', ['$scope', '$rootScope', '$routeParams','$http',
        function LoginCtrl($scope, $rootScope, $routeParams, $http) {

			$scope.moodHappy = function(){
				alert('you are happy today');
				
				$http({ method: 'GET', url: 'http://moodyrest.azurewebsites.net/moods?username=user2'})
					.success(function(data) {
					console.log(data);
				})
				.error(function (data) {
					console.log(data);
                });
			}
			
			$scope.moodGood = function(){
				alert('your mood is good');
				
				$http({ method: 'GET', url: 'http://moodyrest.azurewebsites.net/moods'})
					.success(function(data) {
					console.log(data);
				})
				.error(function (data) {
					console.log(data);
                });
			}
			
			$scope.moodSoSoLaLa = function(){
				alert('your mood is sosolala');
			}
			
			$scope.moodNotAmused = function(){
				alert('you seem to be not amused...');
			}
			
			$scope.moodVeryMoody = function(){
				alert('you are very moody');
			}
            
        }]);
		
   app.controller('LocationController', ['$scope',
        function LoginCtrl($scope) {

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
		
	app.controller('HistoryController', ['$scope', '$rootScope', '$routeParams',
        function LoginCtrl($scope, $rootScope, $routeParams) {

            $scope.moodHistory = [
			{day: 1,mood: 3},
			{day: 2,mood: 4},
			{day: 3,mood: 5},
			{day: 4,mood: 3},
			{day: 5,mood: 5},
			{day: 6,mood: 4},
			{day: 7,mood: 5},
			{day: 8,mood: 2},
			{day: 9,mood: 1},
			{day: 10,mood: 2},
			{day: 11,mood: 3},
			{day: 12,mood: 3},
			{day: 13,mood: 4},
			{day: 14,mood: 5},
			{day: 15,mood: 5},
			{day: 16,mood: 4},
			{day: 17,mood: 3},
			{day: 18,mood: 2},
			{day: 19,mood: 1},
			{day: 20,mood: 3}
			];
        }]);
		
   app.controller('AboutController', ['$scope', '$rootScope', '$routeParams',
        function LoginCtrl($scope, $rootScope, $routeParams) {

            
        }]);

	app.directive('linearChart', function($window){
	   return{
		  restrict:'EA',
		  template:"<svg width='800' height='400'></svg>",
		   link: function(scope, elem, attrs){
			   var moodDataToPlot=scope[attrs.chartData];
			   var padding = 20;
			   var pathClass="path";
			   var xScale, yScale, xAxisGen, yAxisGen, lineFun;

			   var d3 = $window.d3;
			   var rawSvg=elem.find('svg');
			   var svg = d3.select(rawSvg[0]);

			   function setChartParameters(){

				   xScale = d3.scale.linear()
					   .domain([moodDataToPlot[0].day, moodDataToPlot[moodDataToPlot.length-1].day])
					   .range([padding + 5, rawSvg.attr("width") - padding]);

				   yScale = d3.scale.linear()
					   .domain([0, d3.max(moodDataToPlot, function (d) {
						   return d.mood;
					   })])
					   .range([rawSvg.attr("height") - padding, 0]);

				   xAxisGen = d3.svg.axis()
					   .scale(xScale)
					   .orient("bottom")
					   .ticks(moodDataToPlot.length - 1);

				   yAxisGen = d3.svg.axis()
					   .scale(yScale)
					   .orient("left")
					   .ticks(5);

				   lineFun = d3.svg.line()
					   .x(function (d) {
						   return xScale(d.day);
					   })
					   .y(function (d) {
						   return yScale(d.mood);
					   })
					   .interpolate("basis");
			   }
			 
			 function drawLineChart() {

				   setChartParameters();

				   svg.append("svg:g")
					   .attr("class", "x axis")
					   .attr("transform", "translate(0,180)")
					   .call(xAxisGen);

				   svg.append("svg:g")
					   .attr("class", "y axis")
					   .attr("transform", "translate(20,0)")
					   .call(yAxisGen);

				   svg.append("svg:path")
					   .attr({
						   d: lineFun(moodDataToPlot),
						   "stroke": "blue",
						   "stroke-width": 2,
						   "fill": "none",
						   "class": pathClass
					   });
			   }

			   drawLineChart();
		   }
	   };
	});
   
})();

