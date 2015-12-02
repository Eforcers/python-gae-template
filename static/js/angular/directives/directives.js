gApp.directive('loadingWidget', ['requestNotificationChannel', function (requestNotificationChannel) {
    return {
        restrict: "A",
        link: function (scope, element) {
            // hide the element initially
            element[0].style.display = "none";
            var startRequestHandler = function() {
                // got the request start notification, show the element
                element[0].style.display = "";
            };

            var endRequestHandler = function() {
                // got the request start notification, show the element
                element[0].style.display = "none";
            };

            requestNotificationChannel.onRequestStarted(scope, startRequestHandler);

            requestNotificationChannel.onRequestEnded(scope, endRequestHandler);
        }
    };
}]);

gApp.directive('whenScrolled', function() {
    return function(scope, elm, attr) {
        var raw = elm[0];

        elm.bind('scroll', function() {
            if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
                scope.$apply(attr.whenScrolled);
            }
        });
    };
});