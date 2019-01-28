(function() {
    var app;
    app = angular.module('job-sheet', ['jlg_services', 'report-generator'])
        .controller('job-sheet-cntrl', ['$scope', '$filter', '$stateParams', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'job', 'settings', 'jobSheet', '$timeout',
            function($scope, $filter, $stateParams, DTOptionsBuilder, DTColumnDefBuilder, job, settings, jobSheet, $timeout) {

                

                $scope.AdminAccess = function(userRights) {
                    var _adminAccess = false;
                    if (userRights === 1) {
                        _adminAccess = true;
                    }
                    return _adminAccess;
                }

                var jn = $stateParams.jn;
                //---------------------------------------------
                //
                //LOADING OF job
                //
                //---------------------------------------------
                $scope.jobDetailsLoaded = false;
                $scope.fullJobLoaded = false;
                var _hoursByEngineer = [];
                $scope.job = {
                    details: [],
                    work: [],
                    material: [],
                    materialEntryV1: false,
                    timeBreakDown: _hoursByEngineer,
                    totalTimeMinutes: 0,
                };
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
                $scope.getJobDetails = function() {
                    $scope.fullJobLoaded = false;
                    $scope.jobDetailsLoaded = false;
                    job.singleJob(jn).then(function(data) {

                        $scope.job.details = data[0];
                        $scope.jobDetailsLoaded = true;
						$scope.dtOptions = DTOptionsBuilder.newOptions()
							.withDOM('<"row"><"row"lf><"row"rt><"row"ip>')
							.withDisplayLength(10)
							.withOption('order', [0, 'desc']);

						$scope.dtOptions2 = DTOptionsBuilder.newOptions()
							.withDOM('<"row"BCr><"row"lf><"row"rt><"row"ip>')
							.withDisplayLength(10)
							.withOption('order', [0, 'asc'])
							.withButtons([{
								extend: 'excel',
								text: 'Export Job Sheet',
								className: 'btn ',
								filename: $scope.job.details.Job_Number + ' Sheet - ' + $scope.job.details.Status,
								customize: function(xlsx) {
									console.log(xlsx);
									$scope.exportExcel(xlsx);
								}


							}]);

                        $scope.getCompleteJob();
                    })
                }

                $scope.minsToString = function(mins){
                  var _hoursT = Math.floor(mins / 60);

                  var _minsRemaining = mins - (_hoursT * 60);

                  var _timeString = _hoursT + 'h ' + _minsRemaining + 'm';

                  return _timeString;
                }
                $scope.getJobDetails();
                $scope.getCompleteJob = function() {

                    jobSheet.getWork($scope.job.details.DB_ID).then(function(data) {
                        $scope.job.work = data;
                        for (var i = 0; i < $scope.job.work.length; i++) {
                            //does engineer exist in array, if not add them
                            var _engExist = false
                            for (var j = 0; j < _hoursByEngineer.length; j++) {
                                if (_hoursByEngineer[j].name === $scope.job.work[i].firstname) {
                                    _engExist = true;
                                }
                            }
                            if (!_engExist) {
                                var _new = {
                                    name: $scope.job.work[i].firstname,
                                    totalMinutes: 0
                                };
                                _hoursByEngineer.push(_new);
                            }


                            //add hours
                            for (var j = 0; j < _hoursByEngineer.length; j++) {
                                if (_hoursByEngineer[j].name === $scope.job.work[i].firstname) {
                                    var _hours = parseInt($scope.job.work[i].duration.substring(0, 2));
                                    var _minutes = parseInt($scope.job.work[i].duration.substring(3, 5));

                                    var _tminutes = (_hours * 60) + _minutes;

                                    _hoursByEngineer[j].totalMinutes = _hoursByEngineer[j].totalMinutes + _tminutes;

                                }
                            }

                            if ($scope.job.work[i].material != '') {
                                $scope.job.materialEntryV1 = true;
                            }
                        }

                        for (var i = 0; i < $scope.job.timeBreakDown.length; i ++)
                        {
                          $scope.job.totalTimeMinutes = parseInt($scope.job.totalTimeMinutes) + parseInt($scope.job.timeBreakDown[i].totalMinutes);

                          $scope.job.timeBreakDown[i].stringTime = $scope.minsToString($scope.job.timeBreakDown[i].totalMinutes);

                        }

                        $scope.job.stringTime = $scope.minsToString($scope.job.totalTimeMinutes);

                        job.getNotes($scope.job.details.DB_ID).then(function(data) {
                            $scope.job.material = ""

                                //job.getNotes($scope.job.details.DB_ID).then(function(data) {


                                    $scope.Notes.jobNotes = data;
                                      $scope.fullJobLoaded = true;
                                //});


                        })
                    })
                }


                //---------------------------------------------
                //
                //Export job
                //
                //---------------------------------------------


                $scope.HtmlEncode = function(s) {

                    var el = document.createElement("div");
                    el.innerText = el.textContent = s;
                    s = el.innerHTML;
                    if (typeof s === 'string' || s instanceof String) {
                        s = s.replace(/<br\s*\/?>/ig, "\n")
                    }

                    return s;

                }

                $scope.exportExcel = function(xlsx) {
                    var sheet = xlsx.xl.worksheets['sheet1.xml'];
                    var downrows = 10;
                    var clRow = $('row', sheet);
                    //update Row

                    var _LastRowIndex = 0;
                    clRow.each(function() {
                        var attr = $(this).attr('r');
                        var ind = parseInt(attr);
                        ind = ind + downrows;
                        _LastRowIndex = ind;
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
                            msg += '<c t="inlineStr" r="' + key + index + '" s="0">';
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
                        value: $scope.HtmlEncode($scope.job.details.Job_Number)
                    }, {
                        name: 'Customer',
                        value: $scope.HtmlEncode($scope.job.details.Customer)
                    }, {
                        name: 'Job Description',
                        value: $scope.HtmlEncode($scope.job.details.Description)
                    }, {
                        name: 'Machine',
                        value: $scope.HtmlEncode($scope.job.details.Machine)
                    }, {
                        name: 'ID',
                        value: $scope.HtmlEncode($scope.job.details.ID_Number)
                    }, {
                        name: 'Tacho',
                        value: $scope.HtmlEncode($scope.job.details.Tacho)
                    }, {
                        name: 'Site',
                        value: $scope.HtmlEncode($scope.job.details.Site)
                    }, {
                        name: 'Order No',
                        value: $scope.HtmlEncode($scope.job.details.OrderNumber)
                    }, {
                        name: 'Mileage',
                        value: $scope.HtmlEncode($scope.job.details.Mileage)
                    }];

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

                    //add Notes
                    _LastRowIndex++;

                    var _hoursRows = '';
                    for (var j = 0; j < $scope.job.timeBreakDown.length; j++) {
                        var _engineerHours = $scope.job.timeBreakDown[j];


                        var _newRow = Addrow((_LastRowIndex + 1), [{
                            k: 'A',
                            v: _engineerHours.name
                        }, {
                            k: 'B',
                            v: _engineerHours.stringTime
                        }]);

                        _hoursRows = _hoursRows + _newRow;
                        _LastRowIndex++;
                    };
                    _hoursRows = _hoursRows + Addrow((_LastRowIndex + 1), [{
                        k: 'A',
                        v: 'Total'
                    }, {
                        k: 'B',
                        v: $scope.job.stringTime
                    }]);
                    _LastRowIndex++;

                    _hoursRows = _hoursRows + Addrow((_LastRowIndex + 1), [{
                        k: 'A',
                        v: ''
                    }, {
                        k: 'B',
                        v: ''
                    }]);





                    //add blank row
                  _LastRowIndex++;



                    var _RowsToAdd = Addrow((_LastRowIndex + 1), [{
                        k: 'A',
                        v: 'Time'
                    }, {
                        k: 'B',
                        v: ''
                    }, {
                        k: 'C',
                        v: 'Note'
                    }, {
                        k: 'D',
                        v: ''
                    }, {
                        k: 'E',
                        v: 'Name'
                    }, {
                        k: 'F',
                        v: ''
                    }]);
                    _LastRowIndex++;
                    for (var k = 0; k < $scope.Notes.jobNotes.length; k++) {
                        var _newRow = Addrow((_LastRowIndex + 1), [{
                            k: 'A',
                            v: $scope.HtmlEncode($scope.Notes.jobNotes[k].time_excel_format)
                        }, {
                            k: 'B',
                            v: ''
                        }, {
                            k: 'C',
                            v: $scope.HtmlEncode($scope.Notes.jobNotes[k].text)
                        }, {
                            k: 'D',
                            v: ''
                        }, {
                            k: 'E',
                            v: $scope.HtmlEncode($scope.Notes.jobNotes[k].firstName)
                        }, {
                            k: 'F',
                            v: ''
                        }]);
                        _RowsToAdd = _RowsToAdd + _newRow;
                        _LastRowIndex++;
                    }

                    sheet.childNodes[0].childNodes[1].innerHTML = sheet.childNodes[0].childNodes[1].innerHTML + _hoursRows + _RowsToAdd;
                }




            }



        ]);

})();
