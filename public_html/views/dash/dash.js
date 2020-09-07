(function() {
    var app;
    app = angular.module('dash', ['report-generator'])
        .controller('dash-cntrl', ['$scope', 'settings', 'processReport', 'DTOptionsBuilder', '$q', '$http',
            function($scope, settings, processReport, DTOptionsBuilder, $q, $http) {

                /*returns if user has admin access to page*/
                $scope.AdminAccess = function(userRights) {

                    //Options are:
                    // user_admin - 2
                    // user_ - 1

                    var _adminAccess = "user";
                    if (userRights === 2) {
                        _adminAccess = "user_admin";
                    }

                    return _adminAccess;
                }



                $scope.dateString = "2018-01-01";
                $scope.dateString2 = "2018-02-01";

                var d = new Date();
                var today = d.getDate();
                var monthIndex = d.getMonth();
                var year = d.getFullYear();
                var prevMonthIndex = monthIndex - 1;
                var prevYear = year;
                if (monthIndex == 0) {
                    prevMonthIndex = 11;
                    prevYear = year - 1;
                }
                $scope.dateString = '' + prevYear + '-' + (prevMonthIndex + 1) + '-' + today;
                $scope.dateString2 = '' + year + '-' + (monthIndex + 1) + '-' + today;

                $scope.users = {
                    users: [],
                    loaded: false,
                    message: ''
                }

                $scope.getActiveUsers = function() {
                    var deferred = $q.defer();

                    $scope.users.message = "Retrieving Engineers";

                    var serviceLocation = settings.baseUrl + "users/users/1";

                    $http.get(serviceLocation).then(function(response) {
                        if (response.status === 200) {

                            $scope.users.message = "Engineers' information retrieved";
                            //sort orders by status
                            $scope.users.users = response.data;

                            $scope.users.loaded = true;
                            deferred.resolve(response.data);

                        } else {
                            deferred.reject('oh no an error! try again');
                        }
                    });

                    return deferred.promise;
                };


                $scope.loadWorkSummary = function(users) {
                    var promise = [];
                    for (var i = 0; i < $scope.users.users.length; i++) {
                        $scope.users.users[i].work = [];
                    }
                    for (var i = 0; i < users.length; i++) {
                        promise.push($scope.getWork(users[i].id));
                    }

                    $q.all(promise).then(function(workDone) {
                        console.log('Chain finished!');
                        for (var i = 0; i < $scope.users.users.length; i++) {
                            for (var j = 0; j < workDone.length; j++) {
                                if (workDone[j][0] === $scope.users.users[i].id) {
                                    $scope.users.users[i].work = workDone[j][1];
                                }
                            }
                        }
                        $scope.summaryLineChart($scope.users.users);
                    })

                };


                $scope.work = {
                    users: [],
                    loaded: false,
                    message: ''
                }

                $scope.getWork = function(_userID) {
                    var deferred = $q.defer();

                    var startTime = $scope.dateString;
                    var endTime = $scope.dateString2;

                    $scope.work.message = "";

                    var serviceLocation = settings.baseUrl + "reports/workSummary/" + _userID + "/" + startTime + "/" + endTime;

                    $http.get(serviceLocation).then(function(response) {
                        if (response.status === 200) {

                            let groupByDate = [];
                            for (let i = 0; i < response.data.length; i++) {
                                const workInstance = response.data[i];
                                let match = false;
                                for (let j = 0; j < groupByDate.length; j++) {
                                    if (workInstance.date === groupByDate.date) {
                                        match = true;
                                        groupByDate.entries.push(workInstance);
                                    }
                                }
                                if (!match) {
                                    groupByDate.push({
                                        date: workInstance.date,
                                        entries: [workInstance]
                                    })
                                }
                            }


                            console.log(groupByDate);

                            if (response.data.length > 0) {

                                deferred.resolve([response.data[0].userID, groupByDate])
                            }
                            deferred.resolve([undefined, []])




                        } else {
                            deferred.reject('oh no an error! try again');
                        }
                    });

                    return deferred.promise;
                }



                ////////
                //
                // PLOT GRAPH
                //
                ///////
                $scope.summaryLineChart = function(data) {

                    $scope.summarySeries = [];

                    $scope.summaryMonthOptions = {
                        scales: {
                            xAxes: [{
                                reverse: true,
                                stacked: true,
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Date'
                                }
                            }],
                            yAxes: [{
                              stacked: true,
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Hours'
                                }
                            }]
                        },
                        legend: {
                            display: false,
                            labels: {
                                fontColor: 'rgb(255, 99, 132)'
                            },
                            position: 'right'
                        },
                        title: {
                            display: true,
                            text: 'Time Spent'
                        }
                    };

                    //Create Date Range labels
                    $scope.summaryLabels = [];
                    var date1 = new Date($scope.dateString2);
                    var date2 = new Date($scope.dateString);
                    var day;


                    $scope.colors = ['#e3bf54', '#FF0000', '#87CEFA'];
                    $scope.colourArray = [];
                    while (date2 <= date1) {
                        day = date1.getDate()
                        date1 = new Date(date1.setDate(--day));

                        var day2 = date1.getDate();
                        var monthIndex = date1.getMonth();
                        var year = date1.getFullYear();
                        var _formattedDate = '' + year + '-' + (monthIndex + 1) + '-' + day2
                        $scope.summaryLabels.push(_formattedDate);
                        //$scope.colourArray.push('#e3bf54');
                    }

                    //create empty series
                    for (var i = 0; i < data.length; i++) {
                        var _newSeries = {
                            name: data[i].firstName,
                            data: [
                                [],
                                [],
                                []
                            ]
                        };
                        $scope.summarySeries.push(_newSeries);
                    }

                    //for each date see if there is an entry, if not add a 0;
                    for (var i = 0; i < $scope.summaryLabels.length; i++) {
                        var _dateBeingSearched = '' + $scope.summaryLabels[i];
                        //for each user selected
                        for (var j = 0; j < data.length; j++) {
                            //for each work entry from user selected
                            var _timeNormal = 0;
                            var _timeSick = 0;
                            var _timeHoliday = 0;
                            for (var k = 0; k < data[j].work.length; k++) {
                                //console.log(j + '--' + k);
                                var _dateOfEntry = data[j].work[k].date;
                                if ($scope.summaryLabels[i] === _dateOfEntry) {
                                    data[j].work[k].entries.forEach((jobWork, i) => {
                                        if ('' + jobWork.jlg_jobnumber === '999') {
                                            var ts_hrs = (jobWork.duration / 60);
                                            _timeSick += parseFloat(ts_hrs.toFixed(1));
                                        } else if ('' + jobWork.jlg_jobnumber === '888') {
                                            var th_hrs = (jobWork.duration / 60);
                                            _timeHoliday += parseFloat(th_hrs.toFixed(1));
                                        } else {
                                            var tn_hrs = (jobWork.duration / 60);
                                            _timeNormal += parseFloat(tn_hrs.toFixed(1));
                                        }
                                    });

                                }
                            }
                            $scope.summarySeries[j].data[0].push(_timeNormal);
                            $scope.summarySeries[j].data[1].push(_timeSick);
                            $scope.summarySeries[j].data[2].push(_timeHoliday);
                        }
                    }

                    for (var i = 0; i < $scope.summarySeries.length; i++) {
                        $scope.summarySeries[i].data[0].reverse();
                        $scope.summarySeries[i].data[1].reverse();
                        $scope.summarySeries[i].data[2].reverse();
                    }
                    $scope.summaryLabels.reverse();

                    $scope.work.loaded = true;
                    $scope.generalStats();


                }


                $scope.generalStats = function() {
                    for (var i = 0; i < $scope.users.users.length; i++) {
                        const user = $scope.users.users[i];
                        var _total = 0;
                        var _gTotal = 0;
                        for (var j = 0; j < user.work.length; j++) {
                            for (var k = 0; k < user.work[j].entries.length; k++) {
                                const dayOfWork = user.work[j].entries[k];
                                if ('' + dayOfWork.jlg_jobnumber !== '999' && '' + dayOfWork.jlg_jobnumber !== '888') {
                                    _total += dayOfWork.duration;
                                      _gTotal += dayOfWork.duration;
                                } else if ('' + dayOfWork.jlg_jobnumber === '999' || '' + dayOfWork.jlg_jobnumber === '888') {
                                    _gTotal += dayOfWork.duration;
                                }
                            }

                        }

                        $scope.users.users[i].totalWork = (_total / 60).toFixed(1);
                        $scope.users.users[i].grandTotalWork = (_gTotal / 60).toFixed(1);
                    }

                }

                function matchExist(_list, variable) {
                    _match = false;
                    for (var i = 0; i < _list.length; i++) {
                        if (_list[i] === variable) {
                            _match = true;
                        }
                    }
                    return _match;
                };

                $scope.changeDate = function() {
                    $scope.work.loaded = false;
                    $scope.getActiveUsers()
                        .then($scope.loadWorkSummary)
                        .catch(function(error) {
                            console.log(error)
                            // Here you may handle the error or reject it again.
                            return 'An error occurred';
                            //Now other errorFn in the promise chain won't be called,
                            // but the successFn calls will.
                        });
                }
                $scope.changeDate();





            }
        ]);
})();
