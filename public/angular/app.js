"use strict";


(function () {

    angular.module('freaking.math', [])

        .controller("freaking.math.ctrl", function ($scope) {
            var createNumberArray = function (number) {
                var _array = [];
                for (var i = 0; i < number; i++) {
                    _array.push(i);
                }
                return _array;
            };

            var interval;
            var isGameRunning = false;
            var limitRangeNumber = 20;
            var true_false = [true, false];
            var numbers = createNumberArray(20);
            var operators = ['+', '-'];
            $scope.view = {};


            var randomItemInArray = function (array) {
                var i = Math.floor(Math.random() * array.length);
                return array[i];
            };

            var random_background_color = function () {
                var background_color = ["#16a085", "#27ae60", "#8e44ad", "#f39c12", "#d35400", "#7f8c8d"];
                return randomItemInArray(background_color);
            };

            var random_calculation = function () {
                var _object = {
                    a: randomItemInArray(numbers),
                    b: randomItemInArray(numbers)
                };
                var _operator = randomItemInArray(operators);
                _object.result_true = _operator == operators[0] ? _object.a + _object.b : _object.a - _object.b;
                _object.result_false = randomItemInArray(numbers);
                _object.show = randomItemInArray(true_false);
                _object.operator = _operator;
                return _object;
            };

            $scope.view.calculation = {};

            $scope.genRandomCalcation = function () {
                $scope.view.calculation = random_calculation();
                console.log($scope.view.calculation);
            };

            $scope.run = function () {
                if (!isGameRunning) {
                    isGameRunning = true;
                    interval = setInterval(function () {
                        $scope.$applyAsync(function () {
                            var color = random_background_color();
                            $('body').css('background-color', color);
                        })
                    }, 100);
                } else {
                    clearInterval(interval);
                    isGameRunning = false;
                }
            };
        })
        .directive('formular', function () {
            return {
                restrict: 'E',
                scope: {
                    calculation: "="
                },
                template: '<p>{{view.a}} {{view.operator}} {{view.b}}</p>'
                        + '<p>{{view.result}}</p>',
                link: function ($scope, elem, attrs) {
                    $scope.view = {};
                    $scope.$watch('calculation', function (calculation) {
                        $scope.view.a = calculation.a;
                        $scope.view.b = calculation.b;
                        $scope.view.operator = calculation.operator;
                        $scope.view.result = calculation.show ? calculation.result_true : calculation.result_false;
                    })
                }
            }
        })

    ;

})();