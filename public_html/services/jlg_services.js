(function() {
    var app;
    app = angular.module('jlg_services', ['config_module'])

        .controller('textInputModelCtrl', function($scope, $uibModalInstance, type) {

            $scope.type = type;

            $scope.ok = function() {
                $uibModalInstance.close($scope.new_option);
            };

            $scope.cancel = function() {
                $uibModalInstance.dismiss('dismissed');
            };
        })
        .factory("addWork", function jobListFactory($http, settings) {
            return {

                addNewWork: function(_newWork) {
                    /* {
                  db_jobid: '',
                  db_empid: '',
                  start: '',
                  end:'',
                  comments: '',
                  materials: '',
                }
              */
                    var serviceLoaction = settings.baseUrl + "work/work";
                    return $http.post(serviceLoaction, _newWork).then(function(response) {
                        return response;
                    })
                },
                deleteWork: function(_workID) {
                    var serviceLoaction = settings.baseUrl + "work/work/" + _workID;
                    return $http.delete(serviceLoaction).then(function(response) {
                        return response.data;
                    })
                },
                editWork: function(_dataToUpdate) {
                    /* {
                    db_wkid: '',
                    update: {starttime: ''}
                    */
                    var serviceLoaction = settings.baseUrl + "work/work";
                    return $http.put(serviceLoaction, _dataToUpdate).then(function(response) {
                        return response.data;
                    })
                },
                getWorkByJob: function(_jobNumber) {
                    var serviceLoaction = settings.baseUrl + "work/work/" + _jobNumber;
                    return $http.get(serviceLoaction).then(function(response) {
                        return response.data;
                    })
                },
                getWorkByDate: function(_start, _end, _userID) {
                    var serviceLoaction = settings.baseUrl + "work/work/" + _start + "/" + _end + "/" + _userID;
                    return $http.get(serviceLoaction).then(function(response) {
                        return response.data;
                    })
                },
                validateTime: function(eventSource, _newStart, _newEnd) {
                    var isValid = {
                        reason: '',
                        status: false
                    };

                    var _numberOfDayEvents = eventSource.length;
                    var _newEventStart = _newStart;
                    var _newEventEnd = _newEnd;

                    for (var i = 0; i < _numberOfDayEvents; i++) {
                        var _eventStart = eventSource[i].start.getTime();
                        var _eventEnd = eventSource[i].end.getTime();

                        var _startIsWithin = false;
                        var _endIsWithin = false;
                        //if new start is between values
                        if ((_newEventStart > _eventStart) && (_newEventStart < _eventEnd)) {
                            _startIsWithin = true;
                        }
                        //if end is between values
                        if ((_newEventEnd > _eventStart) && (_newEventEnd < _eventEnd)) {
                            _endIsWithin = true;
                        }

                        //if existing is completly inside new values
                        if (((_eventStart >= _newEventStart) && (_eventStart <= _newEventEnd)) &&
                            ((_eventEnd >= _newEventStart) && (_eventEnd <= _newEventEnd))) {
                            isValid.status = false;
                            isValid.reason = 'The entered time encompasses another instance of work';

                        }


                        if (_endIsWithin && !_startIsWithin) {
                            isValid.status = false;
                            isValid.reason = 'The entered time over laps the beginning of another instance of work';
                        } else if (_startIsWithin && !_endIsWithin) {
                            isValid.status = false;
                            isValid.reason = 'The entered time over laps the end of another instance of work';
                        } else if (_startIsWithin && _endIsWithin) {
                            isValid.status = false;
                            isValid.reason = 'The entered time is contained by another instance of work';
                        }

                    }
                    if (isValid.reason === '') {

                        if (_newEventEnd > _newEventStart) {
                            isValid.status = true;
                            isValid.reason = '';
                        } else {
                            isValid.status = false;
                            isValid.reason = 'The entered end time is before the entered start time';
                        }
                    }
                    return isValid;


                }
            }


        })
        .factory("helper-functions", function helperFactory() {
            return {
                jsDateToMySQL: function(_jsDate) {
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
                },
                mySQLtoJSDate: function(_mysqlDate) {

                }

            }
        })
        .factory("customer", function customerFactory(settings, $http) {
            return {
              singleCustomer: function(dbid) {
                  var serviceLoaction = settings.baseUrl + "customers/customers/" + dbid;
                  return $http.get(serviceLoaction).then(function(response) {
                      return response;
                  })
              },
                allCustomers: function() {
                    var serviceLoaction = settings.baseUrl + "customers/customers";
                    return $http.get(serviceLoaction).then(function(response) {
                        return response;
                    })
                },
                addNew: function(_newC) {
                    var serviceLoaction = settings.baseUrl + "customers/customers";
                    return $http.post(serviceLoaction, _newC).then(function(response) {
                        return response;
                    })
                },
                editCustomer: function(_data) {
                    var serviceLoaction = settings.baseUrl + "customers/customers";
                    return $http.put(serviceLoaction, _data).then(function(response) {
                        return response;
                    })
                }
            }
        })
        .factory("job", function jobFactory(settings, $http) {
            return {
                singleJob: function(jlg_jobnumber) {
                    var serviceLoaction = settings.baseUrl + "general/job/" + jlg_jobnumber;
                    return $http.get(serviceLoaction).then(function(response) {
                        if (response.status === 200) {
                            return response.data;
                        } else {
                            return response;
                        }
                    })
                },
                statusOptions: function() {
                    var serviceLoaction = settings.baseUrl + "general/jobStatus";
                    return $http.get(serviceLoaction).then(function(response) {
                        return response.data;
                    })
                },
                updateJob: function(_updated) {
                    var serviceLoaction = settings.baseUrl + "general/job";
                    return $http.put(serviceLoaction, _updated).then(function(response) {
                        return response.data;
                    })
                },
                jobList: function() {

                    var serviceLoaction = settings.baseUrl + "general/job";
                    return $http.get(serviceLoaction).then(function(response) {
                        return response.data;
                    })
                },
                newJob: function(_newJob) {
                    /* req.body = {
                      job_number:'',
                      customer: '',
                      customerDB: '',
                      description: '',
                      tacho:'',
                      site:'',
                      machine:'',
                      serial:'',
                      mileage:'',
                      status:'',
                      statusDB:'',
                      orderNumber:
                    }
                    */
                    var serviceLoaction = settings.baseUrl + "general/job";
                    return $http.post(serviceLoaction, _newJob).then(function(response) {
                        return response;
                    })
                },
                shortList: function() {
                    var serviceLoaction = settings.baseUrl + "general/jobs";
                    return $http.get(serviceLoaction).then(function(response) {
                        return response.data;
                    })
                },
                filteredList: function(dbArray) {
                    var array = {
                        jb_db_id: dbArray
                    };
                    var serviceLoaction = settings.baseUrl + "general/jobs";
                    return $http.post(serviceLoaction, array).then(function(response) {
                        return response.data;
                    })
                },
                saveNote: function(newNote) {

                    var serviceLoaction = settings.baseUrl + "jobNotes/jobNotes";
                    return $http.post(serviceLoaction, newNote).then(function(response) {
                        return response.data;
                    })
                },
                getNotes: function(job_db_id) {
                    var serviceLoaction = settings.baseUrl + "jobNotes/jobNotes/" + job_db_id;
                    return $http.get(serviceLoaction).then(function(response) {
                        return response.data;
                    })
                }
            }



        })


})();
