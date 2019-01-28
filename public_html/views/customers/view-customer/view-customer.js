(function() {
    var app;
    app = angular.module('view-customer', ['jlg_services'])
        .controller('view-customer-cntrl', ['$scope', '$filter', '$stateParams', 'customer',
            function($scope, $filter, $stateParams, customer) {




                var cust_id = $stateParams.customerID;


                $scope.getCustomer = function(){
                  customer.singleCustomer(cust_id).then(function(response) {
                      $scope.customer = response.data[0];

                  })

                };
                $scope.getCustomer();






            }



        ]);

})();
