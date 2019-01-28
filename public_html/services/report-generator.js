(function() {
    var app;
    app = angular.module('report-generator', ['config_module'])

    .factory("jobList", function jobListFactory($http, settings) {
            return {

                get: function() {
                    var serviceLoaction = settings.baseUrl + "general/jobList";
                    return $http.get(serviceLoaction).then(function(response) {
                        return response.data;
                    })
                },
                getFinished: function(_invoiced) {
                    var serviceLoaction = settings.baseUrl + "general/jobsFinished/" + _invoiced;
                    return $http.get(serviceLoaction).then(function(response) {
                        return response.data;
                    })
                },
                getInProgress: function() {
                    var serviceLoaction = settings.baseUrl + "general/jobsInProgress";
                    return $http.get(serviceLoaction).then(function(response) {
                        return response.data;
                    })
                },
                getInvoiced: function() {
                    var serviceLoaction = settings.baseUrl + "general/jobsInvoiced";
                    return $http.get(serviceLoaction).then(function(response) {
                        return response.data;
                    })
                },
                getJobInfo: function(status) {
                    //job status 1 = in prog, 2 = quarr, 3 = finished, 4 = invoiced, 5 = all, 6= all-invoiced
                    var serviceLoaction = settings.baseUrl + "general/jobs/" + status;
                    return $http.get(serviceLoaction).then(function(response) {
                        return response.data;
                    })

                },
                editJobStatus: function(statusUpdate) {
                    //example Data:
                    //  statusUpdate = {update: {job_status_idjob_status: 1}, id: 1};
                    var serviceLocation = settings.baseUrl + "general/jobs";

                    return $http.put(serviceLocation, statusUpdate).then(function(response) {
                        return response;

                    });
                }

            }

        })
        .factory("jobSheet", function jobSheetFactory($http, settings) {
            function msToTime(s) {

                // Pad to 2 or 3 digits, default is 2
                function pad(n, z) {
                    z = z || 2;
                    return ('00' + n).slice(-z);
                }

                var ms = s % 1000;
                s = (s - ms) / 1000;
                var secs = s % 60;
                s = (s - secs) / 60;
                var mins = s % 60;
                var hrs = (s - mins) / 60;

                return pad(hrs) + ':' + pad(mins);
            }
            return {
                get: function(jobNumber) {
                    var serviceLoaction = settings.baseUrl + "reports/createJobSheet/" + jobNumber;

                    return $http.get(serviceLoaction).then(function(response) {

                        return response.data;
                    })
                },
                getWork: function(_jobDBID) {
                    var serviceLoaction = settings.baseUrl + "reports/createJobSheet/1/" + _jobDBID;

                    return $http.get(serviceLoaction).then(function(response) {
                        if (response.status === 200) {
                            for (var i = 0; i < response.data.length; i++) {
                                response.data[i].date = new Date(response.data[i].starttime_s * 1000);
                                var duration = response.data[i].stoptime_s - response.data[i].starttime_s;
                                response.data[i].duration = msToTime(duration*1000);
                            }

                            return response.data;
                        }
                    })

                },
                getMaterial: function(_jobDBID) {
                    
                    return ""
                }

            }



        })
        .factory("assetReport", function assetReportFactory($http, settings) {
            return {


                get: function(_br) {

                    var phpLocation = settings.baseUrl + "services/exampleData/report-asset-br-" + _br.substring(3, 9) + ".json"

                    //console.log(phpLocation);
                    return $http.get(phpLocation).then(function(response) {
                        return response.data;

                    });
                }


            }

        })

    .factory("processReport", function processReportFactory($http, settings, Session) {

        return {

            get: function() {
                var phpLocation = settings.baseUrl + "reports/activeBRs";

                return $http.get(phpLocation).then(function(response) {
                    return response.data;

                });
            },
            getProcessTime: function(_start, _end, _type) {
                //var phpLocation = settings.phpUrl + "report-creation/report-process-processtimes.php?start=" + _start + "&end=" + _end + "&type=" + _type;
                var phpLocation = settings.baseUrl + "services/exampleData/report-process-processtimes.json";
                //console.log(phpLocation);
                return $http.get(phpLocation).then(function(response) {
                    return response.data;

                });

            },
            getFunctionalRates: function(_start, _end, _br) {
                if (typeof _br === 'undefined' || _br == '') {
                    //var phpLocation = settings.phpUrl + "report-creation/report-functional-rates.php?start=" + _start + "&end=" + _end;
                    var phpLocation = settings.baseUrl + "services/exampleData/report-functional-rates.json";
                    //console.log(phpLocation);
                    return $http.get(phpLocation).then(function(response) {
                        return response.data;

                    });
                } else {
                    //var phpLocation = settings.phpUrl + "report-creation/report-functional-rates.php?start=" + _start + "&end=" + _end + "&br=" + _br;
                    var phpLocation = settings.baseUrl + "services/exampleData/report-functional-rates-br-" + _br.substring(3, 9) + ".json";
                    //console.log(phpLocation);
                    return $http.get(phpLocation).then(function(response) {
                        return response.data;

                    });

                }

            }


        }

    })







})();
