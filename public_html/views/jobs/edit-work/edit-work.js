(function () {
    var app;
    app = angular.module('edit-work', ['jlg_services', 'report-generator', 'config_module'])
        .controller('edit-work-cntrl', ['$uibModal', '$scope', '$state', '$window', 'DTOptionsBuilder', 'DTColumnDefBuilder', 'jobList', 'settings', 'jobSheet', '$q', '$http','job',
            function ($uibModal, $scope, $state, $window, DTOptionsBuilder, DTColumnDefBuilder, jobList, settings, jobSheet, $q, $http, job) {


                $scope.jobFound;

                $scope.tableSettings = {


                    dtColumnDefs: [
                        // DTColumnDefBuilder.newColumnDef([0]).withOption('type', 'date')
                    ],
                    dtOptions: DTOptionsBuilder.newOptions()
                        .withDOM('<"row"><"row"lf><"row"rt><"row"ip>')
                        // .withDisplayLength(5)
                        // .withOption('order', [0, 'desc'])
                }

                $scope.jobList = [];
                $scope.getJobList = function () {
                    var deferred = $q.defer();
                    job.jobList().then(function (data) {
                        $scope.jobList = data;
                        deferred.resolve();

                    });
                    return deferred.promise;
                };

                $scope.getJobList();
                $scope.jobSelected = function (_job) {
                    $scope.selectedJob = _job;
                }

                $scope.getJob = function () {
                    const job = $scope.selectedJob.Job_Number;
                    $scope.jobLoaded = false;
                    jobSheet.get(job).then(function (job) {
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

                        // $scope.selectedJob = job;
                        /*  $scope.HtmlEncode = function(s) {
                              var el = document.createElement("div");
                              el.innerText = el.textContent = s;
                              s = el.innerHTML;
                              return s;
                          }*/

                        $scope.jobFound = {
                            description: {
                                number: '',//jobInfo.Job_Number,
                                description: '',//jobInfo.Description,
                                customer: '',// jobInfo.Customer,
                                status: '',//jobInfo.Status
                            },
                            totalTime: totalDurationString,
                            work: job
                        };

                        $scope.jobLoaded = true;



                    });
                }
            }
        ]);
})();
