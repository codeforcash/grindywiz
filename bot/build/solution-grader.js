"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var kissc = require('./kissc');
var validateLambdaPayload = require('./secret').validateLambdaPayload;
var convertHumanReadableToBytes = function (humanReadable) {
    function printpower(n, base, power) {
        if (base === 2) {
            return n * (1 << power);
        }
        else {
            return n * Math.pow(base, power);
        }
    }
    var _a = humanReadable.split(/\s+/), n = _a[0], abbreviation = _a[1];
    if (abbreviation) {
        if (/K(iB)?$/.test(abbreviation)) {
            return printpower(n, 2, 10);
        }
        else if (/M(iB)?$/.test(abbreviation)) {
            return printpower(n, 2, 20);
        }
        else if (/G(iB)?$/.test(abbreviation)) {
            return printpower(n, 2, 30);
        }
        else if (/T(iB)?$/.test(abbreviation)) {
            return printpower(n, 2, 40);
        }
        else if (/KB$/.test(abbreviation)) {
            return printpower(n, 10, 3);
        }
        else if (/MB$/.test(abbreviation)) {
            return printpower(n, 10, 6);
        }
        else if (/GB$/.test(abbreviation)) {
            return printpower(n, 10, 9);
        }
        else if (/TB$/.test(abbreviation)) {
            return printpower(n, 10, 12);
        }
    }
    else {
        return n;
    }
};
var SolutionGrader = (function () {
    function SolutionGrader(lambda, functionName) {
        this.lambda = lambda;
        this.lambdaFunctionName = functionName;
    }
    SolutionGrader.prototype.gradeSolution = function (code, currentProblem) {
        var _this = this;
        var compressedCode = kissc.compress(code);
        return new Promise(function (resolve) {
            _this.lambda.invoke({
                FunctionName: _this.lambdaFunctionName,
                LogType: 'Tail',
                Payload: JSON.stringify({
                    "compressedSolutionString": compressedCode,
                    "testIdInt": currentProblem
                })
            }, function (err, data) {
                return __awaiter(this, void 0, void 0, function () {
                    var logs, memoryUsedMatch, bytesUsed, memory, results, maxScore, userScore, solveTimeMilliseconds, hashSignature, validPayload;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (err) {
                                    console.error(err);
                                    throw err;
                                }
                                logs = new Buffer(data.LogResult, 'base64').toString();
                                memoryUsedMatch = logs.match(/\tMax Memory Used:\s(\S+\s\S+)\t\n/);
                                if (memoryUsedMatch) {
                                    memory = memoryUsedMatch[1];
                                    bytesUsed = convertHumanReadableToBytes(memory);
                                }
                                if (data.Payload.statusCode !== 200) {
                                    throw new Error('Something went wrong');
                                }
                                results = JSON.parse(data.Payload.body);
                                maxScore = results.maxScore, userScore = results.userScore, solveTimeMilliseconds = results.solveTimeMilliseconds, hashSignature = results.hashSignature;
                                return [4, validateLambdaPayload(JSON.stringify({
                                        maxScore: maxScore, solveTimeMilliseconds: solveTimeMilliseconds, userScore: userScore
                                    }, hashSignature))];
                            case 1:
                                validPayload = _a.sent();
                                if (!validPayload) {
                                    throw new Error('Something went wrong');
                                }
                                resolve({
                                    userScore: userScore, maxScore: maxScore, solveTimeMilliseconds: solveTimeMilliseconds, bytesUsed: bytesUsed
                                });
                                return [2];
                        }
                    });
                });
            });
        });
    };
    return SolutionGrader;
}());
exports["default"] = SolutionGrader;
//# sourceMappingURL=solution-grader.js.map