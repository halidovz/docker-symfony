window.vimbox = angular.module('vimbox', ['ui.router']);

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


//controllers
vimbox.controller('MainController', ['$scope', '$sce', 'slide', 'skyeng', 'vocabulary', function($scope, $sce, slide, skyeng, vocabulary) {
    $scope.slide = $sce.trustAsHtml(slide.data);
    $scope.localId = null;
    $scope.word = {};

    $scope.vimWordClick = function(meaningId, localId, word) {
        $scope.localId = localId;
        $scope.word = {};

        var meaning;

        skyeng.get(meaningId).then(function(resp) {
            meaning = resp.data[0];
            return meaning;
        }).then(function(meaning) {
            return vocabulary.check(meaning.text);
        }).then(function(resp) {
            $scope.word = meaning;
            $scope.word.isInVocabulary = !!resp.data;
        });
    }

    $scope.hideWord = function() {
        $scope.word = {};
        $scope.localId = null;
    }

    $scope.addWord = function() {
        vocabulary.add($scope.word.text).then(function() {
            $scope.word.isInVocabulary = true;
        });
    }
}]);

//factories
vimbox.factory('skyeng', ['$http', function($http) {
    return {
        get: function(meaningId) {
            return $http({ method: 'GET', url: 'https://dictionary.skyeng.ru/api/v2/wordtasks?quality=85&width=234&meaningIds=' + meaningId });
        }
    };
}]);

vimbox.factory('vocabulary', ['$http', function($http) {
    return {
        check: function(word) {
            return $http({ method: 'GET', url: '/getWord?word=' + word });
        },
        add: function(word) {
            return $http({ method: 'POST', url: '/addWord', data: {word: word} });
        }
    };
}]);

//directives
vimbox.directive('vimWord', function() {
    return {
        restrict: 'E',
        link: function(scope, element, attrs) {
            if(+attrs.meaningId) {
                element.on('click', function() {
                    scope.vimWordClick(attrs.meaningId, attrs.localId, element.text());
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

//filters
vimbox.filter('html', ['$sce', function($sce) {
    return function(text) {
        return $sce.trustAsHtml(text);
    }
}]);