'use strict';

angular.module('defyingGravityApp')
    .controller('AddPhotoController', function (pilot, $scope, $rootScope, $state, ReviewService, $timeout, FirebaseService, $firebaseArray, $modal, Notification) {

        $scope.pilot = pilot;
        $scope.upload = upload;
        $scope.uploading = false;
        $scope.error = {};
        $scope.allUploaded = false;
        $scope.RemoveUploadItem = RemoveUploadItem;
        $scope.mediaFiles = [];

        function triggerCallback(e, callback) {
            if (!callback || typeof callback !== 'function') {
                return;
            }
            var files;
            if (e.dataTransfer) {
                files = e.dataTransfer.files;
            } else if (e.target) {
                files = e.target.files;
            }
            callback.call(null, files);
        }

        function makeDroppable() {
            var ele = window.document.querySelector('.droppable');
            var input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('multiple', true);
            input.setAttribute('accept', "image/*,video/*");
            input.style.display = 'none';
            input.addEventListener('change', function (e) {
                triggerCallback(e, callback);
            });

            ele.appendChild(input);

            ele.addEventListener('dragover', function (e) {
                e.preventDefault();
                e.stopPropagation();
                ele.classList.add('dragover');
            });

            ele.addEventListener('dragleave', function (e) {
                e.preventDefault();
                e.stopPropagation();
                ele.classList.remove('dragover');
            });

            ele.addEventListener('drop', function (e) {
                e.preventDefault();
                e.stopPropagation();
                ele.classList.remove('dragover');
                triggerCallback(e, callback);

            });

            ele.addEventListener('click', function () {
                input.value = null;
                input.click();
            });
        }

        function callback(files) {
            for (var i = 0; i < files.length; i++) {
                $scope.mediaFiles.push(files[i]);
                $scope.$apply();
                
            }

        }

        function upload() {
            $scope.error.size = false;
            $scope.error.noFile = false;
            if ($scope.mediaFiles) {
                for (var i = 0; i < $scope.mediaFiles.length; i++) {
                    var file = $scope.mediaFiles[i];
                    var type = file.type;
                    var size = file.size;
                    var MAX = 4000000000; // 4 GB
                    if (size < MAX) {
                        $scope.uploading = true;
                        $scope.error = false;
                        ReviewService.upload(file, pilot.id , i).then(function (Success) {
                            if (Success) {
                                //console.log(Success);
                                if (type.search('image') > -1) {
                                  //  Notification.success('Your Image has been Successfully Uploaded');
                                } else if (type.search('video') > -1) {
                                   // Notification.success('Your Video has been Successfully Uploaded');
                                }
                                // $scope.uploading = false;


                            } else {
                                //console.log("ERROR");
                            }
                        });
                    } else {
                        $scope.error.size = true;
                    }
                }
            } else {
                $scope.error.noFile = true;
            }
        }
        function RemoveUploadItem(index) {
            if (index > -1) {
                $scope.mediaFiles.splice(index, 1);
                // uploadTask.cancel();
            }
            if($scope.mediaFiles.length == 0){
                $scope.mediaFiles = [];
            }


        }

        $timeout(function () {
            // var el = document.getElementById('addPhoto');
            // el.addEventListener('change', handleFileSelect, false);
            makeDroppable();
        });

        function allTrue(obj)
        {
            for(var o in obj)
                if(!obj[o]) return false;

            return true;
        }


        $scope.$on('UploadStatus', function (evt, status, index) {
            var progressStatus = 0;
            $scope.mediaFiles[index].uploadProgress = Math.round(status);
            $scope.$apply();

            var uploaded = {};
            for(var i=0, j = $scope.mediaFiles.length ; i<j ; i++ ){
                if($scope.mediaFiles[i].uploadProgress == 100){
                    uploaded[i] =true;
                } else {
                    uploaded[i] =false;
                }
          
                progressStatus += $scope.mediaFiles[i].uploadProgress;
                var avg =(progressStatus / $scope.mediaFiles.length );
                $scope.totalUploadProgress =  Math.round(avg);
            }
            

            if(allTrue(uploaded)){
                $scope.allUploaded = true;
                Notification.success('Your Files has been Successfully Uploaded');
                //On photo upload fire event to reload data for current pilot so new uploaded videos and photos show up on profile
                $rootScope.$broadcast('onPhotoUploadComplete', {args: pilot});
                //$scope.$close();
            }

           /* if( index == $scope.mediaFiles.length -1 && status == 100){
                console.log("closing modal");
                Notification.success('Your Files has been Successfully Uploaded');
                $scope.$close();
            }*/


        });


    });














