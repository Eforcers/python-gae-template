(function() {
    "use strict";
    gApp.controller('adminIndex', ['$scope', '$location', '$interval', 'EndpointsService', 'eforModal', 'Notification', '$filter',
        function($scope, $location, $interval, endpointsService, $efmodal, notification, $filter) {

        $scope.loaded = false;
        $scope.users = [];
        $scope.userEdit = {};
        $scope.alerts = [];
        var translate = $filter('translate');

        $scope.$on(endpointsService.ENDPOINTS_READY, function() {
            endpointsService.authorize(CLIENT_ID, SCOPES, $scope.listUsers);
        });

        $scope.listUsers = function() {
            endpointsService.listUser({}, function(response) {
                $scope.users = response.items;
                $scope.loaded = true;
                reloadMDLDOM($interval);

            });
        };

        $scope.openCreate = function() {
            $efmodal.open({templateUrl:'/static/html/modals/new_creation.html', scope:$scope});
        };

        $scope.openDelete = function(user) {
            $efmodal.open({templateUrl:'/static/html/modals/delete_user.html', scope:$scope,  type:'danger'});
        };

        $scope.delete = function(user) {
            $efmodal.close();
            notification.info(translate('cleanFormUser'));
        };
        
        $scope.saveUser = function(userForm) {
            if (userForm.$valid) {
                userForm.disableButton = true;
                endpointsService.insertUser($scope.userEdit, function(response) {
                    
                    $scope.listUsers();
                    // validate response
                    if (response.error) {
                        notification.error(response.message, "danger");
                        return false;

                    }
                    
                    notification.info( translate('notify_creation') );
                    userForm.disableButton = true;
                    $efmodal.close();
                    cleanFormUser();

                });
            } else {
                newProccessForm.disableButton = false;
                notification.error(translate("notify_creation_error"));
            }
        }
        
        function cleanFormUser() {
            $scope.userEdit = {};
        }
        
        
    }]);
})();
