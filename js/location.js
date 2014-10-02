(function(){
    Array.prototype.contains = function ( object ) {
        for (i in this) {
            if (this[i] == object) return true;
        }
        return false;
    }

    var app = angular.module('Location', ['google-maps']);
    
    var moodsBaseUrl = 'http://moodyrest.azurewebsites.net/moods';
    
    app.controller('LocationController', ['$scope', '$http', function LoginCtrl($scope, $http) {

        $scope.map = {center: {latitude: 46.8944, longitude: 8.1723 }, zoom: 5, bounds: {}};
        $scope.options = {scrollwheel: true};
        $scope.moodMarkers = [];

        $http.get(moodsBaseUrl)
        .success(function (moodData) {
            var latestMoodItemPerUser = new Array();
            latestMoodItemPerUser.usernames = new Array();

            moodData.forEach(function(moodEntry){
                if(!latestMoodItemPerUser.hasOwnProperty(moodEntry.username)){
                    latestMoodItemPerUser[moodEntry.username] = moodEntry;
                    latestMoodItemPerUser.usernames.push(moodEntry.username);
                }
                else{
                    var latestMoodDate = new Date(latestMoodItemPerUser[moodEntry.username].time);
                    var newMoodDate = new Date(moodEntry.time);

                    if(latestMoodDate.getTime() < newMoodDate.getTime()){
                        latestMoodItemPerUser[moodEntry.username] = moodEntry;
                    }
                }
            });

            var latestMoodItems = new Array();

            for(var j = 0; j < latestMoodItemPerUser.usernames.length; j++){
                latestMoodItems.push(latestMoodItemPerUser[latestMoodItemPerUser.usernames[j]]);
            }


            $scope.moodMarkers = latestMoodItems.map(function(mood){
                    return {
                        latitude: mood.location[0],
                        longitude: mood.location[1],
                        icon: getMoodIcon(mood.mood),
                        id: mood.id,
                        user: mood.username,
                        mood: mood.mood,
                        comment: mood.comment
                    };
                    
                    function getMoodIcon(moodRate)
                    {
                        switch(moodRate){
                            case 1: return "./img/smileyVeryHappy.png";
                            case 2: return "./img/smileyGood.png";
                            case 3: return "./img/smileySoSoLaLa.png";
                            case 4: return "./img/smileyNotAmused.png";
                            case 5: return "./img/smileyVeryMoody.png";
                        };
                    }
                });
        })
        .error(function (data) {
            alert(data.message);
        });

    }]);
    
})();


