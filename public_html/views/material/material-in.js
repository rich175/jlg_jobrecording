(function() {
    var app;
    app = angular.module('material-in', ['jlg_services', 'report-generator'])
        .controller('material-in-cntrl', ['$scope', 'addWork', 'job', 'jobList', 'jobSheet', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'addWork',
            function($scope, addWork, job, jobList, jobSheet, DTOptionsBuilder, DTColumnDefBuilder, addWork) {
                $scope.AdminAccess = function(userRights) {
                    var _adminAccess = false;
                    if (userRights === 1) {
                        _adminAccess = true;
                    }
                    return _adminAccess;
                }
                $scope.saveToJob = function() {
                    $scope.thisWork.materialUsed = $scope.materialToAdd.string.replace(/\n\r?/g, '<br/>');

                    var _toDB = {
                        db_jobid: $scope.thisWork.job,
                        start: $scope.thisWork.start,
                        end: $scope.thisWork.end,
                        comments: $scope.thisWork.description,
                        materials: $scope.thisWork.materialUsed,
                    };

                    addWork.addNewWork(_toDB).then(function(response) {
                        console.log(response);
                        $scope.selectJob($scope.thisJob);
                    });
                }
                $scope.dtOptions = DTOptionsBuilder.newOptions()
                    .withDOM('<"row"><"row"lf><"row"rt><"row"ip>')
                    .withDisplayLength(5)
                    .withOption('order', [1, 'desc'])
                    
                $scope.dtOptions2 = DTOptionsBuilder.newOptions()
                    .withDOM('<"row"><"row"><"row"rt><"row"p>')
                    .withOption('order', [0, 'desc'])
                    .withOption('scrollX', '100%')
                /////////////-----------------Adding Materials to Job


                var year = new Date().getFullYear();
                var month = new Date().getMonth();
                var day = new Date().getDate();
                $scope.dateTime = new Date(year, month, day, 0, 0, 0, 0);

                $scope.thisWork = {
                    job: '',
                    start: $scope.dateTime.toISOString().slice(0, 19).replace('T', ' '),
                    end: $scope.dateTime.toISOString().slice(0, 19).replace('T', ' '),
                    description: 'MATERIAL ADDED',
                    materialUsed: '',
                };

                //////////////---------------MATERIALS SECTION
                $scope.material = {
                    id: 1,
                    description: '',
                    cost: 0.00
                }
                $scope.materialToAdd = {
                    jobNumber: '',
                    material: [],
                    string: '',
                }

                $scope.addMaterial = function() {
                    if ($scope.material.description === '') {

                    } else {
                        $scope.materialToAdd.material.push($scope.material);
                        var _id = $scope.materialToAdd.material[$scope.materialToAdd.material.length - 1].id + 1;
                        $scope.material = {
                            id: _id,
                            description: '',
                            cost: 0.00
                        }
                        $scope.makeMaterialString();
                    }
                };
                $scope.removeMaterial = function(mat) {
                    var _materials = [];
                    for (var i = 0; i < $scope.materialToAdd.material.length; i++) {
                        if ($scope.materialToAdd.material[i].id === mat.id) {

                        } else {
                            _materials.push($scope.materialToAdd.material[i]);
                        }
                    }
                    $scope.materialToAdd.material = [];
                    $scope.materialToAdd.material = _materials;
                    $scope.makeMaterialString();
                }

                $scope.removeAddedMaterial = function(work) {
                    addWork.deleteWork(work.idwork_instance).then(function(response) {
                        $scope.selectJob($scope.thisJob);
                    })
                }

                $scope.makeMaterialString = function() {
                    var _matString = '';
                    for (var i = 0; i < $scope.materialToAdd.material.length; i++) {
                        _matString = _matString + "- " + $scope.materialToAdd.material[i].description + " Total: £" + $scope.materialToAdd.material[i].cost + ", " + "\n";
                    }
                    $scope.materialToAdd.string = _matString;
                }
                //////////////---------------JOB SECTION
                $scope.jobSelected = false;

                $scope.jobsInProgress_Loaded = false;
                $scope.jobsInProgress = [];

                $scope.jobSelectedForMaterial = [];


                $scope.reset = function() {
                    $scope.jobSelected = false;
                    $scope.jobSheetLoaded = false;
                    $scope.jobFound = {};
                }

                $scope.getJobsInProgress = function() {
                    $scope.jobsInProgress_Loaded = false;
                    $scope.jobsInProgress = [];

                    jobList.getJobInfo(1).then(function(jobs) {

                        $scope.jobsInProgress = jobs;

                        $scope.jobsInProgress_Loaded = true;
                    })
                };
                $scope.getJobsInProgress();

                $scope.selectJob = function(jobInfo) {
                    $scope.thisJob = jobInfo;
                    $scope.jobSelected = true;
                    $scope.jobSheetLoaded = false;
                    $scope.thisWork.job = jobInfo.DBID;
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

                            job[i].starttime = moment(job[i].starttime);
                            job[i].starttime = job[i].starttime.format('HH:mm:ss');
                            job[i].stoptime = moment(job[i].stoptime);
                            job[i].stoptime = job[i].stoptime.format('HH:mm:ss');

                        }
                        var _days = moment.duration($scope.totalTimeSpent).days();
                        var _hours = moment.duration($scope.totalTimeSpent).hours();
                        var _minutes = moment.duration($scope.totalTimeSpent).minutes();

                        var _totalHours = _hours + _days * 24

                        var totalDurationString = _totalHours.toString() + "h " + _minutes.toString() + "m";

                        console.log("total time= " + _totalHours.toString() + ":" + _minutes.toString());

                        $scope.selectedJob = job;

                        $scope.jobFound = {
                            description: {
                                number: jobInfo.Job_Number,
                                db_id: jobInfo.DBID,
                                customer: jobInfo.Customer,
                                description: jobInfo.Description,
                                machine: jobInfo.Machine,
                                site: jobInfo.Site,
                                tacho: jobInfo.Tacho,
                                order_number: jobInfo.OrderNumber,
                                id_number: jobInfo.ID_Number,
                                mileage: jobInfo.Mileage

                            },
                            totalTime: totalDurationString,
                            work: job
                        };


                        $scope.jobSheetLoaded = true;


                    });
                }

            }
        ]);
})();
