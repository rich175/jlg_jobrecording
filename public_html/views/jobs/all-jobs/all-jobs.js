(function() {
    var app;
    app = angular.module('all-jobs', ['jlg_services', 'report-generator'])
        .controller('all-jobs-cntrl', ['$scope', 'job', 'jobList', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'jobSheet',
            function($scope, job, jobList, DTOptionsBuilder, DTColumnDefBuilder, jobSheet) {

                $scope.tableUpdating = false;
                $scope.dtOptions = DTOptionsBuilder.newOptions()
                    .withDOM('<"row"><"row"lf><"row"rt><"row"ip>')
                    .withDisplayLength(5)
                    .withOption('order', [1, 'desc'])
                    .withOption('scrollX', '100%')


                $scope.shortJobListLoaded = false;
                $scope.shortJobList = [];

                $scope.getShortJobList = function() {
                    $scope.filteredJobs = [];
                    job.shortList().then(function(data) {

                        for (var i = 0; i < data.length; i++) {
                            var _company = data[i].customer;
                            var _companyMatch = false;
                            var _status = data[i].status;
                            var _statusMatch = false;
                            var _jobNumber = data[i].jobNumber;
                            var _jobNumberMatch = false;


                            var _companyMatch = $scope.isMatched(_company, $scope.options.companies)


                            if (!_companyMatch) {
                                $scope.options.companies.push(_company);
                            }

                            var _statusMatch = $scope.isMatched(_status, $scope.options.status)


                            if (!_statusMatch) {
                                $scope.options.status.push(_status);

                            }

                            var _jobNumberMatch = $scope.isMatched(_jobNumber, $scope.options.number)



                            if (!_jobNumberMatch) {
                                $scope.options.number.push(_jobNumber);
                            }

                        }
                        $scope.shortJobList = data;

                        //start with a search of all statusss
                        $scope.options.statusSelected = angular.copy($scope.options.status);

                        $scope.shortJobListLoaded = true;

                    })
                };


                $scope.filteredJobs = [];
                $scope.getRelevantJobs = function() {


                    var dbIDs = [];
                    for (var i = 0; i < $scope.shortJobList.length; i++) {
                        var _status = $scope.shortJobList[i].status;
                        var _customer = $scope.shortJobList[i].customer;
                        //if either of these variables are part of the selected than that job number needs retiriving

                        var _statusMatch = false;
                        var _customerMatch = false;

                        var _customerMatch = $scope.isMatched(_customer, $scope.options.companiesSelected);


                        var _statusMatch = $scope.isMatched(_status, $scope.options.statusSelected);

                        if ($scope.options.statusSelected.length === 0) {

                            if (_customerMatch) {

                                dbIDs.push($scope.shortJobList[i].db_id);
                            }
                        } else if ($scope.options.companiesSelected.length === 0) {

                            if (_statusMatch) {

                                dbIDs.push($scope.shortJobList[i].db_id);
                            }
                        } else {

                            if (_statusMatch && _customerMatch) {

                                dbIDs.push($scope.shortJobList[i].db_id);
                            }
                        }



                    };

                    if (dbIDs.length > 0) {
                        $scope.tableUpdating = true;
                        job.filteredList(dbIDs).then(function(data) {
                            $scope.filteredJobs = data;
                            $scope.tableUpdating = false;
                        });
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

                $scope.options = {
                    companies: [],
                    status: [],
                    number: [],
                    companiesSelected: [],
                    statusSelected: [],
                    numberSelected: []
                };

                $scope.tableOptions = {};


                $scope.jobSheetLoaded = false;

                $scope.loadJob = function(jobInfo) {

                    $scope.jobSheetLoaded = false;
                    var _number = jobInfo.Job_Number;
                    jobSheet.get(_number).then(function(job) {
                        job = angular.fromJson(job);
                        $scope.totalTimeSpent = moment.duration(0);

                        var _hoursByEngineer = [];

                        for (var i = 0; i < job.length; i++) {

                            // get total seconds between the times
                            var _duration = moment.utc(moment(job[i].stoptime, "DD/MM/YYYY HH:mm:ss").diff(moment(job[i].starttime, "DD/MM/YYYY HH:mm:ss"))).format("HH:mm");
                            job[i].duration = _duration;
                            $scope.totalTimeSpent = $scope.totalTimeSpent.add(_duration);


                            //does engineer exist in array, if not add them
                            var _engExist = false
                            for (var j = 0; j < _hoursByEngineer.length; j++) {
                                if (_hoursByEngineer[j].name === job[i].firstname) {
                                    _engExist = true;
                                }
                            }
                            if (!_engExist) {
                                var _new = {
                                    name: job[i].firstname,
                                    totalMinutes: 0
                                };
                                _hoursByEngineer.push(_new);
                            }


                            //add hours
                            for (var j = 0; j < _hoursByEngineer.length; j++) {
                                if (_hoursByEngineer[j].name === job[i].firstname) {
                                    var _hours = parseInt(_duration.substring(0, 2));
                                    var _minutes = parseInt(_duration.substring(3, 5));

                                    var _tminutes = (_hours * 60) + _minutes;

                                    _hoursByEngineer[j].totalMinutes = _hoursByEngineer[j].totalMinutes + _tminutes;

                                }
                            }




                            //console.log($scope.totalTimeSpent);
                            var _date = moment(job[i].starttime);
                            job[i].americanDate = new Date(moment(job[i].starttime));
                            _date = _date.format('DD/MM/YYYY');

                            job[i].date = _date;

                            job[i].starttime = moment(job[i].starttime);
                            job[i].starttime = job[i].starttime.format('HH:mm:ss');
                            job[i].stoptime = moment(job[i].stoptime);
                            job[i].stoptime = job[i].stoptime.format('HH:mm:ss');

                            job[i].materials.replace(/<br\s*\/?>/ig, "\n");

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
                            timeBreakDown: _hoursByEngineer,
                            work: job
                        };



                        $scope.jobSheetLoaded = true;
                        $scope.getNotes();

                    });
                }

                $scope.tableOptions.dtColumnDefs = [
                    DTColumnDefBuilder.newColumnDef(5).notVisible()
                ]

                $scope.HtmlEncode = function(s) {

                    var el = document.createElement("div");
                    el.innerText = el.textContent = s;
                    s = el.innerHTML;
                    if (typeof s === 'string' || s instanceof String) {
                        s = s.replace(/<br\s*\/?>/ig, "\n")
                    }

                    return s;

                }

                $scope.$watch('options.companiesSelected', function(newValue, oldValue) {
                    if (newValue.length === 0) {

                        $scope.getShortJobList();
                    } else {
                        //company has been changed, need to show only relevant status's
                        $scope.options.status = [];
                        //$scope.options.statusSelected = [];
                        for (i = 0; i < newValue.length; i++) {

                            for (j = 0; j < $scope.shortJobList.length; j++) {
                                if (newValue[i] === $scope.shortJobList[j].customer) {
                                    var _statusMatch = false;
                                    var _status = $scope.shortJobList[j].status;

                                    var _statusMatch = $scope.isMatched(_status, $scope.options.status);

                                    if (!_statusMatch) {
                                        $scope.options.status.push(_status);
                                    }
                                }
                            }
                        };
                        $scope.getRelevantJobs();
                    }

                }, false);

                $scope.$watch('options.statusSelected', function(newValue, oldValue) {
                    if (newValue.length === 0 && oldValue.length === 0) {


                    } else {
                        //status has been changed, need to get relevant jobs
                        $scope.getRelevantJobs();


                    }

                }, false);

                $scope.Notes = {
                    newNote: {
                        text: '',
                        date: new Date().toDateString(),
                        dateEpoch: new Date().getTime(),
                        user: '',
                        job: ''
                    },
                    jobNotes: []
                };

                $scope.saveNote = function() {
                    var _toSave = $scope.Notes.newNote;
                    if ($scope.jobFound) {
                        _toSave.job = $scope.jobFound.description.db_id;

                        _toSave.text = _toSave.text.replace(/\n\r?/g, '<br/>');

                        job.saveNote(_toSave).then(function(data) {
                            console.log('saved new note');
                            $scope.getNotes();
                            $scope.Notes.newNote = {
                                text: '',
                                date: new Date().toDateString(),
                                dateEpoch: new Date().getTime(),
                                user: '',
                                job: ''
                            };
                        });
                    }
                    //save $scope.newNote
                }

                $scope.getNotes = function() {
                    job.getNotes($scope.jobFound.description.db_id).then(function(data) {


                        $scope.Notes.jobNotes = data;
                        console.log(data);
                    });
                }


            }
        ]);
})();
