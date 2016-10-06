(function() {

// Service
window.EndpointsService = function($log, $q, $rootScope, $http, $window
    , requestNotificationChannel) {

    var service = this;
    service.ENDPOINTS_READY = "ENDPOINTS_READY";
    service.total_apis = 0;
    service.loaded_apis = 0;
    service.TOKEN = "";

    /**
     * build service methods from discovery document
     * @param api
     * @param resource
     * @param method
     * @returns {Function}
     */

    // This function is for not generate dependences from message channel
    var notificate = {
        requestStarted: function() {
            $log.info('START REQUEST');

        },
        requestEnded: function($scope, handler) {
            $log.info('END REQUEST');
            handler;

        }
    };
    //this asign a messager function to use
    var requestNotificationChannel = requestNotificationChannel || notificate;

    var builder = function(api, method) {
        return function(args, callback, options) {
            // Validate if show loading div
            var options = options || {};
            requestNotificationChannel.requestStarted(options.loadingClass);

            objectDatesToString(args);
            var deferred = $q.defer();

            // Always send domain
            if (!args.domain){
                args.domain = $window.DOMAIN || $window.domain || '' ;

                // Send warning if don't send domain becouse is required
                if (!args.domain) {
                    $log.warn('endpointService don\'t send domain', args.domain);

                }
            }
            gapi.client[api][method](args).execute(function(resp) {
                callback(resp);
                $rootScope.$apply(deferred.resolve(resp));

                // Hidde loading widget
                requestNotificationChannel.requestEnded(options.loadingClass);
            });
            return deferred.promise;

        };

    }

    // This arra store functions for execute before callbacks
    var queueFun = [];

    // This function run all stored functions
    function runQueueFun(response) {
        for (var i=0; i < queueFun.length; i++) {
            var funBack = queueFun[i];
            if ( typeof(funBack) == 'function' ) {
                funBack(response);
            } else {
                $log.warn('This is not a function for callback: ', funBack );
            }
        }
        queueFun = [];
    }

    service.authorize = function(client_id, scopes, auth_callback) {
        // Store function in queue
        queueFun.push(auth_callback);
        // send google auth
        gapi.auth.authorize(
            {client_id: client_id, scope: scopes, immediate: true},
            service.auth_callback_builder(client_id, scopes)
        );
    }

    service.auth_callback_builder = function(client_id, scopes) {
        // Save the accessToken for reutilizae in frontend
        return  function(authResult) {
            if (authResult.error) {
                gapi.auth.authorize(
                        {client_id: client_id, scope: scopes, immediate: false},
                        runQueueFun // send with errors

                    );
            } else{
                // run all functions queue
                return runQueueFun(authResult);

            }

        }
    }

    /**
     * brings the discovery document and adds methods in the service built from the information brought
     * @param api
     * @param version
     */
    service.loadService = function(api, version, callback) {
        service.total_apis += 1;
        var apiRoot = $window.api_host + '/_ah/api';
        // NOTE: endpoints needs https protocol for any not local host, (production host not has https certificate)
        if (apiRoot.indexOf("localhost") >= 0 || apiRoot.indexOf("127.0.0.1") >= 0) {
            apiRoot = "http://" + apiRoot;

        } else {
            apiRoot = "https://" + apiRoot;

        }

        gapi.client.load(api, version, function() {
            var apiUrl = '';

            $http.get(apiRoot + '/discovery/v1/apis/' + api + '/' + version + '/rest').success(function(data) {
                for (method in data.methods) {
                    service[method] = builder(api, method);
                    $log.info("Method " + method + " created");

                }
                service.loaded_apis += 1;
                callback();

            });

            $rootScope.$$phase || $rootScope.$apply();

        }, apiRoot);
    };

    // Load from base html
    $window.api_load = function(api, version) {
        // Open angular broadcast _START_REQUEST_ (block screen to load endpoints)
        requestNotificationChannel.requestStarted('block');

        service.loadService(api, version, function() {
            if (service.loaded_apis == service.total_apis) {
                $rootScope.$broadcast(service.ENDPOINTS_READY);
                requestNotificationChannel.requestEnded();

            }
        });
    };

    if ($window.google_client_loaded && !$window.loading_apis) {
        console.log('Api client loaded first, loading apis...');
        for (i in $window.apis) {
            var api = $window.apis[i];
            $window.api_load(api.name, api.version);

        }

        $window.loading_apis = true;
    }

    function objectDatesToString(obj) {
        for (key in obj) {
            if (obj[key] instanceof Date) {
                var timestamp = obj[key].getTime();
                timestamp += obj[key].getTimezoneOffset() * 60 * 1000;
                date = new Date(timestamp);
                obj[key]  = date.getFullYear()+"-"+
                    ("0" + (date.getMonth() + 1)).slice(-2) +"-"+
                    ("0" + date.getDate()).slice(-2);

            } else if (obj[key] instanceof Object) {
                objectDatesToString(obj[key]);

            }
        }
    }
}

})();
