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
                        for (var key in options) {
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
                var operators = ['+', '-', 'x', ':'];

                var _object = {};

                var _operator = randomItemInArray(inputOperators);
                _object.operator = _operator;

                if (_operator == operators[0]) {
                    _object.a = randomNumber(numbers);
                    _object.b = randomNumber(numbers);
                    _object.result_true = _object.a + _object.b;
                    _object.result_false = randomItemInArray(numbers);
                } else if (_operator == operators[1]) {
                    _object.a = randomNumber(numbers);
                    _object.b = randomNumber(numbers, {
                        smaller: function (number) {
                            return number <= _object.a;
                        }
                    });
                    _object.result_true = _object.a - _object.b;
                    _object.result_false = randomItemInArray(numbers);
                } else if (_operator == operators[2]) {
                    _object.a = randomNumber(numbers, {
                        bigger: function (number) {
                            return number > 0;
                        },
                        smaller: function (number) {
                            return number <= 9;
                        }
                    });
                    _object.b = randomNumber(numbers, {
                        bigger: function (number) {
                            return number > 0;
                        },
                        smaller: function (number) {
                            return number <= 9;
                        }
                    });
                    _object.result_true = _object.a * _object.b;
                    _object.result_false = randomItemInArray(numbers);
                } else if (_operator == operators[3]) {
                    _object.a = randomNumber(numbers, {
                        bigger: function (number) {
                            return number > 0;
                        }
                    });
                    _object.b = randomNumber(numbers, {
                        division: function (number) {
                            return _object.a % number == 0 && _object.a > number && number > 0;
                        }
                    });
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

        .controller("freaking.math.ctrl", function ($scope, $q, Random) {
            var createNumberArray = function (number) {
                var _array = [];
                for (var i = 0; i < number; i++) {
                    _array.push(i);
                }
                return _array;
            };
            var parseOperators = function (_operators) {
                var operators = [];
                var alias = {
                    add: '+',
                    sub: '-',
                    multi: 'x',
                    divis: ':'
                };
                angular.forEach(_operators, function (value, key) {
                    value ? operators.push(alias[key]) : '';
                });
                return operators;
            };

            var checkAnswer = function (answer, result) {
                var defer = $q.defer();
                var mess = answer == result ? true : false;
                mess ? defer.resolve(mess) : defer.reject(mess);
                return defer.promise;
            };

            var interval;
            $scope.game = {
                running: false,
                end: false
            };
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
                var operators = parseOperators($scope.operators);
                if (operators.length > 0) {
                    $scope.genRandomCalculation(numbers, operators);
                }
            }, true);

            $scope.genRandomCalculation = function (numbers, operators) {
                $scope.view.calculation = Random.Calculation(numbers, operators);
            };

            $scope.init = function () {
                $scope.score = 0;
                $scope.game.running = false;
                $scope.game.end = false;
                $scope.operators = {
                    add: true,
                    sub: true,
                    multi: true,
                    divis: true
                };
            };


            $scope.endGame = function () {
                $scope.game.running = false;
                $scope.game.end = true;
                $scope.bestScore = $scope.score > $scope.bestScore ? $scope.score : $scope.bestScore;
                $('#resultText').html("Game Over");
            };

            $scope.run = function (answer) {
                !$scope.game.running && !$scope.game.end ? $scope.game.running = true : '';

                if ($scope.game.running) {
                    checkAnswer(answer, $scope.view.calculation.show).then(
                        function (mess) {
                            $('#resultText').html(mess ? 'true' : 'false');
                            $scope.score++;
                            var operators = parseOperators($scope.operators);
                            if (operators.length > 0) {
                                $scope.genRandomCalculation(numbers, operators);
                            }
                        },
                        function (mess) {
                            $scope.endGame();
                        }
                    );
                }

                //if (!$scope.game.running) {
                //    $scope.game.running = true;
                //    interval = setInterval(function () {
                //        $scope.$applyAsync(function () {
                //            var color = Random.BackgroundColor();
                //            $('body').css('background-color', color);
                //        })
                //    }, 100);
                //} else {
                //    clearInterval(interval);
                //    $scope.game.running = false;
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
                + '<p>= {{view.result}}</p>'
                + '<p>= {{view.result_real}}(real)</p>',
                link: function ($scope, elem, attrs) {
                    $scope.view = {};
                    $scope.$watch('calculation', function (calculation) {
                        $scope.view.a = calculation.a;
                        $scope.view.b = calculation.b;
                        $scope.view.operator = calculation.operator;
                        $scope.view.result_real = calculation.result_true;
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