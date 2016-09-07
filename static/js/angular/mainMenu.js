(function() {
    "use strict";

    var mainMenu = angular.module('mainMenu', ['$eforModal']);
    mainMenu.service('EndpointsService', ['$log', '$q', '$rootScope', '$http', 'requestNotificationChannel', EndpointsService]);
    mainMenu.directive('mainMenu',['$location','$compile', menuDirective]);
    mainMenu.controller('menuController',['$scope' ,'eforModal', 'EndpointsService', '$translate', '$filter', menuController]);

    function menuController($scope, $efmodal, endpointsService, $translate, $filter) {

        // Auto load
        loadMainMenu();

        function loadMainMenu() {
            $scope.menu_items = [
                {name: "{[{'menu_home' | translate}]}", href: '/admin', ico: 'home'},
                {name: "{[{'menu_settings' | translate}]}", ngClick: 'openConfig()', ico: 'settings'}
            ];
        }

        $scope.openConfig = function() {
            $efmodal.open({templateUrl: '/static/html/modals/settings.html', scope: $scope});
        }
        
    }

    function menuDirective($location, $compile) {
        var current_location = $location.absUrl();

        function constructor(obj) {
            var newElement = $('<a class="mdl-navigation__link">').text(obj.name);
            
            if ( obj.href ) {
                newElement.attr('href', obj.href).text(obj.name);

            } else if ( obj.ngClick ) {
                newElement.attr('ng-click', obj.ngClick);

            }

            var icon = $('<i class="material-icons">').text(obj.ico);
            newElement.addClass( setClassActive(obj.href) );
            
            return newElement.prepend(icon);
        }

        function setClassActive(path) {
            var regExp = RegExp( path+'/?$' );
            if ( current_location.match(regExp) ) {
                return 'is-active';

            } else {
                return 'is-unactive';

            }
        }

        return{
            restrict: 'A',
            link: function( scope, element, attrs, controllers ) {
                scope.$watch(attrs.mainMenu, function() {

                    var links = scope[attrs.mainMenu];

                    if( links && links.length ) {
                        for( var i=0; i < links.length; i++ ) {
                            var newElement = constructor(links[i]); 
                            element.append( newElement );
                            $compile(newElement)(scope);
                        }

                    }else{
                        console.log('not find menu items in var send');
                    }
                });
            }
        }
    }

})();
