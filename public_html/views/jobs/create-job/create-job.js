(function() {
    var app;
    app = angular.module('create-job', ['jlg_services'])
        .controller('create-job-cntrl', ['$scope', 'customer', 'job', '$window', '$timeout',
            function($scope, customer, job, $window, $timeout) {

                $scope.saving = false;

                $scope.newJob = {
                    job_number: '..generating..',
                    customer: '',
                    description: '',
                    tacho: '',
                    site: '',
                    machine: '',
                    serial: '',
                    mileage: '',
                    status: '',
                    orderNumber: ''
                };
                $scope.customers = [];
                $scope.statusOptions = [];

                $scope.getCustomers = function() {
                    customer.allCustomers().then(function(response) {
                        $scope.customers = response.data;

                    })
                };

                $scope.getStatusOptions = function() {
                    job.statusOptions().then(function(data) {
                        $scope.statusOptions = data;
                        $scope.newJob.status = data[0];
                    })
                };

                $scope.generateNewJobNo = function() {
                    job.jobList().then(function(data) {
                        var _latestJob = 0;
                        for (var i = 0; i < data.length; i++) {
                            var _thisNo = parseInt(data[i].Job_Number);
                            if (_thisNo > _latestJob) {
                                _latestJob = _thisNo;
                            }
                        }
                        $scope.newJob.job_number = _latestJob + 1;

                    })

                };

                $scope.getCustomers();
                $scope.getStatusOptions();
                $scope.generateNewJobNo();
                $scope.errorMessage = '';
                $scope.saveNewJob = function() {

                    if ($scope.newJob.customer === '') {
                        $scope.errorMessage = "No Customer Selected!";
                    } else if ($scope.newJob.description === '') {
                        $scope.errorMessage = "No Description Entered!";
                    } else {
                        $scope.saving = true;

                        var _toSave = {
                            job_number: $scope.newJob.job_number,
                            customer: $scope.newJob.customer.Customer,
                            customerDB: $scope.newJob.customer.db_id,
                            description: $scope.newJob.description,
                            tacho: $scope.newJob.tacho,
                            site: $scope.newJob.site,
                            machine: $scope.newJob.machine,
                            serial: $scope.newJob.serial,
                            mileage: $scope.newJob.mileage,
                            status: $scope.newJob.status.Description,
                            statusDB: $scope.newJob.status.db_id,
                            orderNumber: $scope.newJob.orderNumber
                        };

                        job.newJob(_toSave).then(function(data) {
                          if (data.status === 200)
                          {
                            $scope.saving = false;
                          $scope.errorMessage = "New Job Created Successfully";
                            //console.log(data);
                            $timeout(function () {

                              $window.location.reload();
                            }, 1500);

                          }
                          else {
                              $scope.errorMessage = 'Error trying to save, refresh the page and re-try';
                          }

                        })
                    }




                };




            }
        ]);
})();
