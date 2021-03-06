(function() {
    "use strict";

    // config
    window.configure = function ($interpolateProvider, $httpProvider, $provide, $logProvider) {
        $interpolateProvider.startSymbol('{[{');
        $interpolateProvider.endSymbol('}]}');
        // Enable or disable $logs Debug
        $logProvider.debugEnabled(false);
    };

    // mdl angular
    window.runMDLObservator = function() {
        try {
            var observer = new MutationObserver(function() {
                componentHandler.upgradeDom();
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        } catch(e) {
            console.warn('Browser not soport MutationObserver for mdl');

            // support <= IE 10
            window.reloadMDLDOM();
        }
    };

    window.notificationConfig = function(NotificationProvider) {
        NotificationProvider.setOptions({
            delay: 4500,
            startTop: 70,
            startRight: 100,
            verticalSpacing: 15,
            horizontalSpacing: 15,
            positionX: 'right',
            positionY: 'top'
        });
    };

    window.translateConfig = function($translateProvider) {
        // extract all language from language.js
        var languageList = Object.keys(window.language_content);
        // Prepare reges for select and compare
        var regex = new RegExp(languageList.join('|'), 'i'); //es|en|fr
        // Trim languaje string 'es-ES' 'it-CH' to 'es', 'it'
        var language = navigator.language || navigator.userLanguage;
        language = language.replace(/-.+$/i, '');
        // navigator language is in list
        language = language.match(regex); // return ['es'] r other
        // Select match language and Limit to 'es' or 'en
        language = language ? language[0] : languageList[0];

        if ($translateProvider) {
            $translateProvider.useSanitizeValueStrategy('escape');
            // add all languages
            for ( var i in languageList ) {
                var lang = languageList[i];
                $translateProvider.translations(lang, window.language_content[lang]);
            }
            $translateProvider.preferredLanguage(language);
        }
        return [language,languageList];

    };

})();
