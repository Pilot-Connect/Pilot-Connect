'use strict';

angular
	.module('defyingGravityApp')
	.directive('starRating',

//Star Rating System directive
 function () {
    return {
        scope: {
            ratings: '=',
            maxRating: '@',
            readOnly: '@',
            click: "&",
            mouseHover: "&",
            mouseLeave: "&",
            height: '='

        },
        restrict: 'EA',
        template:
            /*"<div style='display: inline-block; margin: 0px; padding: 0px; cursor:pointer;' ng-repeat='idx in maxRatings track by $index'> \
                    <img ng-src='{{((hoverValue + _rating) <= $index) && \"http://www.codeproject.com/script/ratings/images/star-empty-lg.png\" || \"http://www.codeproject.com/script/ratings/images/star-fill-lg.png\"}}' \
                    ng-Click='isolatedClick($index + 1)' \
                    ng-mouseenter='isolatedMouseHover($index + 1)' \
                    ng-mouseleave='isolatedMouseLeave($index + 1)'></img> \
            </div>",*/
            "<div id='rating_dir' style='display: inline-block; margin: 0px; padding: 0px; cursor:pointer;' ng-repeat='idx in maxRatings track by $index'> \
                    <img style='height:{{height}}px;' ng-src='{{((hoverValue + _rating) <= $index) && \"images/star-empty-lg.png\" || \"images/star-fill-lg.png\"}}' \
                    ng-Click='isolatedClick($index + 1)' \
                    ng-mouseenter='isolatedMouseHover($index + 1)' \
                    ng-mouseleave='isolatedMouseLeave($index + 1)'></img> \
            </div>",
        compile: function (element, attrs) {
            if (!attrs.maxRating || (Number(attrs.maxRating) <= 0)) {
                attrs.maxRating = '5';
            };
        },
        controller: function ($scope, $element, $attrs) {
            $scope.maxRatings = [];

            for (var i = 1; i <= $scope.maxRating; i++) {
                $scope.maxRatings.push({});
            };

            $scope._rating = $scope.ratings;
      
      $scope.isolatedClick = function (param) {
        if ($scope.readOnly == 'true') return;

        $scope.ratings = $scope._rating = param;
        $scope.hoverValue = 0;
        $scope.click({
          param: param
        });
      };

      $scope.isolatedMouseHover = function (param) {
        if ($scope.readOnly == 'true') return;

        $scope._rating = 0;
        $scope.hoverValue = param;
        $scope.mouseHover({
          param: param
        });
      };

      $scope.isolatedMouseLeave = function (param) {
        if ($scope.readOnly == 'true') return;

        $scope._rating = $scope.ratings;
        $scope.hoverValue = 0;
        $scope.mouseLeave({
          param: param
        });
      };
    }
    };
});


//Usage in html
//     <div class="alert alert-success"> <span class="label label-info">Star Rating: Read/Write</span>
//
// <div star-rating rating="starRating1" read-only="false" max-rating="10" click="click1(param)" mouse-hover="mouseHover1(param)" mouse-leave="mouseLeave1(param)"></div>
//     <div> <span class="label label-primary">Star Rating: {{starRating1}}</span>
// <span class="label label-primary">Hover Rating: {{hoverRating1}}</span>
//
// </div>
// </div>
// <div class="alert alert-danger"> <span class="label label-info">Star Rating: ReadOnly</span>
//
// <div star-rating rating="starRating2" read-only="true" max-rating="7" click="click2(param)" mouse-hover="mouseHover2(param)" mouse-leave="mouseLeave2(param)"></div>
//     <div> <span class="label label-primary">Star Rating: {{starRating2}}</span>
// <span class="label label-primary">Hover Rating: {{hoverRating2}}</span>
//
// </div>
// </div>
// <div class="alert alert-info"> <span class="label label-info">Star Rating: Read/Write(with default values for readOnly & maxRating)</span>
//
// <div star-rating rating="starRating3" click="click3(param)" mouse-hover="mouseHover3(param)" mouse-leave="mouseLeave3(param)"></div>
//     <div> <span class="label label-primary">Star Rating: {{starRating3}}</span>
// <span class="label label-primary">Hover Rating: {{hoverRating3}}</span>
//
// </div>
// </div>
// </div>