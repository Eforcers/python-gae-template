gApp.service('EndpointsService', function ($q, $rootScope, $http, $window, requestNotificationChannel) {

    var service = this;
    service.ENDPOINTS_READY = "ENDPOINTS_READY";
    service.total_apis = 0;
    service.loaded_apis = 0;

    /**
     * build service methods from discovery document
     * @param api
     * @param resource
     * @param method
     * @returns {Function}
     */
    var builder = function (api, method) {
        return function (args, callback) {
            requestNotificationChannel.requestStarted();
            objectDatesToString(args);
            var deferred = $q.defer();
            args['domain'] = $window.domain;
            gapi.client[api][method](args).execute(function (resp) {
                callback(resp);
                $rootScope.$apply(deferred.resolve(resp));
                requestNotificationChannel.requestEnded();
            });
            return deferred.promise;
        };
    }
    
    service.authorize = function(client_id, scopes, auth_callback){
        gapi.auth.authorize(
            {client_id: client_id, scope: scopes, immediate: true},
            service.auth_callback_builder(client_id, scopes, auth_callback)
        );
    }
    
    service.auth_callback_builder = function(client_id, scopes, auth_callback){
    	return  function(authResult){
    		if(authResult.error){
    			gapi.auth.authorize(
    		            {client_id: client_id, scope: scopes, immediate: false},
    		            auth_callback
    		        );
    		}else{
    			return auth_callback(authResult);
    		}
    		
    		
    	}
    }

    /**
     * brings the discovery document and adds methods in the service built from the information brought
     * @param api
     * @param version
     */
    service.loadService = function (api, version, callback) {
        service.total_apis += 1;
        var apiRoot = $window.api_host + '/_ah/api';
        if (apiRoot.indexOf("localhost") >= 0 || apiRoot.indexOf("127.0.0.1") >= 0) {
            apiRoot = "http://" + apiRoot;
        } else {
            apiRoot = "https://" + apiRoot;
        }
        gapi.client.load(api, version, function () {
            var apiUrl = '';
            $http.get(apiRoot + '/discovery/v1/apis/' + api + '/' + version + '/rest').success(function (data) {
                for (method in data.methods) {
                    service[method] = builder(api, method);
                    console.log("Method " + method + " created");
                }
                service.loaded_apis += 1;
                callback();
            });
            $rootScope.$$phase || $rootScope.$apply();
        }, apiRoot);
    };

    $window.api_load = function (api, version) {
        requestNotificationChannel.requestStarted();
        service.loadService(api, version, function () {
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
                ("0" + date.getDate()).slice(-2)
            }else if(obj[key] instanceof Object){
                objectDatesToString(obj[key]);
            }
        }
    }
});