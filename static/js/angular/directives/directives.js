(function() {
    "use strict";

    gApp.directive('userList', function() {
        return {
            restric: 'A',
            templateUrl: '/static/html/partials/user_list.html'
        };
    });
    gApp.directive('userEmpty', function() {
        return {
            restric: 'A',
            templateUrl: '/static/html/partials/user_empty.html'
        };
    });

})();