(function() {
    var app;
    app = angular.module('file-management', [])
        .controller('file-cntrl', ['$uibModal', '$scope', '$http', 'settings', '$state', 'USER_ROLES', '$filter', function($uibModal, $scope, $http, settings, $state, USER_ROLES, $filter) {





            $scope.uploadData = {};

            $scope.uploadedCount = 0;
            $scope.receivedCount = 0;
            $scope.downloadUrl = "/api/v1/upload/";
            $scope.viewText = "";

          

            $scope.setViewFiles = function(files, year, month) {
                //creates array for the input grouping type (year or year and month)
                var view = [];
                if (month === false) {
                    //group by year
                    for (var item in files[year]) { //for all months in year
                        for (var file in files[year][item]) { //for all files in month
                            view.push(files[year][item][file]);
                        }
                    }
                    $scope.viewText = year
                } else {
                    //group by month in year
                    for (var item in files[year][month]) { //all items in month
                        view.push(files[year][month][item]);
                    }
                    $scope.viewText = $filter('monthName')(month) + ' ' + year;
                }
                //console.log(view);

                $scope.viewFiles = view;
            }

            function groupTimestamps(files) {
                //take timestamps and group them by year and then month (in that year) e.g:
                groups = {};
                var year, day, month;

                files.map(function(item) {
                    time = new Date(item['upload_date']);
                    year = time.getFullYear();
                    month = time.getMonth() + 1;

                    groups[year] || (groups[year] = {}); // exists OR create {}
                    groups[year][month] || (groups[year][month] = []);
                    groups[year][month].push(item);

                });
                return groups;
            }

            $scope.getData = function() {
                $scope.dataLoaded = false;
                return $http
                    .get(settings.baseUrl + 'upload/')
                    .then(function(res) {
                        if (!res.data.error) {
                            $scope.data = res.data;
                            $scope.uploadedCount = res.data.uploadedBy.length;
                            $scope.receivedCount = res.data.uploadedFor.length;
                            if ($scope.AdminAccess($scope.currentUser.accessRights['file_manager'])) {
                                $scope.organisedFiles = groupTimestamps($scope.data.uploadedBy);
                                $scope.viewFiles = $scope.data.uploadedBy;
                            } else {
                                $scope.organisedFiles = groupTimestamps($scope.data.uploadedFor);
                                $scope.viewFiles = $scope.data.uploadedFor;
                            }
                            $scope.viewText = 'All'
                            $scope.dataLoaded = true;
                        } else {
                            alert("Error loading files");
                        }
                    })
            };

            $scope.reload = function() {
                $scope.dataLoaded = false;
                $scope.data = undefined;
                $scope.uploadedCount = 0;
                $scope.receivedCount = 0;
                $scope.uploadData.company_id = "";
                $scope.getData();
            };


            $scope.openUpload = function() {
                var modalInstance = $uibModal.open({
                    templateUrl: '/views/fileUpload/uploadModal.html',
                    controller: UploadModalInstanceCtrl
                });
                modalInstance.result.finally(function() {
                    $scope.reload();
                });
            };

            function UploadModalInstanceCtrl($scope, $uibModalInstance) {

                $scope.uploadedFile = function(element) {
                    $scope.$apply(function($scope) {
                        $scope.files = element.files;
                    });
                };

                $scope.cancel = function() {
                    $uibModalInstance.close();
                };

                $scope.uploadFile = function() {
                    var fd = new FormData();
                    var url = settings.baseUrl + 'upload/';
                    var date = new Date().getTime();

                    angular.forEach($scope.files, function(file) {
                        fd.append('file', file);

                    });
                    $scope.uploadData.upload_date = $scope.uploadData.upload_date.getTime();
                    fd.append("data", JSON.stringify($scope.uploadData));

                    $http.post(url, fd, {
                            withCredentials: false,
                            headers: {
                                'Content-Type': undefined
                            },
                            transformRequest: angular.identity
                        })
                        .success(function(data) {
                            angular.forEach(
                                angular.element("input[type='file']"),
                                function(inputElem) {
                                    angular.element(inputElem).val(null);
                                });
                            $uibModalInstance.close();
                        })
                        .error(function(data) {
                            console.log(data);
                            alert("An unknown error ocurred, please let us know if this keeps occuuring.");
                            $uibModalInstance.close();
                        });
                };

            }


            $scope.deletefile = function(fileID) {
                var url = settings.baseUrl + 'upload/' + fileID;
                return $http
                    .delete(url)
                    .then(function(res) {
                        if (!res.data.error) {
                            $scope.reload();
                        } else {
                            console.log("Error deleting file");
                            alert("An error ocurred!");
                        }
                    })
            };

            $scope.getData();

            $scope.downloadFile = function(httpPath) {
                // Use an arraybuffer
                $http.get(httpPath, {
                        responseType: 'arraybuffer'
                    })
                    .success(function(data, status, headers) {

                        var octetStreamMime = 'application/octet-stream';
                        var success = false;

                        // Get the headers
                        headers = headers();

                        // Get the filename from the x-filename header or default to "download.bin"
                        var filename = headers['x-filename'] || 'download.bin';

                        // Determine the content type from the header or default to "application/octet-stream"
                        var contentType = headers['content-type'] || octetStreamMime;

                        try {
                            // Try using msSaveBlob if supported
                            console.log("Trying saveBlob method ...");
                            var blob = new Blob([data], {
                                type: contentType
                            });
                            if (navigator.msSaveBlob)
                                navigator.msSaveBlob(blob, filename);
                            else {
                                // Try using other saveBlob implementations, if available
                                var saveBlob = navigator.webkitSaveBlob || navigator.mozSaveBlob || navigator.saveBlob;
                                if (saveBlob === undefined) throw "Not supported";
                                saveBlob(blob, filename);
                            }
                            console.log("saveBlob succeeded");
                            success = true;
                        } catch (ex) {
                            console.log("saveBlob method failed with the following exception:");
                            console.log(ex);
                        }

                        if (!success) {
                            // Get the blob url creator
                            var urlCreator = window.URL || window.webkitURL || window.mozURL || window.msURL;
                            if (urlCreator) {
                                // Try to use a download link
                                var link = document.createElement('a');
                                if ('download' in link) {
                                    // Try to simulate a click
                                    try {
                                        // Prepare a blob URL
                                        //console.log("Trying download link method with simulated click ...");
                                        var blob = new Blob([data], {
                                            type: contentType
                                        });
                                        var url = urlCreator.createObjectURL(blob);
                                        link.setAttribute('href', url);

                                        // Set the download attribute (Supported in Chrome 14+ / Firefox 20+)
                                        link.setAttribute("download", filename);

                                        // Simulate clicking the download link
                                        var event = document.createEvent('MouseEvents');
                                        event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
                                        link.dispatchEvent(event);
                                        //console.log("Download link method with simulated click succeeded");
                                        success = true;

                                    } catch (ex) {
                                        console.log("Download link method with simulated click failed with the following exception:");
                                        console.log(ex);
                                    }
                                }

                                if (!success) {
                                    // Fallback to window.location method
                                    try {
                                        // Prepare a blob URL
                                        // Use application/octet-stream when using window.location to force download
                                        //console.log("Trying download link method with window.location ...");
                                        var blob = new Blob([data], {
                                            type: octetStreamMime
                                        });
                                        var url = urlCreator.createObjectURL(blob);
                                        window.location = url;
                                        //console.log("Download link method with window.location succeeded");
                                        success = true;
                                    } catch (ex) {
                                        console.log("Download link method with window.location failed with the following exception:");
                                        console.log(ex);
                                    }
                                }

                            }
                        }

                        if (!success) {
                            // Fallback to window.open method
                            console.log("No methods worked for saving the arraybuffer, using last resort window.open");
                            window.open(httpPath, '_blank', '');
                        }
                    })
                    .error(function(data, status) {
                        console.log("Request failed with status: " + status);
                        alert('File not found, please contact us if this continues to happen!');
                        // Optionally write the error out to scope
                        $scope.errorDetails = "Request failed with status: " + status;
                    });
            };


        }]);
})();
