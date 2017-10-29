(function() {
	'use strict';

	// Service
	window.EndpointsService = function($log, $q, $rootScope, $http, $window, requestNotificationChannel) {

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

				// Call endpoint url
				gapi.client[api][method](args).execute( function(resp) {
					callback(resp);
					$rootScope.$apply( deferred.resolve(resp) );

					// Hidde loading widget
					requestNotificationChannel.requestEnded( options.loadingClass );
				} );

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

    service.isLoged = function() {
      var buttons = document.querySelectorAll("[ng-click^='login(']");
      if (gapi.auth.getToken() === null || gapi.auth.getToken() === undefined ) {
        $rootScope.not_authorized = true;
      } else {
        $rootScope.not_authorized = false;
      }

      for ( var btni=0; btni < buttons.length; btni++ ) {
        if ( $rootScope.not_authorized ) {
          buttons[btni].classList.remove('hidden');
        } else {
          buttons[btni].classList.add('hidden');
        }
      }

      return $rootScope.not_authorized;
    };

		service.authorize = function(client_id, scopes, auth_callback, mode) {
      // mode in click
      var mode = mode == undefined ? true : mode; 
      // Store function in queue
			queueFun.push(auth_callback);
			// send google auth
			gapi.auth.authorize(
				{client_id: client_id, scope: scopes, immediate: mode},
				service.auth_callback_builder(client_id, scopes)
			);
		}

		service.auth_callback_builder = function(client_id, scopes) {
			// Save the accessToken for reutilizae in frontend
			return  function(authResult) {
				if (authResult.error) {
          service.isLoged();
					gapi.auth.authorize(
							{client_id: client_id, scope: scopes, immediate: false},
							runQueueFun // send with errors

						);
				} else{
					// run all functions queue
          $rootScope.not_authorized = false;
          service.isLoged();
					return runQueueFun(authResult);

				}

			}
		};

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
        if ( !(window.api_host && window.api_host.match(/appspot.com/i)) && window.API_ROOT ) {
          apiRoot = window.API_ROOT; /*In constants.js*/
        } else {
          apiRoot = "https://" + apiRoot;
        }
			}

			gapi.client.load(api, version, function() {
				var apiUrl = '';
				// Update for ng-1.6
				$http({
					method: 'GET',
						url: apiRoot + '/discovery/v1/apis/' + api + '/' + version + '/rest'
				})
				.then(
					function(response) {
						var data = response.data;

						for (var method in data.methods) {
							service[method] = builder(api, method);
              if ( location.host.match(/localhost/) ) {
                $log.info("Method " + method + " created");
              }

						}
						service.loaded_apis += 1;
						callback();
					},
					function() {
						console.log(data);
					}
				);

				$rootScope.$$phase || $rootScope.$apply();

			}, apiRoot);
		};

		// Load from base html
		$window.api_load = function(api, version) {
			// Open angular broadcast _START_REQUEST_ (block screen to load endpoints)
			requestNotificationChannel.requestStarted('block');
      // to use auth
      $window.apisToLoad = $window.apisToLoad >= 0 ? $window.apisToLoad : $window.apis.length || 0;
      var callbackInint = function() {
        if (--$window.apisToLoad == 0) {

          gapi.client.load('oauth2', 'v2', function() { });
        }
      }

			service.loadService(api, version, function() {
				if (service.loaded_apis == service.total_apis) {
					$rootScope.$broadcast(service.ENDPOINTS_READY);
					requestNotificationChannel.requestEnded();
				}
        // add oauth 2
        callbackInint();
			});
		};

		function objectDatesToString(obj) {
			for (var key in obj) {
				if (obj[key] instanceof Date) {
					var timestamp = obj[key].getTime();
					timestamp += obj[key].getTimezoneOffset() * 60 * 1000;
					var date = new Date(timestamp);
					obj[key]  = date.getFullYear() + "-" +
						("0" + (date.getMonth() + 1)).slice(-2) + "-" +
						("0" + date.getDate()).slice(-2);

				} else if (obj[key] instanceof Object) {
					objectDatesToString(obj[key]);
				}
			}
		}

	}
})();
