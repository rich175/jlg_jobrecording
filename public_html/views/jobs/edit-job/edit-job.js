(function() {
    var app;
    app = angular.module('edit-job', ['jlg_services'])
        .controller('edit-job-cntrl', ['$scope', '$window','customer', 'job',
            function($scope, $window, customer, job) {
                $scope.saving = false;
                $scope.selectedJob = {};
                $scope.foundJob = {
                    job: '',
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

                $scope.jobList = [];

                $scope.getCustomers = function() {
                    customer.allCustomers().then(function(response) {
                        $scope.customers = response.data;

                    })
                };

                $scope.getStatusOptions = function() {
                    job.statusOptions().then(function(data) {
                        $scope.statusOptions = data;

                    })
                };

                $scope.getJobList = function() {
                    job.jobList().then(function(data) {
                        $scope.jobList = data;
                    });
                };

                $scope.jobSelected = function(_job) {


                    for (var i = 0; i < $scope.statusOptions.length; i++) {
                        if ($scope.statusOptions[i].Description === _job.Status) {
                            $scope.foundJob.status = $scope.statusOptions[i];
                        }
                    }

                    for (var i = 0; i < $scope.customers.length; i++) {
                        if ($scope.customers[i].Customer === _job.Customer) {
                            $scope.foundJob.customer = $scope.customers[i];
                        }
                    }


                    $scope.foundJob.job_number = _job.Job_Number;
                    $scope.foundJob.db_id = _job.DB_ID;
                    $scope.foundJob.description = _job.Description;
                    $scope.foundJob.tacho = _job.Tacho;
                    $scope.foundJob.site = _job.Site;
                    $scope.foundJob.machine = _job.Machine;
                    $scope.foundJob.serial = _job.ID_Number;
                    $scope.foundJob.mileage = _job.Mileage;
                    $scope.foundJob.orderNumber = _job.OrderNumber;



                }

                $scope.getJobList();
                $scope.getCustomers();
                $scope.getStatusOptions();

                $scope.errorMessage = '';
                $scope.saveChanges = function() {

                    if ($scope.foundJob.customer === '') {
                        $scope.errorMessage = "No Customer Selected!";
                    } else if ($scope.foundJob.description === '') {
                        $scope.errorMessage = "No Description Entered!";
                    } else {
                        $scope.saving = true;

                        var _toUpdate = {
                            update: {
                                machine: $scope.foundJob.machine,
                                tacho: $scope.foundJob.tacho,
                                site: $scope.foundJob.site,
                                description: $scope.foundJob.description,
                                order_number: $scope.foundJob.orderNumber,
                                'mileage_e/w': $scope.foundJob.mileage,
                                customer_idcustomer: $scope.foundJob.customer.db_id,
                                job_status_idjob_status: $scope.foundJob.status.db_id,
                                id_number: $scope.foundJob.serial
                            },
                            id: $scope.foundJob.db_id
                        }



                        job.updateJob(_toUpdate).then(function(data) {
                            $window.location.reload();
                        })
                    }




                };




            }
        ]);
})();
