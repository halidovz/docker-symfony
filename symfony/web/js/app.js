window.vimbox = angular.module('vimbox', ['ui.router']);

vimbox.controller('MainController', ['$scope', '$sce', 'slide', function($scope, $sce, slide) {
    $scope.slide = $sce.trustAsHtml(slide.data);
    $scope.localId = null;

    $scope.vimWordClick = function(meaningId, localId) {
        $scope.localId = localId;
    }
}]);


//routing
vimbox.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

    var main = {
        name: 'main',
        url: '/:slide',
        templateUrl: '/slide.html',
        controller: 'MainController',
        resolve: {
            slide: function($http, $stateParams) {
                return $http({ method: 'GET', url: '/slide' + ($stateParams.slide ? '/' + $stateParams.slide : '') });
            }
        }
    };

    $stateProvider.state(main);
    $urlRouterProvider.otherwise('/');
}]);


//directives
vimbox.directive('vimWord', function() {
    return {
        restrict: 'E',
        link: function(scope, element, attrs) {
            if(+attrs.meaningId) {
                element.on('click', function() {
                    scope.vimWordClick(attrs.meaningId, attrs.localId);
                    scope.$apply();
                })

                scope.$watch('localId', function(newValue) {
                    if(newValue == attrs.localId) {
                        element.addClass('selected');
                    } else {
                        element.removeClass('selected');
                    }
                })
            }
        }
    }
});

vimbox.directive('compile', ['$compile', function ($compile) {
    return function(scope, element, attrs) {
        scope.$watch(
            function(scope) {
                return scope.$eval(attrs.compile);
            },
            function(value) {
                element.html(value);
                $compile(element.contents())(scope);
            }
        );
    };
}]);