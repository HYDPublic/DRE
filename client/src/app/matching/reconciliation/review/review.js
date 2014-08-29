angular.module('dre.match.review_new', ['directives.matchingObjects'])

.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.when('/match/reconciliation/review/:section/:match_id', {
            templateUrl: 'templates/matching/reconciliation/review/review.tpl.html',
            controller: 'matchReviewCtrl'
        });
    }
])

.controller('matchReviewCtrl', ['$scope', '$http', '$routeParams', '$location', 'getNotifications', 'recordFunctions',
    function($scope, $http, $routeParams, $location, getNotifications, recordFunctions) {

        //getting parameters from route/url
        $scope.section = $routeParams["section"];
        $scope.match_id = $routeParams["match_id"];

        //fetching match object based on id
        $scope.match = {};
        $scope.new_entry = {};
        $scope.current_entry = {};
        $scope.update_entry = {};

        //$scope.match.entry_type_singular

        $scope.getMatch = function() {
            $http({
                method: 'GET',
                url: '/api/v1/match/' + $scope.section + '/' + $scope.match_id
            }).
            success(function(data, status, headers, config) {
                $scope.match = data;
                $scope.match.entry_type_singular = recordFunctions.singularizeSection($scope.match.entry_type);
                $scope.new_entry = $scope.match.entry;
                $scope.current_entry = $scope.match.matches[0].match_entry;
                $scope.update_entry = angular.copy($scope.current_entry);

                $scope.current_match_index = 0;
                $scope.current_match = $scope.match.matches[$scope.current_match_index].match_object;
                $scope.match_diff = $scope.current_match.diff;
                $scope.match_percent = $scope.current_match.percent;

                //Restructure diff object booleans.
                for (var diff in $scope.match_diff) {
                    if ($scope.match_diff[diff] === "duplicate") {
                        $scope.match_diff[diff] = true;
                    } else {
                        $scope.match_diff[diff] = false;
                    }
                }
            }).
            error(function(data, status, headers, config) {
                console.log('error');
            });
        };

        $scope.getMatch();

        $scope.discardMatch = function () {
            $http({
                method: 'POST',
                url: '/api/v1/matches/' + $scope.section + '/' + $scope.match_id,
                data: {determination: 'ignored'}
            }).
            success(function(data, status, headers, config) {
                //Note:  Pill count not refreshing.
                $location.path("match/reconciliation");
            }).
            error(function(data, status, headers, config) {
                console.log('error');
            });
        };

        $scope.createMatch = function () {
            $http({
                method: 'POST',
                url: '/api/v1/matches/' + $scope.section + '/' + $scope.match_id,
                data: {determination: 'added'}
            }).
            success(function(data, status, headers, config) {
                //Note:  Pill count not refreshing.
                $location.path("match/reconciliation");
            }).
            error(function(data, status, headers, config) {
                console.log('error');
            });
        };

        $scope.saveMatch = function () {
            $http({
                method: 'POST',
                url: '/api/v1/matches/' + $scope.section + '/' + $scope.match_id + '/' + $scope.current_match_index,
                data: {determination: 'merged', updated_entry: $scope.update_entry} 
            }).
            success(function(data, status, headers, config) {
                //Note:  Pill count not refreshing.
                $location.path("match/reconciliation");
            }).
            error(function(data, status, headers, config) {
                console.log('error');
            });   
        };

        $scope.newTemplatePath = "templates/matching/reconciliation/review/templates/" + $scope.section + "_new.tpl.html";
        $scope.recordTemplatePath = "templates/matching/reconciliation/review/templates/" + $scope.section + "_record.tpl.html";


        //Need to initialize selection array.  May be able to walk original to build.
        $scope.selectedItems = {};
        $scope.selectedItems.reaction = [];
        //$scope.selectedItems.allergen = {};


        //TODO:  Inject reaction severity into display from object.

        $scope.selectField = function(entry, entry_index, entry_status) {

            //Don't process hidden items.
            if (entry_status) {
                return;
            }

            if (entry_index >= 0 && entry_index !== null) {
                if (!$scope.selectedItems[entry][entry_index]) {
                    $scope.selectedItems[entry][entry_index] = true;
                    $scope.update_entry[entry][entry_index] = $scope.new_entry[entry][entry_index];
                } else {
                    $scope.selectedItems[entry][entry_index] = false;
                    if ($scope.current_entry[entry][entry_index] !== undefined) {
                        $scope.update_entry[entry][entry_index] = $scope.current_entry[entry][entry_index];
                    } else {
                        $scope.update_entry[entry].splice([entry_index], 1);
                    }
                }

            } else {
                if (!$scope.selectedItems[entry]) {
                    $scope.selectedItems[entry] = true;
                    $scope.update_entry[entry] = $scope.new_entry[entry];
                } else {
                    $scope.selectedItems[entry] = false;
                    $scope.update_entry[entry] = $scope.current_entry[entry];
                }

            }

        };

        /*$scope.entryType = function(input) {
            var response = 'str';
            if (angular.isObject(input)) {
                response = 'obj';
            }
            if (angular.isArray(input)) {
                response = 'arr';
            }
            return response;
        };*/


        /*

        $scope.sample_match = {
            "match": "partial",
            "percent": 50,
            "subelements": {
                "reaction": [{
                    "match": "new",
                    "percent": 0,
                    "src_id": "1",
                    "dest_id": "0",
                    "dest": "dest"
                }]
            },
            "diff": {
                "date_time": "duplicate",
                "identifiers": "duplicate",
                "allergen": "duplicate",
                "severity": "new",
                "status": "duplicate",
                "reaction": "new"
            },
            "src_id": "0",
            "dest_id": "0",
            "dest": "dest"
        };

        for (var i in $scope.new_entry.reaction) {
            $scope.selectedItems.reaction.push(false);
        }



        //Build out sub-diff objects.
        var max_src = 0;
        var max_dest = 0;
        for (var maxi in $scope.sample_match.subelements.reaction) {
            if ($scope.sample_match.subelements.reaction[maxi].src_id > max_src) {
                max_src = $scope.sample_match.subelements.reaction[maxi].src_id;
            }
            if ($scope.sample_match.subelements.reaction[maxi].dest_id > max_dest) {
                max_dest = $scope.sample_match.subelements.reaction[maxi].dest_id;
            }
        }


        //Inject subelement reactions to diff.
        for (var reaction in $scope.sample_match.subelements.reaction) {

            if ($scope.sample_match.subelements.reaction[reaction].match === 'new') {

                //console.log($scope.sample_match.subelements.reaction[reaction]);

            }
        }*/

        recordFunctions.formatDate($scope.new_entry.date);
        recordFunctions.formatDate($scope.current_entry.date);

    }
]);
