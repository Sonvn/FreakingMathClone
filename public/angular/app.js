"use strict";


(function () {

    angular.module('freaking.math', [])

        .factory('Random', function () {
            var true_false = [true, false, false, true];

            var randomItemInArray = function (array) {
                var i = Math.floor(Math.random() * array.length);
                return array[i];
            };

            var randomNumber = function (numbers, options) {
                if (options) {
                    var number = 0;
                    var flag = true;
                    do {
                        number = randomItemInArray(numbers);
                        console.log(options);
                        for (var key in options) {
                            console.log(key);
                            options[key](number) ? flag = true : flag = false;
                        }
                    } while (flag == false);

                    return number;
                } else {
                    return randomItemInArray(numbers);
                }
            };

            var randomBackgroundColor = function () {
                var background_color = ["#16a085", "#27ae60", "#8e44ad", "#f39c12", "#d35400", "#7f8c8d"];
                return randomItemInArray(background_color);
            };

            var randomCalculation = function (numbers, inputOperators) {
                var operators = inputOperators || ['+', '-', 'x', ':'];

                var _object = {};

                var _operator = randomItemInArray(operators);
                _object.operator = _operator;

                if (_operator == operators[0]) {
                    _object.a = randomNumber(numbers);
                    _object.b = randomNumber(numbers);
                    _object.result_true = _object.a + _object.b;
                    _object.result_false = randomItemInArray(numbers);
                } else if (_operator == operators[1]) {
                    _object.a = randomNumber(numbers);
                    _object.b = randomNumber(numbers, {smaller: function (number) {
                        return number <= _object.a;
                    }});
                    _object.result_true = _object.a - _object.b;
                    _object.result_false = randomItemInArray(numbers);
                } else if (_operator == operators[2]) {
                    _object.a = randomNumber(numbers, {smaller: function (number) {
                        return number <= 0;
                    }});
                    _object.b = randomNumber(numbers, {smaller: function (number) {
                        return number <= 9;
                    }});
                    _object.result_true = _object.a * _object.b;
                    _object.result_false = randomItemInArray(numbers);
                } else if (_operator == operators[3]) {
                    _object.a = randomNumber(numbers);
                    _object.b = randomNumber(numbers, {division: function (number) {
                        return _object.a % number == 0 && _object.a > number && number != 0;
                    }});
                    _object.result_true = _object.a / _object.b;
                    _object.result_false = randomItemInArray(numbers);
                }
                _object.show = randomItemInArray(true_false);
                return _object;
            };
            return {
                ItemInArray: randomItemInArray,
                Number: randomNumber,
                BackgroundColor: randomBackgroundColor,
                Calculation: randomCalculation
            }
        })

        .controller("freaking.math.ctrl", function ($scope, Random) {
            var createNumberArray = function (number) {
                var _array = [];
                for (var i = 0; i < number; i++) {
                    _array.push(i);
                }
                return _array;
            };
            var parseOperators = function () {
                var operators = [];
                var alias = {
                    add: '+',
                    sub: '-',
                    multi: 'x',
                    divis: ':'
                };
                angular.forEach($scope.operators, function (value, key) {
                    value ? operators.push(alias[key]) : '';
                });
                return operators;
            };

            var checkAnswer = function (answer, result, callback) {
                var mess = answer == result ? true : false;
                callback(mess);
            };

            var interval;
            var isGameRunning = false;
            var limitRangeNumber = 20;
            $scope.score = 0;
            $scope.bestScore = 0;
            var numbers = createNumberArray(limitRangeNumber);

            $scope.view = {};

            $scope.view.calculation = {};

            $scope.operators = {
                add: true,
                sub: true,
                multi: true,
                divis: true
            };

            $scope.$watch('operators', function (operators) {
                var operators = parseOperators();
                if (operators.length > 0) {
                    $scope.genRandomCalculation(numbers, operators);
                }
            }, true);

            $scope.genRandomCalculation = function (numbers, operators) {
                $scope.view.calculation = Random.Calculation(numbers, operators);
            };

            $scope.init = function () {
                $scope.score = 0;
                isGameRunning = false;
                $scope.operators = {
                    add: true,
                    sub: true,
                    multi: true,
                    divis: true
                };
            };

            $scope.run = function (answer) {

                checkAnswer(answer, $scope.view.calculation.show, function (result) {
                    $('#resultText').html(result ? 'true' : 'false');
                    console.log(result);
                });

                var operators = parseOperators();
                if (operators.length > 0) {
                    $scope.genRandomCalculation(numbers, operators);
                }

                //$scope.$applyAsync(function () {
                //    var color = Random.BackgroundColor();
                //    $('body').css('background-color', color);
                //});

                //if (!isGameRunning) {
                //    isGameRunning = true;
                //    interval = setInterval(function () {
                //        $scope.$applyAsync(function () {
                //            var color = Random.BackgroundColor();
                //            $('body').css('background-color', color);
                //        })
                //    }, 100);
                //} else {
                //    clearInterval(interval);
                //    isGameRunning = false;
                //}
            };
        })
        .directive('formular', function () {
            return {
                restrict: 'E',
                scope: {
                    calculation: "="
                },
                template: '<p>{{view.a}} {{view.operator}} {{view.b}}</p>'
                + '<p>= {{view.result}}</p>',
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
        .directive("onKeypress", function () {
            return {
                restrict: "A",
                link: function ($scope, elem, attrs) {
                    elem.keydown(function (keyevent) {
                        $scope.$applyAsync(function () {
                            $scope.$eval(attrs.onKeypress, {keycode: keyevent.keyCode});
                        });
                    })
                }
            };
        })
    ;

})();