'use strict';

angular.module('defyingGravityApp')

    .factory("MailService", function ($q, $http, appConfig) {
        return {
            SendMail: SendMail,
            AddUserEmailToMailchimp: AddUserEmailToMailchimp
        };

        function SendMail(mail) {
            var deferred = $q.defer();

            var postUrl = appConfig.mailGunApiUrl;
            var mailData = "from=" + mail.from + "&to=" + mail.to + "&subject=" + mail.subject + "&msg=" + mail.message + "&username=" + mail.name;

            console.log("sending mail");
            $http({
                "method": "POST",
                "url": postUrl,
                "headers": {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                "data": mailData
            }).then(function (response) {
                console.log("MAIL response " + JSON.stringify(response));
                deferred.resolve(response);
            });

            return deferred.promise;
        }

        function AddUserEmailToMailchimp(email) {
            console.log("email1: " + email);
            var deferred = $q.defer();
            var postUrl1 = appConfig.mailchimpUrl;
            var mailData = "email=" + email;

            $http({
                "method": "POST",
                "url": postUrl1,
                "headers": {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                "data": mailData
            }).then(function (response) {
                console.log("AddUserEmailToMailchimp response " + JSON.stringify(response));
                deferred.resolve(response);
            });
            return deferred.promise;
        }

    });






