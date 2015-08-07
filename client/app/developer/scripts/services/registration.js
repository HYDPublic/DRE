'use strict';

/**
 * @ngdoc service
 * @name phrDeveloperApp.registration
 * @description
 * # registration
 * Service in the phrDeveloperApp.
 */
angular.module('phrDeveloperApp')
    .service('registration', function registration($location, $http) {

        //TODO:  Hygiene here for max length of inputs.
        this.signup = function (info, callback) {
            // console.log("signup", info);

            // verify info for all the elements in api

            $http.post('/api/v1/developer/register', info)
                .success(function (data) {
                    console.log("registration successful");
                    callback(null);
                }).error(function (data) {
                    //callback(data);
                    // console.log("error", data);
                    callback('Invalid Login and/or Password.');
                });

        };
    });
