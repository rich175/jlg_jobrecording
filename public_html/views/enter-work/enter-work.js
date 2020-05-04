(function() {
    var app;
    app = angular.module('enter-work', ['config_module', 'report-generator', 'jlg_services'])
        .controller('enter-work-cntrl', ['$uibModal', '$timeout', '$scope', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'settings', 'addWork', 'uiCalendarConfig', 'jobList',
            function($uibModal, $timeout, $scope, DTOptionsBuilder, DTColumnDefBuilder, settings, addWork, uiCalendarConfig, jobList) {
                //navigating away warning
                $scope.navigationWarningNeeded = false;
                window.onbeforeunload = function(event) {
                    var message = 'Sure you want to leave?';

                    if (typeof event == 'undefined') {
                        event = window.event;
                    }
                    if (event) {
                        if ($scope.navigationWarningNeeded) {
                            event.returnValue = message;
                        } else {
                            return null;
                        }

                    }
                    return message;

                }
                $scope.$on('$stateChangeStart', function(event, next, current) {
                    if ($scope.navigationWarningNeeded) {
                        if (!confirm("Are you sure you want to leave this page?")) {
                            event.preventDefault();
                        }
                    } else {
                        return null;
                    }
                });


                $scope.todaysWorkLoaded = false;
                $scope.todaysWork = [];
                $scope.currentStep = 0;

                $scope.loadingWork = false;

                $scope.dateChosen = false;
                $scope.headerChange = false;
                $scope.tabs = [{
                    active: true,
                    disabled: false
                }, {
                    active: false,
                    disabled: false
                }, {
                    active: false,
                    disabled: false
                }, {
                    active: false,
                    disabled: false
                }];

                $scope.thisWork = {
                    job: '',
                    start: '',
                    end: '',
                    description: '',
                    materialUsed: '',
                    materialAdded: [],
                    materialAddedString: '',
                };

                $scope.isValid = {
                    reason: '',
                    status: false
                };

                //function to check if the work time entered is valid i.e. doesn't clash and makes sense
                $scope.workTimeChange = function() {
					var y2 = $scope.selectedDate.start.year();
					var m2 = $scope.selectedDate.start.month();
					var d2 = $scope.selectedDate.start.date();

					const _startTime = new Date(y2, m2, d2, $scope.thisWork.start.getHours(), $scope.thisWork.start.getMinutes());
					const _endTime = new Date(y2, m2, d2, $scope.thisWork.end.getHours(), $scope.thisWork.end.getMinutes());
                    $scope.isValid = addWork.validateTime($scope.calObjects.eventSources[0], _startTime, _endTime);
                };

                $scope.tempMaterial = {
                    material: {
                        id: 1,
                        QTY: '',
                        Description: '',
                    }

                };

                $scope.addMaterial = function() {


                    $scope.thisWork.materialAdded.push(angular.copy($scope.tempMaterial.material));
                    $scope.tempMaterial.material.id++;
                    $scope.tempMaterial.material.QTY = '';
                    $scope.tempMaterial.material.Description = '';
                    $scope.createMaterialString();

                }
                $scope.createMaterialString = function() {
                    $scope.thisWork.materialAddedString = '';
                    var _matString = '';
                    for (var i = 0; i < $scope.thisWork.materialAdded.length; i++) {
                        var _mat = $scope.thisWork.materialAdded[i];
                        var _tempString = '- ' + _mat.QTY + ' x ' + _mat.Description + '<br />';
                        _matString = _matString + _tempString;
                    }
                    $scope.thisWork.materialAddedString = _matString;

                }

                $scope.removeMaterial = function(mat) {
                    var _myNewArray = [];
                    var indexToRemove = 0;
                    for (var i = 0; i < $scope.thisWork.materialAdded.length; i++) {
                        if ($scope.thisWork.materialAdded[i].id === mat.id) {

                        } else {
                            _myNewArray.push($scope.thisWork.materialAdded[i])
                        }
                    }
                    $scope.thisWork.materialAdded = [];
                    $scope.thisWork.materialAdded = _myNewArray;
                    $scope.createMaterialString();


                }









                $scope.selectJob = function(job) {
                    $scope.thisWork.job = job;
                    var y2 = $scope.selectedDate.start.year();
                    var m2 = $scope.selectedDate.start.month();
                    var d2 = $scope.selectedDate.start.date();
                    if (!$scope.thisWork.start || $scope.thisWork.start === "") {
                        $scope.thisWork.start = new Date(y2, m2, d2, 9, 0);
                        $scope.thisWork.end = new Date(y2, m2, d2, 10, 0);
                    } else {
                        $scope.thisWork.start = new Date(y2, m2, d2, $scope.thisWork.end.getHours(), $scope.thisWork.end.getMinutes());
                        $scope.thisWork.end = new Date(y2, m2, d2, $scope.thisWork.end.getHours() + 1, 0);
                    }
                    $scope.moveToTab(1, 2);
                }

                $scope.dtOptions = DTOptionsBuilder.newOptions()
                    .withDOM('<"row"><"row"lf><"row"rt><"row"ip>')
                    .withDisplayLength(10)
                    .withOption('order', [1, 'desc'])

                $scope.jobsInProgress_Loaded = false;
                $scope.jobsInProgress = [];

                $scope.getJobsInProgress = function() {
                    $scope.jobsInProgress_Loaded = false;
                    $scope.jobsInProgress = [];

                    jobList.getJobInfo(1).then(function(jobs) {

                        $scope.jobsInProgress = jobs;

                        $scope.jobsInProgress_Loaded = true;
                    })
                };
                $scope.getJobsInProgress();

                $scope.moveToTab = function(_oldIndex, _newIndex) {
                    $scope.active = _newIndex;
                    //$scope.tabs[_oldIndex].active = false;
                    //$scope.tabs[_newIndex].active = true;
                }

                $scope.progress = function(id) {
                    $scope.currentStep = id;
                    if (id === 0) {
                        $scope.navigationWarningNeeded = false;
                        $scope.dateChosen = false;
                        var today = angular.copy($scope.initalCalendar.dt);
                        var _startDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
                        var _endDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
                        $scope.getWork($scope.convertToMySQL(_startDay), $scope.convertToMySQL(_endDay));

                        $scope.thisWork.job = '';
                        $scope.thisWork.description = '';
                        $scope.thisWork.materialAdded = [];
                        $scope.thisWork.materialAddedString = '';

                    }
                    if (id === 1) {
                        $scope.navigationWarningNeeded = false;


                    } else if (id === 2) {
                        $scope.navigationWarningNeeded = false;
                        $scope.workTimeChange();
                    } else if (id === 3) {
                        $scope.navigationWarningNeeded = true;
                        var y2 = $scope.selectedDate.start.year();
                        var m2 = $scope.selectedDate.start.month();
                        var d2 = $scope.selectedDate.start.date();

                        var tempTimeStart = new Date(y2, m2, d2, $scope.thisWork.start.getHours(), $scope.thisWork.start.getMinutes());
                        var tempTimeEnd = new Date(y2, m2, d2, $scope.thisWork.end.getHours(), $scope.thisWork.end.getMinutes());


                        var _event = {
                            title: '****WILL SAVE HERE****',
                            start: tempTimeStart,
                            end: tempTimeEnd,
                            className: ['temp']
                        };
                        $scope.calObjects.eventSources[0].push(_event);
                        $scope.tabs[0].disabled = true;
                        $scope.tabs[1].disabled = true;
                        $scope.tabs[2].disabled = true;
                    }
                }

                $scope.selectedDate = '';
                $scope.lastDate = '';



                $scope.saveWorkInstance = function() {
                    $scope.progress(4);
                    $scope.thisWork.description = $scope.thisWork.description.replace(/\n\r?/g, '<br/>');
                    //$scope.thisWork.materialUsed = $scope.thisWork.materialUsed.replace(/\n\r?/g, '<br/>');

                    var _toDB = {
                        db_jobid: $scope.thisWork.job.DBID,
                        db_empid: 3,
                        start: $scope.convertToMySQL($scope.thisWork.start),
                        end: $scope.convertToMySQL($scope.thisWork.end),
                        comments: $scope.thisWork.description,
                        materials: $scope.thisWork.materialAddedString,
                    };

                    addWork.addNewWork(_toDB).then(function(response) {
                        console.log(response);
                        $scope.moveToTab(3, 0);
                        $scope.progress(0);
                    });


                }

                /* config object */

                $scope.initalCalendar = {

                };

                $scope.initalCalendar.dt = new Date();
                $scope.initalCalendar.options = {
                    maxDate: new Date(),
                    showWeeks: false,
                    customClass: getDayClass,
                }

                $scope.today = function() {
                    $scope.initalCalendar.dt = new Date();
                }

                function getDayClass(data) {
                    return 'btn-cal';
                }

                $scope.$watch("initalCalendar.dt", function(newValue, oldValue) {
                    console.log("I've changed : ", newValue);
                    uiCalendarConfig.calendars['myCalendar1'].fullCalendar('gotoDate', newValue);
                });



                /* config object Main Day View */
                $scope.uiConfig = {
                    calendar: {
                        height: 450,
                        editable: false,
                        header: {
                            left: '',
                            center: 'title',
                            right: ''
                        },
                        eventClick: $scope.alertOnEventClick,
                        eventDrop: $scope.alertOnDrop,
                        eventResize: $scope.alertOnResize,
                        eventRender: $scope.eventRender,
                        defaultView: 'agendaDay',
                        contentHeight: 600,
                        slotDuration: '00:15:00',
                        eventClick: function(calEvent, jsEvent, view) {
                            var activeView = uiCalendarConfig.calendars['myCalendar1'].fullCalendar('getView');
                            if (activeView.name != 'agendaDay') {
                                uiCalendarConfig.calendars['myCalendar1'].fullCalendar('gotoDate', calEvent.start);
                                uiCalendarConfig.calendars['myCalendar1'].fullCalendar('changeView', 'agendaDay');
                            } else {
                                //alert('Event: ' + calEvent.title);
                                //alert('Coordinates: ' + jsEvent.pageX + ',' + jsEvent.pageY);
                                //alert('View: ' + view.name);
                                $scope.editWork(calEvent, $scope.calObjects.eventSources[0], addWork, $scope.jobsInProgress);
                                // change the border color just for fun
                                $(this).css('border-color', 'red');
                            }

                        },
                        viewRender: function(view, element) {

                            $scope.selectedDate = angular.copy(view);

                        }
                    }
                };


                var date = new Date();
                var d = date.getDate();
                var m = date.getMonth();
                var y = date.getFullYear();
                $scope.calObjects = {
                    eventSources: [
                        []
                    ]
                };

                $scope.newWork = {
                    title: 'Open Sesame',
                    start: new Date(y, m, d, 9, 0),
                    end: new Date(y, m, d, 10, 0),
                    className: ['openSesame']
                };

                $scope.getWork = function(_start, _end) {

                    $scope.loadingWork = true;

                    addWork.getWorkByDate(_start, _end, 'na').then(function(response) {

                        console.log(response);

                        $scope.loadedJobs = response;
                    });
                };
                $scope.$watch('selectedDate', function(newValue, oldValue) {
                    if (newValue) {
                        $scope.getWork(newValue.start.format("YYYY-MM-DD HH:mm:ss"), newValue.end.format("YYYY-MM-DD HH:mm:ss"));
                    }

                });
                $scope.loadedJobs = [];
                $scope.$watch('loadedJobs', function(newValue, oldValue) {
                    if (newValue.length > 0) {
                        $scope.displayWork(newValue);
                    } else {
                        $scope.loadingWork = false;
                    }

                });
                $scope.$watch('eventSources', function(newValue, oldValue) {
                    console.log(newValue);

                }, true);
                $scope.addEvent = function(event) {
                    if (event == 1) {
                        var y2 = $scope.selectedDate.start.year();
                        var m2 = $scope.selectedDate.start.month();
                        var d2 = $scope.selectedDate.start.date();
                        $scope.events.push({
                            title: 'Open Sesame',
                            start: new Date(y2, m2, d2, 9, 0),
                            end: new Date(y2, m2, d2, 10, 0),
                            className: ['openSesame'],
                            description: event.description
                        });
                    } else {


                        $scope.calObjects.eventSources[0].push(event);

                    }
                };



                $scope.eventRender = function(event, element, view) {
                    element.attr({
                        'tooltip': event.title,
                        'tooltip-append-to-body': true
                    });
                    $compile(element)($scope);
                };
                //Converts INTO mysql from JS datetime
                $scope.convertDate = function(_mySQL) {
                    // Split timestamp into [ Y, M, D, h, m, s ]
                    var t = _mySQL.split(/[- :]/);

                    // Apply each element to the Date function
                    var d = new Date(Date.UTC(t[0], t[1] - 1, t[2], t[3], t[4], t[5]));

                    return d;
                }

                $scope.convertToMySQL = function(_jsDate) {
                        var year, month, day, hours, minutes, seconds;
                        year = String(_jsDate.getFullYear());
                        month = String(_jsDate.getMonth() + 1);
                        if (month.length == 1) {
                            month = "0" + month;
                        }
                        day = String(_jsDate.getDate());
                        if (day.length == 1) {
                            day = "0" + day;
                        }
                        hours = String(_jsDate.getHours());
                        if (hours.length == 1) {
                            hours = "0" + hours;
                        }
                        minutes = String(_jsDate.getMinutes());
                        if (minutes.length == 1) {
                            minutes = "0" + minutes;
                        }
                        seconds = String(_jsDate.getSeconds());
                        if (seconds.length == 1) {
                            seconds = "0" + seconds;
                        }
                        // should return something like: 2011-06-16 13:36:00
                        return year + "-" + month + "-" + day + ' ' + hours + ':' + minutes + ':' + seconds;
                    }
                    //This function displays work on the calendar
                $scope.displayWork = function(_allWork) {

                    var j = $scope.calObjects.eventSources[0].length;
                    while (j--) {
                        $scope.calObjects.eventSources[0].splice(j, 1);
                    }
                    var _events = [];
                    for (var i = 0; i < _allWork.length; i++) {

                        var _start = new Date(_allWork[i].StartTime);
                        var _end = new Date(_allWork[i].EndTime)

                        var _newEvent = {
                            title: '#' + _allWork[i].JLG + ':  ' + _allWork[i].Notes,
                            start: _start,
                            end: _end,
                            className: ['holiday'],
                            stick: true,
                            work: _allWork[i],
                        }
                        _events.push(_newEvent);
                        $scope.calObjects.eventSources[0].push(_newEvent);
                    }
                    $scope.loadingWork = false;
                    $timeout(function() {
                        uiCalendarConfig.calendars['myCalendar1'].fullCalendar('option', 'aspectRatio', 0.2);
                        uiCalendarConfig.calendars['myCalendar1'].fullCalendar('rerenderEvents', true);
                    }, 500);
                };

                $scope.editWork = function(work, dayEvents, addWork, jobsInProgress) {
                    var modalInstance = $uibModal.open({
                        templateUrl: '/views/enter-work/edit-work-modal.html',
                        resolve: {
                            work: function() {
                                return work;
                            },
                            dayEvents: function() {
                                return dayEvents;
                            },
                            jobsInProgress: function() {
                                return jobsInProgress;
                            }

                        },
                        controller: 'ModalInstanceCtrl',
                        size: 'lg'
                    });
                    modalInstance.result.then(function(result) {
                        if (result.type === 'edit') {
                            var _editData = {
                                db_wkid: result.data.work.db_id,
                                update: {
                                    job_idjob: result.data.work.JLG_DB,
                                    starttime: $scope.convertToMySQL(new Date(result.data.work.StartTime)),
                                    stoptime: $scope.convertToMySQL(new Date(result.data.work.EndTime)),
                                    comments: result.data.work.Notes,
                                    materials: result.data.work.Materials,
                                }
                            };
                            addWork.editWork(_editData).then(function(response) {
                                $scope.getWork($scope.selectedDate.start.format("YYYY-MM-DD HH:mm:ss"), $scope.selectedDate.end.format("YYYY-MM-DD HH:mm:ss"), 3);
                                console.log(response);
                            });
                        } else if (result.type === 'delete') {
                            addWork.deleteWork(result.data.work.db_id).then(function(response) {
                                console.log(response);
                                $scope.getWork($scope.selectedDate.start.format("YYYY-MM-DD HH:mm:ss"), $scope.selectedDate.end.format("YYYY-MM-DD HH:mm:ss"), 3);
                            });
                        } else {
                            //error
                        }




                    })
                }




            }
        ])
        .controller('ModalInstanceCtrl', ['$scope', '$uibModalInstance', 'addWork', 'dayEvents', 'work', 'jobsInProgress',
            function($scope, $uibModalInstance, addWork, dayEvents, work, jobsInProgress) {

                $scope.initalJobNumber = angular.copy(work.work.JLG);
                $scope.jobsInProgress = jobsInProgress;
                $scope.newWork = angular.copy(work);
                $scope.x = addWork;
                for (var i = 0; i < $scope.jobsInProgress.length; i++) {
                    if ($scope.jobsInProgress[i].Job_Number === $scope.newWork.work.JLG) {
                        $scope.jobSelected = $scope.jobsInProgress[i];
                    }
                }


                $scope.styleChange = function(edited) {
                    if (edited) {
                        var x = {
                            'border': '2px solid red',
                            'border-radius': '5px'
                        };
                        return x;
                    } else {
                        var x = {
                            'border-style': 'none'
                        };
                        return x;
                    }
                }

                $scope.events = [];
                for (i = 0; i < dayEvents.length; i++) {
                    if (dayEvents[i].work.db_id === work.work.db_id) {

                    } else {
                        $scope.events.push(dayEvents[i]);
                    }
                };
                $scope.jobChanged = false;
                $scope.jobChange = function() {
                    $scope.newWork.work.JLG = $scope.jobSelected.Job_Number;
                    $scope.newWork.work.JLG_DB = $scope.jobSelected.DBID;
                    if ($scope.newWork.work.JLG != work.work.JLG) {
                        $scope.jobChanged = true;
                    } else {
                        $scope.jobChanged = false;
                    }
                    $scope.jobStyle = $scope.styleChange($scope.jobChanged);
                }
                $scope.notesChanged = false;
                $scope.notesChange = function() {
                    if ($scope.newWork.work.Notes != work.work.Notes) {
                        $scope.notesChanged = true;
                    } else {
                        $scope.notesChanged = false
                    }
                    $scope.noteStyle = $scope.styleChange($scope.notesChanged);
                }
                $scope.materialsChanged = false;
                $scope.materialsChange = function() {
                    if ($scope.newWork.work.Materials != work.work.Materials) {
                        $scope.materialsChanged = true;
                    } else {
                        $scope.materialsChanged = false
                    }
                    $scope.materialStyle = $scope.styleChange($scope.materialsChanged);
                }

                $scope.workTimeChange();
                $scope.ok = function() {
                    var reply = {
                        type: 'edit',
                        data: $scope.newWork
                    };
                    $uibModalInstance.close(reply);
                }
                $scope.cancel = function() {
                    $uibModalInstance.dismiss('cancel');
                };
                $scope.delete = function() {
                    var reply = {
                        type: 'delete',
                        data: $scope.newWork
                    };
                    $uibModalInstance.close(reply);
                };
            }
        ])

})();
