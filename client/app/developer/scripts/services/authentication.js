'use strict';

/**
 * @ngdoc service
 * @name phrDeveloperApp.authentication
 * @description
 * # authentication
 * Service in the phrDeveloperApp.
 */
angular.module('phrDeveloperApp')
    .service('authentication', function authentication($rootScope, $location, $http) {
        var auth_data = {};

        function clearAuth() {
            auth_data = {};
            $rootScope.isAuthorized = false;
        }
        this.clearAuth = clearAuth;

        this.authStatus = function (callback) {
            if (Object.keys(auth_data).length > 0) {
                if (auth_data.authenticated) {
                    callback(null, true);
                } else {
                    callback(null, false);
                }
            } else {
                $http.get('/api/v1/developer/account')
                    .success(function (data) {
                        if (data && data.authenticated) {
                            auth_data.authenticated = true;
                            callback(null, true);
                        } else {
                            auth_data.authenticated = false;
                            callback(null, false);
                        }

                    }).error(function (err) {
                        auth_data.authenticated = false;
                        callback(err, false);
                    });
            }
        };

        this.devStatus = function (callback) {
            $http.get('/api/v1/developer/')
                .success(function (data) {
                    console.log(data);
                    callback(null, true);
                })
                .error(function (err) {
                    callback(err, false);
                });
        };

        this.login = function (username, password, callback) {
            // console.log("login service:", username, password);
            if (username && password) {
                $http.post('/api/v1/developer/login', {
                        username: username,
                        password: password
                    })
                    .success(function (data) {
                        auth_data.authenticated = true;
                        callback(null);
                    })
                    .error(function (data) {
                        console.log("login failed");
                        //callback(data);
                        auth_data.authenticated = false;
                        callback('Invalid Login and/or Password.');
                    });
            }
        };

        this.logout = function (callback) {
            var err = null;

            $http.post('/api/v1/developer/logout')
                .success(function () {
                    clearAuth();
                    callback(null);
                }).error(function (err) {
                    console.log("logout failed");
                    callback(err);
                });
        };
    });
