(function() {
    "use strict";

    var searchApp = angular.module('$searchInput',[]);
        searchApp.directive('searchInput', ['$log', '$compile', '$timeout', '$window', SearchDirective]);

    function SearchDirective($log, $compile, $timeout, $window) {
        return{
            restrict: 'A',
            link: function(scope, element, attrs) {
                // Extract attributes
                var attrPlaceholder = attrs.inpPlaceholder ? 'placeholder="' + (searchStringInLanguageKeys(attrs.inpPlaceholder) || attrs.inpPlaceholder )+ '"' : '';
                var attrQueryModel = attrs.inpQueryModel ? 'ng-model="' + attrs.inpQueryModel + '"' : '';
                var attrReadOnly = attrs.readonly ? 'readonly' : '';
                var inpKeyFun = attrs.inpKeyFun ? execute_Fun(attrs.inpKeyFun) : null;
                var inpEnterFun = attrs.inpEnterFun ? execute_Fun(attrs.inpEnterFun) : null;
                var attrEnterFun = attrs.inpEnterFun ? 'ng-click="' + attrs.inpEnterFun + ';"' : '';
                var attrClearFun = attrs.inpClearFun ? 'ng-click="' + attrs.inpClearFun + '; ' + attrs.inpQueryModel + '=\'\'"' : '';
                var listRepeat = attrs.listRepeat || null;
                var listSelectFun = attrs.listSelectFun ? scope[attrs.listSelectFun] : null;
                var listMdlIcon = attrs.listMdlIcon ? '<i class="material-icons">' + attrs.listMdlIcon + '</i>' : '';
                // attrMultipleFun is used for validate if is multiselected
                var attrMultipleFun = attrs.listMultipleFun ?  'ng-click="' + attrs.listMultipleFun + '"' : '';
                // Object to array repeat {} or []
                var repetItem = splitIn(listRepeat, 'item');
                var repetInObject = splitIn(listRepeat, 'object');
                var repetFilter = splitIn(listRepeat, 'filter');

                // Elements create
                var elemInpQuery = $('<input class="input_query" type="text"autocomplete="off" ' + attrPlaceholder + ' '
                                    + attrQueryModel + ' ' + attrReadOnly + ' ng-model-options="{ debounce: 500 }">');
                var elemInpIcon = $('<a class="material-icons ico-search" ' + attrEnterFun + '>search</a>');
                // Icons for tools in bar
                var elemContIcos = $('<div class="cont-icos">');
                var elemInpClear = $('<a class="material-icons btn-close" ng-if="' + attrs.inpQueryModel + '" ' + attrClearFun + '>close</a>');
                var elemInpShowResults = $('<a class="material-icons ico-show" ng-show="' + repetInObject + '.length">keyboard_arrow_down</a>');
                // Div list result
                var elemContGenList = $('<div class="cont-gen-list" ng-show="' + repetInObject + '.length">');
                var elemInpResultCont = $('<div class="desplegable-list">');
                var elemInpResultList = $('<label class="li" ng-repeat="item in ' + repetInObject + repetFilter
                                            + '" ng-click="' + attrs.listSelectFun + '" >'
                                            + listMdlIcon + '<i class="material-icons" ng-if="item.icon">{[{item.icon}]}</i>\
                                            {[{' + repetItem + '}]}</label>');
                var elementResultEmpty = $('<span class="search-notmatchuser" ng-show="!' + repetInObject + '">No hay coincidencias</span>');
                var elemContBtnsInf = $('<div class="cont-btns-inf" ng-show="' + repetInObject + '.length" >');
                var elementBtnResult = $('<button class="btn-multiple-action mdl-button mdl-button--primary mdl-button--raised" '
                                        + attrMultipleFun + '>Seleccionar</button>');

                // Prepare conteiner
                element.addClass('hide-list');

                // Add DOM elements
                element.append(elemInpQuery);
                element.append(elemInpIcon);
                element.append(elemContIcos);
                elemContIcos.append(elemInpClear);

                // Add list items and down icon to main element
                if (listRepeat) {
                    elemInpResultCont.append(elemInpResultList);
                    elemInpResultCont.append(elementResultEmpty);
                    elemContGenList.append(elemInpResultCont);
                    element.append(elemContGenList);
                    // Row icon
                    elemContIcos.append(elemInpShowResults);

                }

                // If is multiple add checkbox and button multiple action
                if (attrMultipleFun) {
                    elemInpResultList.prepend('<input type="checkbox" ng-model="item.inpChecked">');
                    elemInpResultList.attr('ng-class', '{\'checked\':item.inpChecked}');
                    // Add buttons
                    elemContBtnsInf.append(elementBtnResult);
                    // Add buttons to list container
                    elemContGenList.append(elemContBtnsInf);

                }

                /*
                * Events
                */
                // Blur input
                elemInpQuery.blur(function(event) {
                    // Initialize .to-hide for multiple select, is modified in click multiple
                    // verified if the event is for space check item
                    if (!element.is('.in-spacebar')){
                        element.addClass('to-hide');

                    }

                    $timeout(
                        function() {
                            // This class is modified from click list item to prevent hide cont list
                            if (element.is('.to-hide')) {
                                element.removeClass('show-list').addClass('hide-list');
                                // Remove state hover/selected item
                                elemInpResultCont.children('.hover').removeClass('hover');

                            }
                            // naywhere un mark
                            element.removeClass('to-hide in-spacebar');
                        }
                    ,200);

                });

                // Focus input
                elemInpQuery.focus(function(event) {
                    element.removeClass('hide-list').addClass('show-list');

                });

                // Remove hover onkey down when hover
                elemInpResultCont.mousemove(function(event){
                    elemInpResultCont.children('.hover').removeClass('hover');
                    var targetElement = $(event.target);
                    var listElement = (targetElement.is('.li')) ? targetElement : targetElement.closest('.li');
                    listElement.addClass('hover');
                });

                // Diseño
                elemInpResultCont.click(function(event){
                    // if click checkbox list
                    if (attrMultipleFun) {
                        var targetElement = $(event.target);

                        if (targetElement.is('.li') || targetElement.closest('.li').length) {
                            // add class for mark procedent event and prevent hide the list on check item blur input query
                            element.addClass('in-spacebar');
                            // remove class be cause click need this for not hide list
                            // WARNING: double click be cause browser to do click in input checkbox
                            element.removeClass('to-hide');
                            // mark and check input
                            elemInpQuery.focus();

                        }
                    }

                });

                // Show or hide result from arrow icon
                elemInpShowResults.click(function(){
                   if (!element.is('.show-list')) {
                       elemInpQuery.focus();

                   }

                });

                // Any Keypress
                if (inpEnterFun) {
                    elemInpQuery.on('keydown keypress', function(event) {
                        // Key code is ENTER key
                        switch (event.which) {
                            case 13: // Enter
                                var elementSelected = elemInpResultCont.children('.hover');
                                // event on in put or list element
                                if (elementSelected.length && !attrMultipleFun && element.is('.show-list')) {
                                    event.preventDefault();
                                    elementSelected.click();
                                    elemInpQuery.blur();

                                } else if (attrMultipleFun && element.is('.show-list')) {
                                    // Press multiple action button
                                    event.preventDefault();
                                    elementBtnResult.click();
                                    // elemInpQuery.blur();

                                } else {
                                    inpEnterFun();

                                }

                                break;

                            case 27: // escape
                                    elemInpQuery.blur();
                                    element.removeClass('show-list').addClass('hide-list');

                                break;

                            case 32: // space
                                var elementSelected = elemInpResultCont.children('.hover');
                                // Event on spacebar in select list item
                                if (elementSelected.length && attrMultipleFun &&  element.is('.show-list')) {
                                    event.preventDefault();
                                    // the event on check checkbox item
                                    elementSelected.find('input').click();

                                } else {
                                    element.removeClass('hide-list').addClass('show-list');

                                }

                                break;

                            case 37: // Left
                                break;

                            case 38: // Up
                                if (element.is('.show-list')) {
                                    event.preventDefault();
                                    moveSelectKey(elemInpResultCont, 'up');
                                }
                                break;

                            case 39: // Right
                                break;

                            case 40: // Down
                                element.removeClass('hide-list').addClass('show-list');
                                if (element.is('.show-list')) {
                                    event.preventDefault();
                                    moveSelectKey(elemInpResultCont, 'down');

                                }
                                break;

                            default:
                                // When hide list after click
                                element.removeClass('hide-list').addClass('show-list');
                                break;

                        }
                    });
                }

                // sure close element when click outer component
                var body = $('body');
                if (!body.is('.eforSearchActive')) {
                    body.click(function(event) {
                        var eforSearch = $(event.target).closest('.efor-search');
                        if ( !eforSearch.length ) {
                            $('.efor-search.show-list').removeClass('show-list').addClass('hide-list');
                        }
                    });

                    body.addClass('eforSearchActive');

                }

                // Compile all elements and enable ng events
                $compile(elemInpQuery)(scope);
                $compile(elemInpClear)(scope);
                $compile(elemInpIcon)(scope);
                $compile(elemInpShowResults)(scope);
                $compile(elemContGenList)(scope);
                $compile(elementBtnResult)(scope);

                // Key press function
                scope.$watch(attrs.inpQueryModel, function(value) {
                    // DOIT: show menu
                    // element.removeClass('hide-list').addClass('show-list');
                    // launch function keydown
                    if(typeof(value) === 'string' && value.trim() != '') {

                        if(inpKeyFun && typeof(inpKeyFun) == 'function' ) {
                            inpKeyFun();

                        }
                    }

                });

                // Create function from string
                function execute_Fun(strFun) { //'mn.toDo'
                    // If function has params but only are variables from scope
                    var params = strFun.match(/\(.*\)/i) ? strFun.match(/\(.*\)/i)[0].replace(/\(|\)| */ig,'').split(',')[0] : '';
                    // Cut functon by obkects dots
                    var methods = strFun.match(/[a-z0-9]+\.[a-z0-9]+\(?/ig) ? strFun.split('(')[0].split('.') : [strFun.replace(/\(.{0,}\)/, '')];
                    var returnFunction;

                    // Make methods function
                    for (var object in methods) {
                        returnFunction = returnFunction ? returnFunction[methods[object]] : scope[methods[object]];

                    }

                    // Convert string param in object from scope
                    if (params) {
                        var returnParm;

                        // The param is string
                        if ( typeof(params).match(/^'.+'$/i) ) {
                            returnParm = params.replace(/'/g, '');

                        } else {
                            var params = params.split('.');

                            for (var param in params) {
                                var method = params[param];
                                returnParm = returnParm ? returnParm[method] : scope[method];
                            }

                        }

                        // Return function with only first param
                        return function() {returnFunction(returnParm)};

                    }

                    return returnFunction;

                }

                // for change translate language
                function searchStringInLanguageKeys(attr, index) {
                    if (window.language_content && attr) {
                        var iter = index || 0;
                        var langAvalibles = Object.keys(window.language_content); 
                        var lang = window.language_content[langAvalibles[iter]];
                        var keys = Object.keys(lang);
                        var newAttr;

                        // search in all keys of translate dict
                        for ( var i = 0; i < keys.length; i++ ) {
                            if ( lang[keys[i]] == attr ) {
                                newAttr = "{[{ '" + keys[i] + "' | translate }]}";
                                break;
                            }
                        }

                        // return finder or self value
                        if (newAttr) {
                            return newAttr;
                        } else {
                            iter++;
                            if ((iter) < langAvalibles.length) {
                                // return text in recursive
                                return searchStringInLanguageKeys(attr, iter);
                            } else {
                                return attr;
                            }
                        }

                    }
                }

                // Return item and array for result
                function splitIn(string, type) {
                    var objectName = '';
                    var new_string = string.trim().replace(/ +/,' ');
                    var isObject = !!new_string.match(' in ');

                    // Split if is object fot array and item

                    if (type=='item') {
                        objectName = isObject ? 'item.' + new_string.split(' in ')[0] : 'item';

                    } else if (type=='object') {
                        objectName = isObject ? new_string.split(' in ')[1].replace(/ \|.+$/, '') : new_string;

                    } else if (type=='filter') {
                        objectName = isObject && new_string.match(/\|/) ? new_string.split(' in ')[1].replace(/^.+\|/, ' |') : '';

                    }

                    return objectName;

                }

                // To move list result
                function moveSelectKey(contResult, move) {
                    var listElements = contResult.children('.li');
                    var listLenght = listElements.length;
                    var elementActive = listElements.filter('.hover');
                    var elementToFocus;

                    // Select element to focuse
                    if (elementActive.length) {
                        if (move == 'down') {
                            elementToFocus = elementActive.next('.li');

                        } else if (move == 'up') {
                            elementToFocus = elementActive.prev('.li');

                        }

                    } else {
                        elementToFocus = listElements.eq(0);

                    }

                    // if find element to focuse initial or ending
                    if (elementToFocus.length) {
                        // Remove any element in hover
                        listElements.removeClass('hover');

                        // Focuse in container scroll when move
                        var contHeight = contResult.height();
                        var elementHeight = elementToFocus.outerHeight();
                        var positionTop = elementToFocus.position() ? elementToFocus.position().top : 0;
                        var newTop;

                        // define new position for scroll top
                        if (positionTop > contHeight - elementHeight ) {
                            newTop = contResult.scrollTop() + elementHeight  *2;

                        } else if (positionTop < 0) {
                            newTop = contResult.scrollTop() + positionTop -10;

                        }

                        // set new scroll position
                        contResult.stop(true, true).animate({scrollTop: newTop});

                        // Add class hover
                        elementToFocus.addClass('hover');

                    } else if (move == 'up') {
                        // When is first element retirn to input focus
                        listElements.removeClass('hover');

                    }

                }
            }
        }

    }

})();
