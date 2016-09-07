(function() {
    "use strict";

    window.gApp = angular.module('gApp', [
        'ngAnimate',
        'ngCookies',
        'mainMenu',
        'settings',
        '$eforModal',
        'esmg.filters',
        '$loadAppWidget',
        'ui-notification',
        'pascalprecht.translate'
    ]);

    gApp.service('EndpointsService', ['$log', '$q', '$rootScope', '$http', '$window', 'requestNotificationChannel', EndpointsService]);
    // From configure.js
    gApp.config(configure);
    gApp.config(notificationConfig);
    gApp.config(translateConfig);
    gApp.run(runMDLObservator);

    // Main controller for general needs
    gApp.controller('mainController', ['$log', '$window', '$rootScope', '$scope', '$translate', '$cookieStore', 'EndpointsService', '$filter', 'Notification',
        function getExpirationDate($log, $window, $rootScope, $scope, $translate, $cookieStore, endpointsService, $filter, notification) {

        var translate = $filter('translate');
        $rootScope.setLanguage = $cookieStore.get('setLanguage') || $window.translateConfig()[0]; // 0 is language navigator

        $scope.$on( endpointsService.ENDPOINTS_READY, function(){
            // Not use authorize method because when is first time load, the signatures not load in load endpoint
            endpointsService.authorize(CLIENT_ID, SCOPES, getSettings);
        });

        function getSettings() {
            notification.info('Settings');
        }

        // Change language
        $rootScope.changeLanguage = function(langKey) {
            var langList = $window.translateConfig()[1]; // ['es','en'] from /static/js/resource/language.js

            if (langKey && langList.lastIndexOf(langKey) > -1) {
                $translate.use(langKey);
                $cookieStore.put('setLanguage', langKey);
                $rootScope.setLanguage = langKey;

            } else {
                var lang = $rootScope.setLanguage || window.translateConfig()[0]; // 'en'
                var langSelected = langList.lastIndexOf(lang); // int
                var langChange = '';
                // select next lang from list
                if (langSelected >= langList.length -1) {
                    langChange = langList[0];
                } else {
                    langChange = langList[langSelected+1];
                }

                // Change language and save cookies
                $translate.use(langChange);
                $cookieStore.put('setLanguage', langChange);
                $rootScope.setLanguage = langChange;

            }
        };

    }]);

})();
