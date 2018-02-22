(function(){

var loadApp = angular.module('$loadAppWidget',[]);

loadApp
    .directive('loadingWidget', ['$rootScope', 'requestNotificationChannel', loadingWidget])
    .directive('whenScrolled', [whenScrolled] )
    .service('requestNotificationChannel', ['$rootScope', requestNotificationChannel]);
    
//directive
function loadingWidget($rootScope, requestNotificationChannel) {
    return {
        restrict: "A",
        link: function (scope, element, attrs, ctrls) {
            // Hide the element initially
            element.hide();
            var startRequestHandler = function() {
                // Got the request start notification, show the element
                element.show();
            };

            var endRequestHandler = function() {
                // Got the request start notification, show the element
                element.hide();
            };

            requestNotificationChannel.onRequestStarted(scope, startRequestHandler);
            requestNotificationChannel.onRequestEnded(scope, endRequestHandler);
        }
    };
}

//directive
function whenScrolled() {
    return function(scope, elm, attr) {
        var raw = elm[0];
        
        elm.bind('scroll', function() {
            if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
                scope.$apply(attr.whenScrolled);
            }
        });
    };
}

// Service
function requestNotificationChannel($rootScope){
    // Private notification messages
    var _START_REQUEST_ = '_START_REQUEST_';
    var _END_REQUEST_ = '_END_REQUEST_';

    // Publish start request notification
    var requestStarted = function(_loadingClass) {
        $rootScope.loadingClass = _loadingClass || '';

        $rootScope.$broadcast(_START_REQUEST_);
    };
    // Publish end request notification
    var requestEnded = function(_loadingClass) {
        $rootScope.loadingClass = '';
        
        $rootScope.$broadcast(_END_REQUEST_);
    };
    // Subscribe to start request notification
    var onRequestStarted = function($scope, handler){
        $scope.$on(_START_REQUEST_, function(event){
            handler();
        });
    };
    // Subscribe to end request notification
    var onRequestEnded = function($scope, handler){
        $scope.$on(_END_REQUEST_, function(event){
            handler();
        });
    };

    return {
        requestStarted:  requestStarted,
        requestEnded: requestEnded,
        onRequestStarted: onRequestStarted,
        onRequestEnded: onRequestEnded
    };
}

})();
