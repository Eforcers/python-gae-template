(function() {
    "use strict";

    var gTask = angular.module('settings', ['ngAnimate', 'mainMenu', '$eforModal', '$loadAppWidget', 'ui-notification']);

    gTask.service('EndpointsService', ['$log', '$q', '$rootScope', '$http', '$window', 'requestNotificationChannel', EndpointsService]);
    gTask.config(configure);
    gTask.config(notificationConfig);
    gTask.controller('configureController', ['$log', '$rootScope', '$window', '$http', '$scope', '$location', 'EndpointsService',
        'eforModal', '$timeout', '$interval', 'Notification', '$translate', '$filter', configureController]);

    // controller
    function configureController($log, $rootScope, $window, $http, $scope, $location, endpointsService, $efmodal, $timeout,
        $interval, notification, $translate, $filter) {

        $scope.loaded = false; //base
        $rootScope.DOMAIN = window.DOMAIN;
        var translate = $filter('translate');
        $scope.search_criteria = '';
        $scope.user_results = [];
        $scope.search_criteria = '';
        $scope.admin_users = []; // contain administrators
        $rootScope.SYNC_ORGS_FINISH = $rootScope.SYNC_ORGS_FINISH || 'SYNC_ORGS_FINISH'; // From admin.js
        $scope.languageList = $window.translateConfig()[1].map(function(e){ return {'id': e, 'lang':translate(e) } }); // [{},{}] from configure.js
        $scope.configure = {
            api_authorize :  {
                date : null,
                status : 'done' // done_all | sync | done
            },
            sync_users : {
                date : null,
                status : 'done'
            },
            sync_orgs : {
                date : null,
                status : 'done'
            },
            // Extract value language from root selected and conver in object
            language : $scope.languageList.filter(function(e) {
                    return e.id == $rootScope.setLanguage;
                })[0],
            frequency : 0,
            receive_email_report : false,
            warn_user_when_changed : false,
            domain : ''
        };

        // When modal is loaded
        getClientSettings();
        
        function getClientSettings() {
            notification.info('load info fake');
        }

        $scope.loadUser = function(email) {
            $log.debug(email);

            var user = {
                domain : $rootScope.DOMAIN,
                email : email,
                is_admin : true
            };

            $scope.setAdministrator(email, true);
            window.reloadMDLDOM($interval);
        };

        // To select language from root
        $scope.selectLanguage = function(lang_option) {
            // set in angular translate
            $rootScope.changeLanguage(lang_option.id);
        };

    }

})();
