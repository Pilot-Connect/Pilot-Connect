'use strict';

angular.module('defyingGravityApp')

    //Live App Config
    .value('appConfig', {
     firebaseUrl: 'https://pilot-app.firebaseio.com/',
     defaultGeolocation: {lat: 36.2490413, lng: -113.7048059},
     providers: {
     'TWITTER': 'twitter',
     'FACEBOOK': 'facebook',
     'GOOGLE': 'google',
     'PASSWORD': 'password'
     },
     mapId: 'map',
     types: {
     'PERSONAL': 'personal',
     'BUSINESS': 'business'
     },
     aircraftCategories: ['airplane - single-engine land', 'airplane - multi-engine land',
     'airplane - single-engine sea', 'airplane - multi-engine sea', 'rotorcraft - helicopter',
     'rotorcraft - gyroplane', 'glider', 'lighter than air - airship', 'lighter than air - balloon',
     'powered lift', 'powered parachute land', 'powered parachute sea', 'weight-shift-control Land',
     'weight-shift-control sea', 'other'
     ],
     safety: {
     'YES': 'Yes',
     'NO': 'No'
     },
     pilotRating: ['Student', 'Sport Recreational', 'Private',
     'Private with Instrumental Rating', 'Commercial', 'Flight Instructor', 'Other type ratings'
     ],
     defaultUserImage: "https://firebasestorage.googleapis.com/v0/b/pilot-app-4f6fb.appspot.com/o/images%2Fuser-01.png?alt=media&token=b4c3fa6b-2fe7-478b-94b4-0cde16e1c9a7",
     takeTourVideoUrl: "https://firebasestorage.googleapis.com/v0/b/pilot-app-4f6fb.appspot.com/o/Assets%2FDefying_Gravity_Homepage_Video.mp4?alt=media&token=dffef75e-d8ca-488b-913e-ca3e81f45392",
     contactEmail : "contact@pilot-connect.com",
     mailGunApiUrl : "https://sookshum-labs.in/pilotconnect/email.php",
     mailchimpUrl: "https://sookshum-labs.in/mailchimp.php",
     notificationMail : 'notifications-noreply@pilot-connect.com',
     facebookLink :'https://www.facebook.com/The-Defying-Gravity-1674954206115428/',
     twitterLink : 'https://twitter.com/thedefygravity',
     instagramLink : 'https://www.instagram.com/thedefyinggravity/?hl=en'
     })




    //Demo App Config
    /*.value('appConfig', {
        domain: 'www.pilot-connect.com',
        firebaseUrl: 'https://pilot-live-app.firebaseio.com/',
        defaultGeolocation: {lat: 36.2490413, lng: -113.7048059},
        providers: {
            'TWITTER': 'twitter',
            'FACEBOOK': 'facebook',
            'GOOGLE': 'google',
            'PASSWORD': 'password'
        },
        mapId: 'map',
        types: {
            'PERSONAL': 'personal',
            'BUSINESS': 'business'
        },
        aircraftCategories: ['airplane - single-engine land', 'airplane - multi-engine land',
            'airplane - single-engine sea', 'airplane - multi-engine sea', 'rotorcraft - helicopter',
            'rotorcraft - gyroplane', 'glider', 'lighter than air - airship', 'lighter than air - balloon',
            'powered lift', 'powered parachute land', 'powered parachute sea', 'weight-shift-control Land',
            'weight-shift-control sea', 'other'
        ],
        safety: {
            'YES': 'Yes',
            'NO': 'No'
        },
        pilotRating: ['Student', 'Sport Recreational', 'Private',
            'Private with Instrumental Rating', 'Commercial', 'Flight Instructor', 'Other type ratings'
        ],
        defaultUserImage: 'https://firebasestorage.googleapis.com/v0/b/pilot-live-app.appspot.com/o/images%2Fuser-01.png?alt=media&token=ccebe650-b255-4263-ace8-e2595abfd8d7',
        takeTourVideoUrl: "https://firebasestorage.googleapis.com/v0/b/pilot-live-app.appspot.com/o/Assets%2FDefying_Gravity_Homepage_Video.mp4?alt=media&token=5c32c202-a3e5-4ab9-9efa-39944d24ff6b",
        contactEmail: "contact@pilot-connect.com",
        mailGunApiUrl: "https://sookshum-labs.in/pilotconnect/email.php",
        mailchimpUrl: "https://sookshum-labs.in/mailchimp.php",
        notificationMail: 'notifications-noreply@pilot-connect.com',
        facebookLink: 'https://www.facebook.com/The-Defying-Gravity-1674954206115428/',
        twitterLink: 'https://twitter.com/thedefygravity',
        instagramLink: 'https://www.instagram.com/thedefyinggravity/?hl=en'
    })*/

;