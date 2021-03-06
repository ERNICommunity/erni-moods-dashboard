(function () {

    angular.module('BootstrapApp', ['ui.bootstrap']);

    var app = angular.module('app', ['ngRoute', 'BootstrapApp', 'ngCookies', 'Location']);

    app.config(['$routeProvider', function ($routeProvider) {
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
            controller: 'RegistrationController'
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
            }
        });
    }).service('Global', ['$location', '$rootScope', function ($location, $rootScope) {
        return {
            showCurrentUser: function () {
                return $rootScope.loggedUser;
            }
        };
    }]);
		
    app.controller('RegistrationController', ['$scope', '$routeParams', '$http',
        function RegistrationCtrl($scope, $routeParams, $http) {

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
                        window.location.href = '/#/login';
                    })
                    .error(function (data) {
                        alert(data.message);
                    });
            };
        }]);

    app.controller('LoginController', ['$scope', '$rootScope', '$routeParams', '$http', '$cookies',
        function LoginCtrl($scope, $rootScope, $routeParams, $http, $cookies) {

            $scope.setUserProfileInViewsModel = function () {
                $scope.profile = angular.fromJson($cookies.UserCredential);
            };

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

            };

            $scope.showUserName = function () {
                if ($rootScope.loggedUser) {
                    var loggedUser = JSON.parse($rootScope.loggedUser);
                    return loggedUser.username || '???';
                } else {
                    return 'Login';
                }
            };

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
            };
        }]);
		
    app.controller('MoodSelectionController', ['$scope', '$rootScope', '$routeParams','$http','$modal', '$log',
        function MoodSelectionCtrl($scope, $rootScope, $routeParams, $http, $modal, $log) {

			$scope.moodHappy = function(){
                GetGeoLocation($rootScope, $log, $http, $modal, 1);
			};
			
			$scope.moodGood = function(){
                GetGeoLocation($rootScope, $log, $http, $modal, 2);
			};
			
			$scope.moodSoSoLaLa = function(){
                GetGeoLocation($rootScope, $log, $http, $modal, 3);
			};
            
			$scope.moodNotAmused = function(){
                GetGeoLocation($rootScope, $log, $http, $modal, 4);
			};
			
			$scope.moodVeryMoody = function(){
                GetGeoLocation($rootScope, $log, $http, $modal, 5);
			};
        }]);

    var GetGeoLocation = function($rootScope, $log, $http, $modal, moodIndex){

        var options = {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 0
        };

        function success(position) {
            var coordinates = position.coords;
            CreateMoodEntryWithComment($rootScope, $log, $http, $modal, moodIndex, coordinates);
        };

        function error(err) {
            console.warn('ERROR(' + err.code + '): ' + err.message);
            alert('determining your position did not work! ' + err.code + ' ' + err.message);
        };

        navigator.geolocation.getCurrentPosition(success, error, options);
    }

    var CreateMoodEntryWithComment = function($rootScope, $log, $http, $modal, moodIndex, coordinates){

        // open the dialog to add a comment
        var modalInstance = $modal.open({
            templateUrl: 'modal',
            controller: MoodCommentInstanceController,
            resolve: {
                userCoordinates: function () {
                    return coordinates;
                },
                selectedMood: function(){
                    return moodIndex;
                }
            }
        });

        modalInstance.result.then(function (moodComment) {
            $log.info('the mood comment is:' + moodComment + ' moodIndex: ' + moodIndex);

            var moodEntry = {
                "username": JSON.parse($rootScope.loggedUser).username,
                "location": [
                    coordinates.latitude,
                    coordinates.longitude
                ],

                "comment": moodComment,
                "mood": moodIndex
            };

             $http({
             method: 'POST',
             url: 'http://moodyrest.azurewebsites.net/moods',
             headers: {'Content-Type': 'application/json'},
             data: JSON.stringify(moodEntry)})
             .success(function (data) {
             alert('Your mood was successfully added to the data base!');
             })
             .error(function (data) {
             alert(data.message);
             });

        }, function () {
            $log.info('Mood Comment Modal dismissed at: ' + new Date());
        });

    }

    var MoodCommentInstanceController = function ($scope, $modalInstance, userCoordinates, selectedMood) {

        $scope.userCoordinates = userCoordinates;
        $scope.selectedMood = selectedMood;
        $scope.MoodComment = "";

        $scope.save = function () {
            $modalInstance.close($scope.MoodComment);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };



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

$(document).ready(function () {

    $(".account").click(function () {
        $(".submenuAccount").toggle();
    });

    $(".account").mouseup(function () {
        return false;
    });
    $(".submenu").mouseup(function () {
        return false;
    });

    $(document).mouseup(function () {
        $(".submenuAccount").hide();
    });
});

