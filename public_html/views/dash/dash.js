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

          for (var i = 0; i < users.length; i++) {
            promise.push($scope.getWork(users[i].id));
          }

          $q.all(promise).then(function() {
            console.log('Chain finished!');

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

              for (var i = 0; i < $scope.users.users.length; i++) {
                if ($scope.users.users[i].id === _userID) {
                  $scope.users.users[i].work = response.data;
                }
              }



              $scope.work.message = "'Accessories' information retrieved";

              deferred.resolve('data received!')

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
          $scope.summaryData = [];

          $scope.summaryMonthLabels = [];
          $scope.summaryMonthType = 'StackedBar';
          $scope.summaryMonthSeries = [];
          $scope.summaryMonthData = [
            [],
            [],
            []
          ];

          $scope.summaryPieColours = {
            fill: false,
          }

        /*  $scope.summaryMonthOptions = {
            responsive: true,
            scales: {
              xAxes: [{
                type: "time",
                scaleLabel: {
                  display: true,
                  labelString: 'Date'
                }
              }, ],
              yAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: 'Hours'
                }
              }],
            },
             multiTooltipTemplate : "<%%=datasetLabel%> : <%%=value%>",
             hover: {
    mode: 'nearest',
    intersect: true
  },
  hover: {
    mode: 'nearest',
    intersect: true
  },

};*/
$scope.summaryMonthOptions = {
          scales: {
            xAxes: [{
               reverse: true,
              scaleLabel: {
                display: true,
                labelString: 'Date'
              }
            }],
            yAxes: [{
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
            text: 'Destination of Received Devices'
          }
        };



          //Create Date Range labels
          $scope.summaryLabels = [];
          var date1 = new Date($scope.dateString2);
          var date2 = new Date($scope.dateString);
          var day;
          $scope.summaryLabels = [];


          $scope.colourArray =[];
          while (date2 <= date1) {
            day = date1.getDate()
            date1 = new Date(date1.setDate(--day));

            var day2 = date1.getDate();
            var monthIndex = date1.getMonth();
            var year = date1.getFullYear();
            var _formattedDate = '' + year + '-' + (monthIndex + 1) + '-' + day2
            $scope.summaryLabels.push(_formattedDate);
            $scope.colourArray.push('#e3bf54');
          }

          //create empty series
          for (var i = 0; i < data.length; i++) {
            var _newSeries = {
              name: data[i].firstName,
              data: []
            };
            $scope.summarySeries.push(_newSeries);
          }

          //for each date see if there is an entry, if not add a 0;
          for (var i = 0; i < $scope.summaryLabels.length; i++) {
            var _dateBeingSearched = '' + $scope.summaryLabels[i];
            //for each user selected
            for (var j = 0; j < data.length; j++) {
              //for each work entry from user selected
              var _time = 0;
              for (var k = 0; k < data[j].work.length; k++) {
                //console.log(j + '--' + k);
                var _dateOfEntry = data[j].work[k].date;
                if ($scope.summaryLabels[i] === _dateOfEntry) {
                  _time = (data[j].work[k].duration / 60);
                  _time = _time.toFixed(1);
                }
              }
              $scope.summarySeries[j].data.push(_time);
            }
          }

          $scope.lineSeries = [];
          $scope.lineData = [];
          for (var i = 0; i < $scope.summarySeries.length; i++) {
            $scope.summarySeries[i].data.reverse();
          }
          $scope.summaryLabels.reverse();

          $scope.work.loaded = true;
          $scope.generalStats();


        }


        $scope.generalStats = function() {
          for (var i = 0; i < $scope.users.users.length; i++) {
            var _total = 0;
            for (var j = 0; j < $scope.users.users[i].work.length; j++) {
              _total += $scope.users.users[i].work[j].duration;
            }

            $scope.users.users[i].totalWork = (_total / 60).toFixed(1);
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
