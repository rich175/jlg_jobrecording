(function() {
    var app;
    app = angular.module('job-search', ['ui.bootstrap', 'report-generator', 'config_module'])
        .controller('job-search-cntrl', ['$uibModal', '$scope', '$state', '$window', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'jobList', 'settings', 'jobSheet', '$q', '$http',
            function($uibModal, $scope, $state, $window, DTOptionsBuilder, DTColumnDefBuilder, jobList, settings, jobSheet, $q, $http) {


                $scope.AdminAccess = function(userRights) {
                    var _adminAccess = false;
                    if (userRights === 1) {
                        _adminAccess = true;
                    }
                    return _adminAccess;
                }
                $scope.jobsInProgress_Loaded = false;
                $scope.jobsInProgress = [];

                $scope.jobsFinished_Loaded = false;
                $scope.jobsFinished = [];

                $scope.jobsInvoiced_Loaded = false;
                $scope.jobsInvoiced = [];

                $scope.jobsQuarrantined_Loaded = false;
                $scope.jobsQuarrantined = [];

                $scope.jobsAll_Loaded = false;
                $scope.jobsAll = [];
                $scope.jobsAllVariables = {
                    includeInvoiced: false
                };

                $scope.jobsAllA_Loaded = false;
                $scope.jobsAllA = [];

                $scope.jobsAllAP_Loaded = false;
                $scope.jobsAllAP = [];

                $scope.jobStatusOptions = [{
                    value: 1,
                    text: 'In Progress'
                }, {
                    value: 2,
                    text: 'Not In Progress'
                }, {
                    value: 3,
                    text: 'Finished'
                }, {
                    value: 4,
                    text: 'Invoiced'
                }];
                $scope.jobStatusOptionsBasic = ['In Progress', 'Not In Progress', 'Finished', 'Invoiced'];


                $scope.dtOptions = DTOptionsBuilder.newOptions()
                    .withDOM('<"row"><"row"Blf><"row"rt><"row"ip>')
                    .withDisplayLength(10)
                    .withOption('order', [1, 'desc'])
                    .withButtons([{
                        text: 'Hide Columns',
                        extend: 'colvis',
                        className: 'btn btn-primary',
                    }])


                $scope.options = {
                    companies: [],
                    companiesSelected: [],
                    companiesInProgress: [],
                    companiesSelectedInProgress: [],
                    companiesFinished: [],
                    companiesSelectedFinished: [],
                    companiesInvoiced: [],
                    companiesSelectedInvoiced: [],
                    companiesAll: [],
                    companiesSelectedAll: [],
                    companiesAllA: [],
                    companiesSelectedAllA: [],
                    companiesAllAP: [],
                    companiesSelectedAllAP: [],

                };

                $scope.resetCompanyFilters = function() {

                    $scope.options.companiesSelected = [];
                    $scope.options.companiesSelectedFinished = [];
                    $scope.options.companiesSelectedInProgress = [];
                    $scope.options.companiesSelectedInvoiced = [];
                    $scope.options.companiesSelectedAll = [];
                    $scope.options.companiesSelectedAllA = [];
                    $scope.options.companiesSelectedAllAP = [];
                }


                //-----------------
                //
                // Open Customer window
                //
                //--------------------
                $scope.openWindow = function(_id) {
                    var url = $state.href('view-customer', {
                        customerID: _id
                    });
                    $window.open(url, '_blank', 'width=350, height=200');
                }

                $scope.openEditJob = function(_id) {
                    var url = $state.href('index.edit-job', {
                        jn: _id
                    });
                    $window.open(url, '_blank');
                };



                $scope.$watch('options.companiesSelected', function(newValue, oldValue) {
                    //  if (newValue.length === 0) {
                    //    $scope.getJobsInQuarrantine();
                    //} else {
                    $scope.getRelevantJobs(2);
                    //}
                }, false);
                $scope.$watch('options.companiesSelectedInProgress', function(newValue, oldValue) {
                    //  if (newValue.length === 0) {
                    //    $scope.getJobsInProgress();
                    //  } else {
                    $scope.getRelevantJobs(1);
                    //}
                }, false);
                $scope.$watch('options.companiesSelectedFinished', function(newValue, oldValue) {
                    //if (newValue.length === 0) {
                    //      $scope.getFinishedJobs();
                    //  } else {
                    $scope.getRelevantJobs(3);
                    //  }
                }, false);
                $scope.$watch('options.companiesSelectedInvoiced', function(newValue, oldValue) {
                    //if (newValue.length === 0) {
                    //    $scope.getInvoicedJobs();
                    //} else {
                    $scope.getRelevantJobs(4);
                    //}
                }, false);
                $scope.$watch('options.companiesSelectedAll', function(newValue, oldValue) {
                    //if (newValue.length === 0) {
                    //    $scope.getAllJobs();
                    //} else {
                    $scope.getRelevantJobs(5);
                    //}
                }, false);
                $scope.$watch('options.companiesSelectedAllA', function(newValue, oldValue) {
                    //if (newValue.length === 0) {
                    //    $scope.getAllJobs();
                    //} else {
                    $scope.getRelevantJobs(6);
                    //}
                }, false);
                $scope.$watch('options.companiesSelectedAllAP', function(newValue, oldValue) {
                    //if (newValue.length === 0) {
                    //    $scope.getAllJobs();
                    //} else {
                    $scope.getRelevantJobs(7);
                    //}
                }, false);


                $scope.exportJobSheet = function(job) {
                    var url = $state.href('index.jobSheet', {
                        jn: job.Job_Number
                    });
                    $window.open(url, '_blank');
                }

                $scope.getRelevantJobs = function(_state) {
                    var jobs = [];
                    if (_state === 2) {
                        if ($scope.jobsQuarrantinedNotFiltered) {
                            if ($scope.options.companiesSelected.length === 0) {
                                jobs = $scope.jobsQuarrantinedNotFiltered;
                            } else {

                                for (var i = 0; i < $scope.jobsQuarrantinedNotFiltered.length; i++) {
                                    var _customer = $scope.jobsQuarrantinedNotFiltered[i].Customer;
                                    var _customerMatch = false;
                                    var _customerMatch = $scope.isMatched(_customer, $scope.options.companiesSelected);
                                    if (_customerMatch) {
                                        jobs.push($scope.jobsQuarrantinedNotFiltered[i]);
                                    }
                                };
                            }
                        }
                        $scope.jobsQuarrantined = jobs;
                    } else if (_state === 1) {
                        if ($scope.options.companiesSelectedInProgress.length === 0) {
                            jobs = $scope.jobsInProgressNotFiltered;
                        } else {
                            if ($scope.jobsInProgressNotFiltered) {
                                for (var i = 0; i < $scope.jobsInProgressNotFiltered.length; i++) {
                                    var _customer = $scope.jobsInProgressNotFiltered[i].Customer;
                                    var _customerMatch = false;
                                    var _customerMatch = $scope.isMatched(_customer, $scope.options.companiesSelectedInProgress);
                                    if (_customerMatch) {
                                        jobs.push($scope.jobsInProgressNotFiltered[i]);
                                    }
                                };
                            }
                        }
                        $scope.jobsInProgress = jobs;
                    } else if (_state === 3) {
                        if ($scope.options.companiesSelectedFinished.length === 0) {
                            jobs = $scope.jobsFinishedNotFiltered;
                        } else {
                            if ($scope.jobsFinishedNotFiltered) {
                                for (var i = 0; i < $scope.jobsFinishedNotFiltered.length; i++) {
                                    var _customer = $scope.jobsFinishedNotFiltered[i].Customer;
                                    var _customerMatch = false;
                                    var _customerMatch = $scope.isMatched(_customer, $scope.options.companiesSelectedFinished);
                                    if (_customerMatch) {
                                        jobs.push($scope.jobsFinishedNotFiltered[i]);
                                    }
                                };
                            }
                        }
                        $scope.jobsFinished = jobs;
                    } else if (_state === 4) {
                        if ($scope.options.companiesSelectedInvoiced.length === 0) {
                            jobs = $scope.jobsInvoicedNotFiltered;
                        } else {
                            if ($scope.jobsInvoicedNotFiltered) {
                                for (var i = 0; i < $scope.jobsInvoicedNotFiltered.length; i++) {
                                    var _customer = $scope.jobsInvoicedNotFiltered[i].Customer;
                                    var _customerMatch = false;
                                    var _customerMatch = $scope.isMatched(_customer, $scope.options.companiesSelectedInvoiced);
                                    if (_customerMatch) {
                                        jobs.push($scope.jobsInvoicedNotFiltered[i]);
                                    }
                                };
                            }
                        }

                        $scope.jobsInvoiced = jobs;

                    } else if (_state === 5) {
                        if ($scope.options.companiesSelectedAll.length === 0) {
                            jobs = $scope.jobsAllNotFiltered;
                        } else {
                            if ($scope.jobsAllNotFiltered) {
                                for (var i = 0; i < $scope.jobsAllNotFiltered.length; i++) {
                                    var _customer = $scope.jobsAllNotFiltered[i].Customer;
                                    var _customerMatch = false;
                                    var _customerMatch = $scope.isMatched(_customer, $scope.options.companiesSelectedAll);
                                    if (_customerMatch) {
                                        jobs.push($scope.jobsAllNotFiltered[i]);
                                    }
                                };
                            }
                        }
                        $scope.jobsAll = jobs;
                    } else if (_state === 6) {
                        if ($scope.options.companiesSelectedAllA.length === 0) {
                            jobs = $scope.jobsAllANotFiltered;
                        } else {
                            if ($scope.jobsAllANotFiltered) {
                                for (var i = 0; i < $scope.jobsAllANotFiltered.length; i++) {
                                    var _customer = $scope.jobsAllANotFiltered[i].Customer;
                                    var _customerMatch = false;
                                    var _customerMatch = $scope.isMatched(_customer, $scope.options.companiesSelectedAllA);
                                    if (_customerMatch) {
                                        jobs.push($scope.jobsAllANotFiltered[i]);
                                    }
                                };
                            }
                        }
                        $scope.jobsAllA = jobs;
                    } else if (_state === 7) {
                        if ($scope.options.companiesSelectedAllAP.length === 0) {
                            jobs = $scope.jobsAllAPNotFiltered;
                        } else {
                            if ($scope.jobsAllAPNotFiltered) {
                                for (var i = 0; i < $scope.jobsAllAPNotFiltered.length; i++) {
                                    var _customer = $scope.jobsAllAPNotFiltered[i].Customer;
                                    var _customerMatch = false;
                                    var _customerMatch = $scope.isMatched(_customer, $scope.options.companiesSelectedAllAP);
                                    if (_customerMatch) {
                                        jobs.push($scope.jobsAllAPNotFiltered[i]);
                                    }
                                };
                            }
                        }
                        $scope.jobsAllAP = jobs;
                    }
                }

                $scope.isMatched = function(variable, array, key) {
                    var _toMatch = variable;
                    var match = false;

                    if (key) {

                        for (var i = 0; i < array.length; i++) {
                            if (array[i][key] === _toMatch) {
                                match = true;
                            }
                        };
                    } else {
                        for (var i = 0; i < array.length; i++) {
                            if (array[i] === _toMatch) {
                                match = true;
                            }
                        };
                    }

                    return match;
                }
                $scope.getJobsInQuarrantine = function() {
                    $scope.resetCompanyFilters();
                    $scope.jobsQuarrantined_Loaded = false;
                    $scope.jobsQuarrantinedNotFiltered = [];

                    jobList.getJobInfo(2).then(function(jobs) {

                        for (var i = 0; i < jobs.length; i++) {
                            var _company = jobs[i].Customer;
                            var _companyMatch = false;
                            var _companyMatch = $scope.isMatched(_company, $scope.options.companies)

                            if (!_companyMatch) {
                                $scope.options.companies.push(_company);
                            }
                        }

                        $scope.jobsQuarrantinedNotFiltered = jobs;
                        $scope.jobsQuarrantined = jobs;
                        $scope.jobsQuarrantined_Loaded = true;
                    })
                };
                $scope.$watch('jobsQuarrantined', function(newValue, oldValue) {
                    if (oldValue === []) {

                    } else if (!oldValue)
                    {
                    }
                    else if (oldValue.length !== newValue.length) {} else {
                        for (var i = 0; i < oldValue.length; i++) {
                            if (oldValue[i].Status != newValue[i].Status) {
                                var _foundIndex = i;
                                console.log(newValue[i].Job_Number + ' has changed status');
                                var _statusID = 1;
                                for (var j = 0; j < $scope.jobStatusOptions.length; j++) {
                                    if ($scope.jobStatusOptions[j].text === newValue[i].Status) {
                                        _statusID = $scope.jobStatusOptions[j].value;
                                    }
                                }
                                var updateObj = {
                                    update: {
                                        job_status_idjob_status: _statusID
                                    },
                                    id: newValue[i].DBID
                                };
                                jobList.editJobStatus(updateObj).then(function(response) {
                                    $scope.jobsQuarrantined.splice(_foundIndex, 1);

                                    //angular.copy(newValue, $scope.jobsInProgress);
                                })
                            }
                        }
                    }
                }, true);


                $scope.getJobsInProgress = function() {
                    $scope.resetCompanyFilters();
                    $scope.jobsInProgress_Loaded = false;
                    $scope.jobsInProgressNotFiltered = [];
                    $scope.jobsInProgress = [];

                    jobList.getJobInfo(1).then(function(jobs) {

                        for (var i = 0; i < jobs.length; i++) {
                            var _company = jobs[i].Customer;
                            var _companyMatch = false;
                            var _companyMatch = $scope.isMatched(_company, $scope.options.companiesInProgress)

                            if (!_companyMatch) {
                                $scope.options.companiesInProgress.push(_company);
                            }
                        }

                        $scope.jobsInProgressNotFiltered = jobs;
                        $scope.jobsInProgress = jobs;

                        $scope.jobsInProgress_Loaded = true;
                    })
                };
                $scope.$watch('jobsInProgress', function(newValue, oldValue) {
                    if (oldValue === []) {

                    } else if (!oldValue)
                    {
                    }else if (oldValue.length !== newValue.length) {} else {
                        for (var i = 0; i < oldValue.length; i++) {
                            if (oldValue[i].Status != newValue[i].Status) {
                                var _foundIndex = i;
                                console.log(newValue[i].Job_Number + ' has changed status');
                                var _statusID = 1;
                                for (var j = 0; j < $scope.jobStatusOptions.length; j++) {
                                    if ($scope.jobStatusOptions[j].text === newValue[i].Status) {
                                        _statusID = $scope.jobStatusOptions[j].value;
                                    }
                                }
                                var updateObj = {
                                    update: {
                                        job_status_idjob_status: _statusID
                                    },
                                    id: newValue[i].DBID
                                };
                                jobList.editJobStatus(updateObj).then(function(response) {
                                    $scope.jobsInProgress.splice(_foundIndex, 1);

                                    //angular.copy(newValue, $scope.jobsInProgress);
                                })
                            }
                        }
                    }
                }, true);


                $scope.getFinishedJobs = function() {
                    $scope.resetCompanyFilters();
                    $scope.jobsFinished_Loaded = false;
                    $scope.jobsFinishedNotFiltered = [];
                    $scope.jobsFinished = [];

                    jobList.getJobInfo(3).then(function(jobs) {

                        for (var i = 0; i < jobs.length; i++) {
                            var _company = jobs[i].Customer;
                            var _companyMatch = false;
                            var _companyMatch = $scope.isMatched(_company, $scope.options.companiesFinished)

                            if (!_companyMatch) {
                                $scope.options.companiesFinished.push(_company);
                            }
                        }

                        $scope.jobsFinishedNotFiltered = jobs;
                        $scope.jobsFinished = jobs;

                        $scope.jobsFinished_Loaded = true;
                    })

                };
                $scope.$watch('jobsFinished', function(newValue, oldValue) {
                    if (oldValue === []) {

                    } else if (!oldValue)
                    {
                    }else if (oldValue.length !== newValue.length) {} else {
                        for (var i = 0; i < oldValue.length; i++) {
                            if (oldValue[i].Status != newValue[i].Status) {
                                var _foundIndex = i;
                                console.log(newValue[i].Job_Number + ' has changed status');
                                var _statusID = 1;
                                for (var j = 0; j < $scope.jobStatusOptions.length; j++) {
                                    if ($scope.jobStatusOptions[j].text === newValue[i].Status) {
                                        _statusID = $scope.jobStatusOptions[j].value;
                                    }
                                }
                                var updateObj = {
                                    update: {
                                        job_status_idjob_status: _statusID
                                    },
                                    id: newValue[i].DBID
                                };
                                jobList.editJobStatus(updateObj).then(function(response) {
                                    $scope.jobsFinished.splice(_foundIndex, 1);

                                    //angular.copy(newValue, $scope.jobsInProgress);
                                })
                            }
                        }
                    }
                }, true);

                $scope.getInvoicedJobs = function() {
                    $scope.resetCompanyFilters();
                    $scope.jobsInvoiced_Loaded = false;
                    $scope.jobsInvoicedNotFiltered = [];
                    $scope.jobsInvoiced = [];

                    jobList.getJobInfo(4).then(function(jobs) {
                        for (var i = 0; i < jobs.length; i++) {
                            var _company = jobs[i].Customer;
                            var _companyMatch = false;
                            var _companyMatch = $scope.isMatched(_company, $scope.options.companiesInvoiced)

                            if (!_companyMatch) {
                                $scope.options.companiesInvoiced.push(_company);
                            }
                        }
                        $scope.jobsInvoicedNotFiltered = jobs;
                        $scope.jobsInvoiced = jobs;

                        $scope.jobsInvoiced_Loaded = true;
                    })

                };
                $scope.$watch('jobsInvoiced', function(newValue, oldValue) {
                    if (oldValue === []) {

                    } else if (!oldValue)
                    {
                    }else if (oldValue.length !== newValue.length) {} else {
                        for (var i = 0; i < oldValue.length; i++) {
                            if (oldValue[i].Status != newValue[i].Status) {
                                var _foundIndex = i;
                                console.log(newValue[i].Job_Number + ' has changed status');
                                var _statusID = 1;
                                for (var j = 0; j < $scope.jobStatusOptions.length; j++) {
                                    if ($scope.jobStatusOptions[j].text === newValue[i].Status) {
                                        _statusID = $scope.jobStatusOptions[j].value;
                                    }
                                }
                                var updateObj = {
                                    update: {
                                        job_status_idjob_status: _statusID
                                    },
                                    id: newValue[i].DBID
                                };
                                jobList.editJobStatus(updateObj).then(function(response) {
                                    $scope.jobsInvoiced.splice(_foundIndex, 1);

                                    //angular.copy(newValue, $scope.jobsInProgress);
                                })
                            }
                        }
                    }
                }, true);

                $scope.getAllJobs = function() {
                    $scope.resetCompanyFilters();
                    $scope.jobsAll_Loaded = false;
                    $scope.jobsAllNotFiltered = [];
                    $scope.jobsAll = [];

                    //should the search included invoiced jobs?
                    var state = 6;
                    if ($scope.jobsAllVariables.includeInvoiced) {
                        state = 5;
                    }
                    jobList.getJobInfo(state).then(function(jobs) {
                        for (var i = 0; i < jobs.length; i++) {
                            var _company = jobs[i].Customer;
                            var _companyMatch = false;
                            var _companyMatch = $scope.isMatched(_company, $scope.options.companiesAll)

                            if (!_companyMatch) {
                                $scope.options.companiesAll.push(_company);
                            }
                        }
                        $scope.jobsAllNotFiltered = jobs;
                        $scope.jobsAll = jobs;

                        $scope.jobsAll_Loaded = true;
                    })

                };

                $scope.$watch('jobsAll', function(newValue, oldValue) {
                    if (oldValue === []) {

                    } else if (!oldValue)
                    {
                    }else if (oldValue.length !== newValue.length) {} else {
                        for (var i = 0; i < oldValue.length; i++) {
                            if (oldValue[i].Status != newValue[i].Status) {
                                var _foundIndex = i;
                                console.log(newValue[i].Job_Number + ' has changed status');
                                var _statusID = 1;
                                for (var j = 0; j < $scope.jobStatusOptions.length; j++) {
                                    if ($scope.jobStatusOptions[j].text === newValue[i].Status) {
                                        _statusID = $scope.jobStatusOptions[j].value;
                                    }
                                }
                                var updateObj = {
                                    update: {
                                        job_status_idjob_status: _statusID
                                    },
                                    id: newValue[i].DBID
                                };
                                jobList.editJobStatus(updateObj).then(function(response) {


                                })
                            }
                        }
                    }
                }, true);

                $scope.getINPAvailable = function() {
                    var deferred = $q.defer();

                    var serviceLoaction = settings.baseUrl + "general/jobs/1";
                    $http.get(serviceLoaction).then(function(response) {
                        deferred.resolve(response.data);
                    }, function(error) {
                        console.log(error);
                        deferred.reject();
                    });

                    return deferred.promise;
                };
                $scope.getPAvailable = function() {
                    var deferred = $q.defer();

                    var serviceLoaction = settings.baseUrl + "general/jobs/2";
                    $http.get(serviceLoaction).then(function(response) {
                        deferred.resolve(response.data);
                    }, function(error) {
                        console.log(error);
                        deferred.reject();
                    });

                    return deferred.promise;



                };

                $scope.raisePriority = function(_job) {
                    var _data = {
                        update: {
                            priority: 1
                        },
                        id: _job.DBID
                    };
                    var serviceLoaction = settings.baseUrl + "general/jobs";
                    $http.put(serviceLoaction, _data).then(function(response) {
                        for (let i = 0; i < $scope.jobsAllANotFiltered.length; i++) {
                            if (_data.id === $scope.jobsAllANotFiltered[i].DBID) {
                                $scope.jobsAllANotFiltered.splice(i)
                            }
                        }
                        for (let i = 0; i < $scope.jobsAllA.length; i++) {
                            if (_data.id === $scope.jobsAllA[i].DBID) {
                                $scope.jobsAllA.splice(i)
                            }
                        }

                    }, function(error) {
                        console.log(error);
                        deferred.reject();
                    });
                }

                $scope.getAllAvailableJobs = function() {
                    $scope.resetCompanyFilters();
                    $scope.jobsAllA_Loaded = false;
                    $scope.jobsAllANotFiltered = [];
                    $scope.jobsAllA = [];
                    var _theseJobs = [];
                    var serviceLoaction = settings.baseUrl + "general/jobs/7";
                    $http.get(serviceLoaction).then(function(response) {
                        _theseJobs = response.data;

                        for (var i = 0; i < _theseJobs.length; i++) {
                            var _company = _theseJobs[i].Customer;
                            var _companyMatch = false;
                            var _companyMatch = $scope.isMatched(_company, $scope.options.companiesAllA)

                            if (!_companyMatch) {
                                $scope.options.companiesAllA.push(_company);
                            }
                        }
                        $scope.jobsAllANotFiltered = _theseJobs;
                        $scope.jobsAllA = _theseJobs;

                        $scope.jobsAllA_Loaded = true;
                    }, function(error) {
                        console.log(error);
                        deferred.reject();
                    });
                };


                $scope.removePriority = function(_job) {
                    var _data = {
                        update: {
                            priority: 0
                        },
                        id: _job.DBID
                    };
                    var serviceLoaction = settings.baseUrl + "general/jobs";
                    $http.put(serviceLoaction, _data).then(function(response) {
                        for (let i = 0; i < $scope.jobsAllAPNotFiltered.length; i++) {
                            if (_data.id === $scope.jobsAllAPNotFiltered[i].DBID) {
                                $scope.jobsAllAPNotFiltered.splice(i)
                            }
                        }
                        for (let i = 0; i < $scope.jobsAllAP.length; i++) {
                            if (_data.id === $scope.jobsAllAP[i].DBID) {
                                $scope.jobsAllAP.splice(i)
                            }
                        }

                    }, function(error) {
                        console.log(error);
                        deferred.reject();
                    });
                }

                $scope.getAllAvailablePJobs = function() {
                    $scope.resetCompanyFilters();
                    $scope.jobsAllAP_Loaded = false;
                    $scope.jobsAllAPNotFiltered = [];
                    $scope.jobsAllAP = [];
                    var _theseJobs = [];
                    var serviceLoaction = settings.baseUrl + "general/jobs/8";
                    $http.get(serviceLoaction).then(function(response) {
                        _theseJobs = response.data;

                        for (var i = 0; i < _theseJobs.length; i++) {
                            var _company = _theseJobs[i].Customer;
                            var _companyMatch = false;
                            var _companyMatch = $scope.isMatched(_company, $scope.options.companiesAllAP)

                            if (!_companyMatch) {
                                $scope.options.companiesAllAP.push(_company);
                            }
                        }
                        $scope.jobsAllAPNotFiltered = _theseJobs;
                        $scope.jobsAllAP = _theseJobs;

                        $scope.jobsAllAP_Loaded = true;
                    }, function(error) {
                        console.log(error);
                        deferred.reject();
                    });
                };


                $scope.viewJobSummary = function(jobInfo) {


                    var modalInstance = $uibModal.open({
                        templateUrl: '/views/reports/jobs/job-search-modal.html',
                        resolve: {
                            jobInfo: function() {
                                return jobInfo;
                            },
                            DTOptionsBuilder: function() {
                                return DTOptionsBuilder;
                            }
                        },
                        controller: ModalInstanceCtrl,
                        size: 'lg'
                    });
                    modalInstance.result.then(function() {



                        console.log('here');

                    })
                };

                function ModalInstanceCtrl($scope, $uibModalInstance, jobInfo, DTOptionsBuilder) {


                    $scope.HtmlEncode = function(s) {

                        var el = document.createElement("div");
                        el.innerText = el.textContent = s;
                        s = el.innerHTML;
                        if (typeof s === 'string' || s instanceof String) {
                            s = s.replace(/<br\s*\/?>/ig, "\n")
                        }

                        return s;

                    }

                    var _number = jobInfo.Job_Number;
                    jobSheet.get(_number).then(function(job) {
                        job = angular.fromJson(job);
                        $scope.totalTimeSpent = moment.duration(0);
                        for (var i = 0; i < job.length; i++) {
                            // get total seconds between the times
                            var _duration = moment.utc(moment(job[i].stoptime, "DD/MM/YYYY HH:mm:ss").diff(moment(job[i].starttime, "DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss");
                            job[i].duration = _duration;

                            $scope.totalTimeSpent = $scope.totalTimeSpent.add(_duration);
                            //console.log($scope.totalTimeSpent);
                            var _date = moment(job[i].starttime);
                            _date = _date.format('DD/MM/YYYY');
                            job[i].date = _date;
                            job[i].date2 = new Date(job[i].starttime);

                            job[i].starttime = moment(job[i].starttime);
                            job[i].starttime = job[i].starttime.format('HH:mm:ss');
                            job[i].stoptime = moment(job[i].stoptime);
                            job[i].stoptime = job[i].stoptime.format('HH:mm:ss');

                            //job[i].materials.replace( /<br\s*\/?>/ig, "\n" );
                            //job[i].materials.replace( /<br\s*\/?>/ig, "\n" );
                            //job[i].materials.replace( /[$,]/g, '' ) :

                        }
                        var _days = moment.duration($scope.totalTimeSpent).days();
                        var _hours = moment.duration($scope.totalTimeSpent).hours();
                        var _minutes = moment.duration($scope.totalTimeSpent).minutes();

                        var _totalHours = _hours + _days * 24

                        var totalDurationString = _totalHours.toString() + "h " + _minutes.toString() + "m";

                        console.log("total time= " + _totalHours.toString() + ":" + _minutes.toString());

                        $scope.selectedJob = job;
                        /*  $scope.HtmlEncode = function(s) {
                              var el = document.createElement("div");
                              el.innerText = el.textContent = s;
                              s = el.innerHTML;
                              return s;
                          }*/

                        $scope.jobFound = {
                            description: {
                                number: jobInfo.Job_Number,
                                description: jobInfo.Description,
                                customer: jobInfo.Customer,
                                status: jobInfo.Status
                            },
                            totalTime: totalDurationString,
                            work: job
                        };

                        $scope.jobLoaded = true;
                        $scope.dtColumnDefs = [
                            DTColumnDefBuilder.newColumnDef([0]).withOption('type', 'date')
                        ];
                        $scope.dtOptions = DTOptionsBuilder.newOptions()
                            .withDOM('<"row"BCr><"row"f><"row"rt><"row"ip>')
                            .withDisplayLength(5)
                            .withOption('order', [0, 'desc'])

                            .withButtons([{
                                    extend: 'excel',
                                    className: 'btn ',
                                    exportOptions: {
                                        columns: ':visible'
                                    },

                                    filename: $scope.jobFound.description.number + ' J Sheet (min)',
                                    customize: function(xlsx) {
                                        console.log(xlsx);
                                        var sheet = xlsx.xl.worksheets['sheet1.xml'];
                                        var downrows = 5;
                                        var clRow = $('row', sheet);
                                        //update Row
                                        clRow.each(function() {
                                            var attr = $(this).attr('r');
                                            var ind = parseInt(attr);
                                            ind = ind + downrows;
                                            $(this).attr("r", ind);
                                        });

                                        // Update  row > c
                                        $('row c ', sheet).each(function() {
                                            var attr = $(this).attr('r');
                                            var pre = attr.substring(0, 1);
                                            var ind = parseInt(attr.substring(1, attr.length));
                                            ind = ind + downrows;
                                            $(this).attr("r", pre + ind);
                                        });

                                        function Addrow(index, data) {
                                            msg = '<row r="' + index + '">'
                                            for (i = 0; i < data.length; i++) {
                                                var key = data[i].k;
                                                var value = data[i].v;
                                                msg += '<c t="inlineStr" r="' + key + index + '" s="5">';
                                                msg += '<is>';
                                                msg += '<t>' + value + '</t>';
                                                msg += '</is>';
                                                msg += '</c>';
                                            }
                                            msg += '</row>';
                                            return msg;
                                        }
                                        var myNewRows = [];
                                        var headers = [{
                                            name: 'Job Number',
                                            value: $scope.HtmlEncode($scope.jobFound.description.number)
                                        }, {
                                            name: 'Customer',
                                            value: $scope.HtmlEncode($scope.jobFound.description.customer)
                                        }, ]

                                        var _RowsToAdd = '';
                                        for (var j = 0; j < headers.length; j++) {
                                            var _newRow = Addrow((j + 1), [{
                                                k: 'A',
                                                v: headers[j].name
                                            }, {
                                                k: 'B',
                                                v: headers[j].value
                                            }]);
                                            _RowsToAdd = _RowsToAdd + _newRow
                                        }
                                        sheet.childNodes[0].childNodes[1].innerHTML = _RowsToAdd + sheet.childNodes[0].childNodes[1].innerHTML;

                                    }
                                }, {
                                    extend: 'pdf',
                                    className: 'btn ',
                                    filename: $scope.jobFound.description.number + ' J Sheet (min)',
                                    orientation: 'landscape',
                                    exportOptions: {
                                        columns: ':visible'
                                    }

                                },
                            ]);
                    });

                    $scope.ok = function() {
                        $uibModalInstance.close();
                    }
                };
            }
        ])
})();
