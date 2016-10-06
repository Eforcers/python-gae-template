(function(){
    "use strict";

    if (location.href.match(/localhost|appspot/)){

        // press alt + r to reload local styles css
        window.reloadStyle = function () {

            document.addEventListener('keydown', function keyCombinePress(e){
                //alt + r
                if (e.keyCode == 82 && e.altKey) {
                    var randomQuery = Math.floor((Math.random() * 10000) + 1);
                    var styleElements = document.querySelectorAll('link');
                    var styleElementsLenght = styleElements && styleElements.length;

                    if (styleElementsLenght) {
                        var i = 0;

                        for (i; i < styleElementsLenght; i++ ) {
                            var host = location.host;
                            var styleElement = styleElements[i];
                            var urlElement = styleElement.href.replace(/\?\d+/,'') + '?' + randomQuery;

                            // replace css style only if is self domain application
                            if (urlElement.match(/^\/\w+\d?/) || urlElement.match(host)) styleElement.href = urlElement;

                            }

                        }

                    }

                });

            };reloadStyle();

            // it allow resize inspector plugin for chrome
            window.resizeNgInstector = function(){

                // run
                var inter = setInterval( function(){
                    var content = document.querySelector('body > .mdl-layout__container');
                    var inspector = document.querySelector('body > .ngi-inspector');

                    // Find plugin div and get width element for later set in body
                    if (inspector && content) {
                        var width = inspector.offsetWidth;

                        content.style.maxWidth = 'calc(100% - ' + width + 'px)';
                        document.body.style.maxWidth = 'calc(100% - ' + width + 'px)';

                    } else if (content) {
                        content.style.maxWidth = '';
                        document.body.style.maxWidth = '';

                    }

                    // set action key for resize body content before load inspector div
                    if(inspector && !window.inspetorAction) {
                        // alt + m
                        document.addEventListener('keydown', function(e){
                            if(e.keyCode == 77 && e.altKey){
                                var tabs = document.querySelectorAll('body > .ngi-inspector .ngi-scope.ngi-expanded');
                                var cant = tabs.length
                                var i = 0;

                                for( i; i < cant; i++ ){
                                    if( i > 0){
                                        var tab = tabs[i];
                                        if(tab) tab.querySelector('.ngi-caret').click();
                                    }
                                }

                            }
                        });

                        // set variable true for non add event listener again
                        window.inspetorAction = true;

                    }

                },
                1000);
        };resizeNgInstector();


    }

})();
