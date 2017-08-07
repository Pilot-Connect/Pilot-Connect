'use strict';

angular.module('defyingGravityApp')
    .factory('ReviewService',
        function ($rootScope, $q, AuthService, FirebaseService, $modal) {
            var firebaseRef = FirebaseService.getFirebaseRef(),
                usersRef = firebaseRef.child('users');
            var AddPhotoWindow, readReviewWindow;

            return {
                getReviews: getReviews,
                post: post,
                openAddPhotoWindow: openAddPhotoWindow,
                openAllReviewsModal: openAllReviewsModal,
                CalculateAverage: CalculateAverage,
                update_average: update_average,
                getAverage: getAverage,
                upload: upload
            };

            function getReviews(id) {
                var ReviewRef = usersRef.child(id).child('review').orderByChild('review');
                var reviews = [];
                var deferred = $q.defer();
                ReviewRef.on("value", function (snapshot) {
                    var data = snapshot.val();
                    if (data) {
                        angular.forEach(snapshot.val(), function (review) {
                            reviews.push(review);
                        });
                        deferred.resolve(reviews);
                    }
                });
                return deferred.promise;
            }

            function CalculateAverage(data) {
                var one_star = 0, two_star = 0, three_star = 0, four_star = 0, five_star = 0;
                for (var i = 0; i < data.length; i++) {
                    var rate = data[i].rating;
                    if (rate == 5) {
                        five_star++;
                    }
                    else if (rate == 4) {
                        four_star++;
                    }
                    else if (rate == 3) {
                        three_star++;
                    }
                    else if (rate == 2) {
                        two_star++;
                    }
                    else if (rate == 1) {
                        one_star++;
                    }
                }
                var num = (5 * five_star + 4 * four_star + 3 * three_star + 2 * two_star + 1 * one_star);
                var den = five_star + four_star + three_star + two_star + one_star;
                var average = num / den;
                return average;
            }


            function post(id, data) {
                console.log(id);
                return usersRef.child(id + '/review').push(data);
            }

            function update_average(id) {
                getReviews(id).then(function (data) {
                    var average = CalculateAverage(data);
                    usersRef.child(id + '/rating').update({star_average: average});
                });
            }

            function getAverage(id) {
                var ReviewRef = usersRef.child(id).child('rating');
                var deferred = $q.defer();
                // ReviewRef.on("value", function (snapshot) {
                ReviewRef.on("child_added", function (snapshot) {
                   // console.log(snapshot.val());
                    var average = 0;
                    if (snapshot.val()) {
                        // average = snapshot.val().star_average;
                        average = snapshot.val();
                    }
                    deferred.resolve(average);
                });
                return deferred.promise;
            }

            function openAddPhotoWindow(pilotdata) {
                AddPhotoWindow = $modal.open({
                    size: 'md',
                    templateUrl: 'views/addPhoto-modal.html',
                    controller: 'AddPhotoController',
                    keyboard: false,
                    backdrop: 'static',
                    resolve: {
                        pilot: function () {
                            return pilotdata;
                        }
                    }
                });
            }

            function openAllReviewsModal(pilot) {
                readReviewWindow = $modal.open({
                    size: 'md',
                    templateUrl: 'views/readReviews-modal.html',
                    controller: 'ReadReviewController',
                    keyboard: false,
                    backdrop: 'static',
                    resolve: {
                        pilot: function () {
                            return pilot;
                        }
                    }
                });
            }

            function upload(evt, pilotId, index) {
                console.log(pilotId);
                var deferred = $q.defer();
                var file = evt;
                console.log(file);
                var type = file.type;
                var metadata = {
                    contentType: type
                };

                //console.log(type);
               // console.log(type.search("image"));
               // console.log(type.search("video"));


                if(file.type.search("image") > -1){
                   // console.log("image");
                    var storageRef = firebase.storage().ref();
                    var ImageRef = usersRef.child(pilotId).child('Images');
                    var newImageId = ImageRef.push().key;
                   // console.log(newImageId);
                    var uploadTask = storageRef.child(newImageId).put(file, metadata);
                    // Listen for errors and completion of the upload.
                    // [START oncomplete]
                    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
                        function(snapshot) {
                            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            $rootScope.$broadcast('UploadStatus',  progress, index);
                           // console.log('Upload is ' + progress + '% done');
                            switch (snapshot.state) {
                                case firebase.storage.TaskState.PAUSED: // or 'paused'
                                  //  console.log('Upload is paused');
                                    break;
                                case firebase.storage.TaskState.RUNNING: // or 'running'
                                  //  console.log('Upload is running');
                                    break;
                            }
                        }, function(error) {
                            switch (error.code) {
                                case 'storage/unauthorized':
                                    // User doesn't have permission to access the object
                                    break;

                                case 'storage/canceled':
                                    // User canceled the upload
                                    break;
                                case 'storage/unknown':
                                    // Unknown error occurred, inspect error.serverResponse
                                    break;
                            }
                        }, function() {
                            // Upload completed successfully, now we can get the download URL
                            //console.log('Uploaded',uploadTask.snapshot.totalBytes,'bytes.');
                           // console.log(uploadTask.snapshot.metadata);
                            var url = uploadTask.snapshot.downloadURL;
                            //var url = uploadTask.snapshot.metadata.downloadURLs[0];
                           // console.log('File available at', url);
                            ImageRef.child(newImageId).update({image: url})
                                .then(function () {
                                    deferred.resolve('success');
                                }, function (err) {
                                    //   console.log(err)
                                });
                        });


                } else if(file.type.search("video") > -1){
                    //console.log("vedio");
                    var storageRef = firebase.storage().ref().child('Videos');
                    var vedioRef = usersRef.child(pilotId).child('Videos');
                    var newVideoId = vedioRef.push().key;
                  //  console.log(newVideoId);
                    var uploadTask = storageRef.child(newVideoId).put(file, metadata);
                    // Listen for errors and completion of the upload.
                    // [START oncomplete]
                    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
                        function(snapshot) {
                            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            $rootScope.$broadcast('UploadStatus',  progress, index);
                           
                            //console.log('Upload is ' + progress + '% done');
                            switch (snapshot.state) {
                                case firebase.storage.TaskState.PAUSED: // or 'paused'
                                  //  console.log('Upload is paused');
                                    break;
                                case firebase.storage.TaskState.RUNNING: // or 'running'
                                  //  console.log('Upload is running');
                                    break;
                            }
                        }, function(error) {
                            switch (error.code) {
                                case 'storage/unauthorized':
                                    // User doesn't have permission to access the object
                                    break;

                                case 'storage/canceled':
                                    // User canceled the upload
                                    break;
                                case 'storage/unknown':
                                    // Unknown error occurred, inspect error.serverResponse
                                    break;
                            }
                        }, function() {
                            // Upload completed successfully, now we can get the download URL
                           // console.log('Uploaded',uploadTask.snapshot.totalBytes,'bytes.');
                            //console.log(uploadTask.snapshot.metadata);
                            var url = uploadTask.snapshot.downloadURL;
                            //var url = uploadTask.snapshot.metadata.downloadURLs[0];
                          //  console.log('File available at', url);
                            vedioRef.child(newVideoId).update({video: url})
                                .then(function () {
                                    deferred.resolve('success');
                                }, function (err) {
                                    console.log(err)
                                });
                        });
                }
                return deferred.promise;
            }
        });

