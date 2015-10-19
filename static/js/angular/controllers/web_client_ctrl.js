gApp.controller('webClientCtrl', ['$scope','$location','EndpointsService',function ($scope, $location,endpointsService) {
    /**************************************************
     * User functions
     **************************************************/
    $scope.loaded = false;
    $scope.users = [{"first_name":"asdf","last_name":'zxcvs'}];
    $scope.user = {};
    $scope.alerts = []; 

    $scope.$on(endpointsService.ENDPOINTS_READY, function () {
        $scope.listUsers();
    });


    $scope.listUsers = function(){
    	endpointsService.listUser({}, function (response) {
            $scope.users = response.items;
            $scope.loaded = true;
            setTimeout(function(){ componentHandler.upgradeDom(); }, 300);

        });
    };
    
    
    $scope.saveUser = function(userForm){
    	if(userForm.$valid){
    		$("button").attr('disabled',true);
    		endpointsService.insertUser($scope.user, function (response) {
    			$scope.listUsers();
    			if(response.error === undefined){
       				setTimeout(function(){
       					$scope.listUsers();
           				$scope.cleanFormUser();
       		    	}, 5000);       				
       				$scope.setAlert("El usuario fue guardado", "success");
    			}else{
    				$scope.setAlert(response.message, "danger");
    			}   				       		
            });
    	}
    }
    
    $scope.cleanFormUser = function(){
    	$scope.user = {};
    }
    
    $scope.setAlert = function(msg, type){
    	var alert = {'msg':msg, 'type':type};
    	$scope.alerts.push(alert);
    	setTimeout(function(){
    		$scope.alerts.shift();
    		$("button").attr('disabled',false);
    		$scope.$apply();
    	}, 5000);
    	
    }
    
}]);