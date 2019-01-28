(function() {
    var app;
    app = angular.module('customers', ['jlg_services', 'localytics.directives'])
        .controller('customers-cntrl', ['$scope', 'customer', '$window', '$timeout',
            function($scope, customer, $window, $timeout) {
              $scope.errorMessage = '';
              $scope.selected = {
                  customer: {}
              };
              $scope.editedCustomer = {
                name: '',
                address:'',
                postcode: '',
                phone: '',
                phone2: '',
                contact_name: '',
                email: '',
              };
              $scope.customers = [];
              $scope.getCustomers = function() {
                  customer.allCustomers().then(function(response) {
                      $scope.customers = response.data;

                  })
              };
              $scope.getCustomers();

              $scope.customerSelected = function() {
					$scope.newCustomerEntry = false;
                  $scope.editedCustomer = angular.copy($scope.selected.customer);
              }
              $scope.saving = false;
              $scope.saveCustomer = function() {
                if ($scope.newCustomerEntry)
                {
                  $scope.saveNewCustomer();
                }
                else {
                  $scope.saveEditCustomer();
                }

              };
              $scope.saveNewCustomer = function(){
                var match = false;
                for (var i = 0; i < $scope.customers.length; i++) {
                    if ($scope.newCustomer === $scope.customers[i].Customer) {
                        match = true;
                    }
                }
                if (match) {
                    $scope.errorMessage = "Customer Already Exists";
                } else if ($scope.newCustomer === '') {
                    $scope.errorMessage = "No Customer Entered";
                } else {
                    var _new = {
                      name: $scope.editedCustomer.Customer,
                      address: $scope.editedCustomer.Address,
                      postcode: $scope.editedCustomer.Postcode,
                      phone: $scope.editedCustomer.Phone,
                      phone2: $scope.editedCustomer.Phone2,
                      contact_name: $scope.editedCustomer.Contact,
                      email: $scope.editedCustomer.Email,
                    };
                    $scope.saving = true;
                    customer.addNew(_new).then(function(data) {
                        if (data.status === 200) {
                            $scope.newCustomer = '';
                            $scope.errorMessage = "Customer Created Successfully";
                            $scope.saving = false;
                            $timeout(function() {

                                $window.location.reload();
                            }, 1500);
                        } else {
                            $scope.errorMessage = 'Error trying to save, refresh the page and re-try';
                        }
                    })
                }
              }
              $scope.saveEditCustomer = function(){
                var match = false;
                for (var i = 0; i < $scope.customers.length; i++) {
                    if ($scope.editedCustomer === $scope.customers[i].Customer) {
                        match = true;
                    }
                }
                if (match) {
                    $scope.errorMessage = "Customer Already Exists";
                } else if ($scope.editedCustomer === '') {
                    $scope.errorMessage = "No Customer Entered";
                } else {
                    var _new = {
                        name: $scope.newCustomer
                    };
                    $scope.saving = true;
                    var _toUpdate = {
                        update: {
                            name: $scope.editedCustomer.Customer,
                            address: $scope.editedCustomer.Address,
                            postcode: $scope.editedCustomer.Postcode,
                            phone: $scope.editedCustomer.Phone,
                            phone2: $scope.editedCustomer.Phone2,
                            contact_name: $scope.editedCustomer.Contact,
                            email: $scope.editedCustomer.Email,
                        },
                        id: $scope.editedCustomer.db_id
                    }
                    customer.editCustomer(_toUpdate).then(function(data) {
                      if (data.status === 200)
                      {
                        $scope.editedCustomer = '';
                      $scope.errorMessage = "Customer Edited Successfully";
                        $scope.saving = false;
                        $timeout(function () {

                          $window.location.reload();
                        }, 1500);
                      }
                      else {
                          $scope.errorMessage = 'Error trying to save, refresh the page and re-try';
                      }
                    })
                }
              }
              $scope.newCustomerEntry = false;
              $scope.createOption = function(customer) {
                $scope.newCustomerEntry = true;
                $scope.editedCustomer.Customer = customer;

              }





          }
      ]);
})();
