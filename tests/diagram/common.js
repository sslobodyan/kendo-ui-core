﻿(function ($, global, undefined) {
    var deepExtend = window.kendo.deepExtend,
        Utils = window.kendo.dataviz.diagram.Utils;

    var Shapes = {
        Rectangle: function (point) {
            return {
                data: "Rectangle"
            };
        },
        Triangle: function () {
            return {
                data: "m2.5,109.24985l61,-106.74985l61,106.74985l-122,0z"
            };
        },
        SequentialData: function () {
            return {
                data: "m50.21875,97.4375l0,0c-26.35457,0 -47.71875,-21.25185 -47.71875,-47.46875l0,0c0,-26.21678 21.36418,-47.46875 47.71875,-47.46875l0,0c12.65584,0 24.79359,5.00155 33.74218,13.90339c8.94862,8.90154 13.97657,20.97617 13.97657,33.56536l0,0c0,12.58895 -5.02795,24.66367 -13.97657,33.56542l13.97657,0l0,13.90333l-47.71875,0z"
            };
        },
        Data: function () {
            return {
                data: "m2.5,97.70305l19.07013,-95.20305l76.27361,0l-19.0702,95.20305l-76.27354,0z"
            };
        },
        Wave: function () {
            return {
                data: "m2.5,15.5967c31.68356,-45.3672 63.37309,45.3642 95.05661,0l0,81.65914c-31.68353,45.36404 -63.37305,-45.36732 -95.05661,0l0,-81.65914z"
            };
        }
    };

    function Task(title) {
        this.Count = 0;
        this.Title = title;
    }

    Task.prototype = {
        isEmpty: false,
        undo: function () {
            this.Count--;
        },
        redo: function () {
            this.Count++;
        }
    };

    function buildRoughlyEqualMessage(actual, expected) {
        return "{expected: " + expected + ", actual: " + actual + "}";
    }

    function roughlyEqual(actual, expected, message) {
        var isOK = Math.abs(actual - expected) < 1E-6;
        var failMessage = (isOK ? "" : " : " + buildRoughlyEqualMessage(actual, expected));
        ok(isOK, message + failMessage);
    }

    function roughlyEqualPoint(actual, expected, message) {
        roughlyEqual(actual.x, expected.x, "point should be x equal");
        roughlyEqual(actual.y, expected.y, "point should be y equal");
    }

    function matrixEqual(m1, m2) {
        roughlyEqual(m1.a, m2.a, "matrix difference in a");
        roughlyEqual(m1.b, m2.b, "matrix difference in b");
        roughlyEqual(m1.c, m2.c, "matrix difference in c");
        roughlyEqual(m1.d, m2.d, "matrix difference in d");
        roughlyEqual(m1.e, m2.e, "matrix difference in e");
        roughlyEqual(m1.f, m2.f, "matrix difference in f");
    }

    function equalTranslate(svgNode, point, message) {
        var translateStr = "translate(" + point.x + " " + point.y + ")",
            nodeTransform = svgNode.getAttribute("transform"),
            unifiedTransformFormat = nodeTransform.replace(",", " "),
            isSameTranslate = unifiedTransformFormat.indexOf(translateStr) > -1;

        if (isSameTranslate) {
            ok(true, message);
        } else {
            fail(message + "expected: " + point.toString() + "; actual: " + nodeTransform);
        }
    }

    function randomPoint() {
        return { x: Utils.randomInteger(0, 500), y: Utils.randomInteger(0, 500) };
    }

    function randomDiagram(diagram) {
        var n = Utils.randomInteger(10, 20);
        for (var i = 0; i < n; i++) {
            diagram.addShape(randomPoint(), { data: "Rectangle" });
        }
    }

    var AddShape = function (kendoDiagram, p, shapeDefaults, id) {
        if (typeof(p) === "undefined") {
            p = new diagram.Point(0, 0);
        }

        shapeDefaults = kendo.deepExtend({
            width: 200,
            height: 100,
            id: id,
            background: "#778899",
            data: "rectangle",
            x: p.x,
            y: p.y
        }, shapeDefaults);

        return kendoDiagram.addShape(shapeDefaults);
    };

    var AddCircle = function (canvas, p, radius) {
        var circ = new diagram.Circle({
            x: p.x,
            y: p.y,
            background: "orange",
            radius: radius || 25
        });
        canvas.append(circ);

        return circ;
    };

    var AddConnection = function (diagram, from, to, options) {
        return diagram.connect(from, to, options);
    };

    var GetRoot = function () {
        var root = document.getElementById('canvas');
        if (root == null) {
            throw "The unit testing requires a DIV with name 'canvas'.";
        }
        var children = root.childNodes;
        if (children.length > 0) {
            for (var i = 0; i < children.length; i++) {
                root.removeChild(children[i]);
            }
        }
        return root;
    };

    function setupDiagramDataSource(options, data) {
        var items = data || [{id: 1}];

        dataSource = new kendo.data.DataSource($.extend({
            transport: {
                read: function(options) {
                    options.success(items);
                },
                update: function(options) {
                    options.success();
                },
                create: function(options) {
                    var newItem = options.data;
                    newItem.id = items.length + 1;
                    items.push(newItem);
                    options.success([newItem]);
                },
                destroy: function(options) {
                    options.success();
                }
            },
            schema: {
                model: {
                    id: "id",
                    fields: {
                        width: { type: "number" },
                        height: { type: "number" },
                        x: { type: "number" },
                        y: { type: "number" },
                        text: { type: "string" },
                        type: { type: "string" },
                        from: { type: "number" },
                        to: { type: "number" },
                        fromX: { type: "number" },
                        fromY: { type: "number" },
                        toX: { type: "number" },
                        toY: { type: "number" }
                    }
                }
            }
        }, {
        }, options));
        return dataSource;
    }

    function setupEditableDiagram(options) {
        QUnit.fixture.html('<div id="canvas" />');

        $("#canvas").kendoDiagram(deepExtend({
            dataSource: setupDiagramDataSource({}, [{
                id: 1,
                text: "firstName"
            }, {
                id: 2,
                text: "firstName1"
            }]),
            connectionsDataSource: setupDiagramDataSource({}, [{
                from: 1,
                to: 2
            }])
        }, options));

        return $("#canvas").getKendoDiagram();
    }

    deepExtend(window, {
        setupDiagramDataSource: setupDiagramDataSource,
        setupEditableDiagram: setupEditableDiagram,
        Shapes: Shapes,
        roughlyEqualPoint: roughlyEqualPoint,
        matrixEqual: matrixEqual,
        equalTranslate: equalTranslate,
        randomDiagram: randomDiagram,
        AddShape: AddShape,
        AddCircle: AddCircle,
        AddConnection: AddConnection,
        GetRoot: GetRoot,
        Task: Task
    });
})(kendo.jQuery, window);

(function(global) {
    /* exported initMock */
    function initMock(callback, context) {
        var mock = function() {
            mock.called = true;
            mock.callCount++;
            if (typeof(callback) === "function") {
                var result = callback.apply(context || this, arguments);
                if(mock.callbacks) {
                    for (var i = 0; i < mock.callbacks.length; i++) {
                        mock.callbacks[i].apply(context || this, arguments);
                    }
                }

                return result;
            }
        };

        mock.called = false;
        mock.callCount = 0;

        mock.callbacks = [];
        mock.addMethod = function(callback) {
            mock.callbacks.push(callback);
        };

        return mock;
    }

    /* exported mockFunc */
    function mockFunc(obj, methodName, mockMethod, context) {
        var method = obj[methodName];
        var mock = initMock(mockMethod, context || obj);
        mock.originalMethod = method;
        obj[methodName] = mock;
    }

    /* exported removeMock */
    function removeMock(obj, methodName) {
        var mock = obj[methodName];
        var method = mock.originalMethod;

        obj[methodName] = method;
    }

    /* exported isMockFunc */
    function isMockFunc(mock) {
        return typeof(mock.originalMethod) === "function";
    }

    /* exported trackMethodCall */
    function trackMethodCall(obj, methodName) {
        mockFunc(obj, methodName, obj[methodName]);
    }

    /* exported removeMocksIn */
    function removeMocksIn(obj) {
        for (var propName in obj) {
            if (obj[propName] && isMockFunc(obj[propName])) {
                removeMock(obj, propName);
            }
        }
    }

    global.kendo.deepExtend(global, {
        initMock: initMock,
        mockFunc: mockFunc,
        trackMethodCall: trackMethodCall,
        isMockFunc: isMockFunc,
        removeMock: removeMock,
        removeMocksIn: removeMocksIn
    });
})(window);
