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
var KeybaseBot = require("keybase-bot");
var aws_sdk_1 = require("aws-sdk");
var fs = require('fs');
var getKeybaseCredentials = require('./secret').getKeybaseCredentials;
var solution_grader_1 = require("./solution-grader");
var minify = function (code) {
    return new Promise(function (resolve) { return __awaiter(void 0, void 0, void 0, function () {
        var output;
        return __generator(this, function (_a) {
            try {
                output = require("@babel/core").transform(code, {
                    "plugins": ["const-enum", "@babel/transform-typescript"],
                    "presets": [["minify", {
                                "keepFnName": true
                            }]]
                });
            }
            catch (e) {
                console.error(e);
                throw e;
            }
            resolve(output.code);
            return [2];
        });
    }); });
};
var Bot = (function () {
    function Bot() {
        this.bot = new KeybaseBot();
        this.users = {};
        this.problems = JSON.parse(fs.readFileSync('problems.json', 'utf8'));
    }
    Bot.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, creds, message, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        _a = this;
                        return [4, this.getLambdaFunctionName()];
                    case 1:
                        _a.lambdaFunctionName = _b.sent();
                        return [4, getKeybaseCredentials()["catch"](function (credentialsError) {
                                console.error('Error fetching bot credentials');
                                process.exit();
                            })];
                    case 2:
                        creds = _b.sent();
                        return [4, this.bot.init(creds.username, creds.paperkey, { verbose: false })];
                    case 3:
                        _b.sent();
                        console.log("Bot is logged in as " + this.bot.myInfo().username);
                        message = {
                            body: "Bot restarted."
                        };
                        return [4, this.bot.chat.send(this.makeChannel('zackburt'), message)];
                    case 4:
                        _b.sent();
                        console.log('Init message sent!');
                        return [4, this.bot.chat.watchAllChannelsForNewMessages(this.onMessage.bind(this), this.onError)];
                    case 5:
                        _b.sent();
                        return [3, 7];
                    case 6:
                        error_1 = _b.sent();
                        console.error(error_1);
                        return [3, 7];
                    case 7: return [2];
                }
            });
        });
    };
    Bot.prototype.onError = function (e) {
        console.error(e);
    };
    Bot.prototype.onMessage = function (messageSummary) {
        var _this = this;
        var messageId = messageSummary.id, content = messageSummary.content, conversationId = messageSummary.conversationId, sender = messageSummary.sender;
        var username = sender.username;
        var text = content.text, edit = content.edit, metadata = content.metadata;
        if (edit) {
            return;
        }
        if (!text) {
            return;
        }
        var body = text.body;
        if (!body) {
            return;
        }
        var userState = this.getUserState(username);
        if (userState.currentProblem === null) {
            this.users[username].currentProblem = 0;
            this.shareProblem(username, 0);
            return;
        }
        var _a = this.problems[userState.currentProblem], statement = _a.statement, functionName = _a.functionName, inputParams = _a.inputParams, returnType = _a.returnType;
        var expectedSolutionFormatRegexp = new RegExp("```[^`]+" + functionName + "[^`]+```");
        if (!expectedSolutionFormatRegexp.test(body)) {
            var body_1 = statement + "\n\nPlease name your function `" + functionName + "` and define your code using Keybase style for code formatting; ";
            this.bot.chat.send(conversationId, { body: body_1 });
            return;
        }
        if (userState.lastSolutionReceivedTime) {
            if (process.hrtime(userState.lastSolutionReceivedTime)[0] < 60) {
                return;
            }
        }
        this.users[username].lastSolutionReceivedTime = process.hrtime();
        setTimeout(function () {
            _this.bot.chat.send(conversationId, {
                body: "It's been 60 seconds since your most recent solution.  Feel free to submit another!"
            });
        }, 60 * 1000);
        minify(body).then(function (code) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.bot.chat.react(conversationId, messageId, ':+1:');
                this.bot.chat.send(conversationId, {
                    body: "Solution received!  You'll get feedback as soon as we grade it!  Either way, please wait 60 seconds before your next submission."
                });
                this.solutionGrader.gradeSolution(code, userState.currentProblem).then(function (feedback) {
                    _this.handleFeedback(username, feedback);
                })["catch"](function (e) {
                    _this.bot.chat.send(conversationId, {
                        body: 'Something went wrong with the bot or your code. Sorry!  Please wait 60 seconds before resubmitting.'
                    });
                });
                return [2];
            });
        }); })["catch"](function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.bot.chat.react(conversationId, messageId, ':-1:')];
                    case 1:
                        _a.sent();
                        this.bot.chat.send(conversationId, {
                            body: 'Are you sure this is valid?  Try again in a new message, but please wait 60 seconds.'
                        });
                        return [2];
                }
            });
        }); });
    };
    Bot.prototype.getUserState = function (username) {
        if (!(username in this.users)) {
            this.users[username] = {
                currentProblem: null,
                lastSolutionReceivedTime: null
            };
        }
        return this.users[username];
    };
    Bot.prototype.shareProblem = function (username, problem) {
        if (!(problem in this.problems)) {
            var body_2 = 'Well done!  You have exhausted all of the problems.  Check back later.';
            this.bot.chat.send(this.makeChannel(username), { body: body_2 });
            return;
        }
        var _a = this.problems[problem], statement = _a.statement, functionName = _a.functionName, inputParams = _a.inputParams, returnType = _a.returnType;
        var body = statement + "\n\nPlease name your function `" + functionName + "` and define your code using Keybase style for code formatting; ";
        body = body.concat("i.e., wrapped in triple backticks.\n\n");
        body = body.concat("For example:\n\n");
        body = body.concat("```function " + functionName + "(" + inputParams.join(', ') + ") {\n    // do something\n    return " + returnType + ";\n}```");
        this.bot.chat.send(this.makeChannel(username), { body: body });
    };
    Bot.prototype.makeChannel = function (username) {
        return {
            name: username + ',' + this.bot.myInfo().username,
            public: false,
            topicType: 'chat'
        };
    };
    Bot.prototype.handleFeedback = function (username, feedback) {
        return __awaiter(this, void 0, void 0, function () {
            var body, pct;
            return __generator(this, function (_a) {
                body = '';
                if (feedback.userScore === feedback.maxScore) {
                    body = body.concat("Well done! A perfect score.\n\n");
                    body = body.concat("Memory used: ${feedback.bytesUsed} bytes\n");
                    body = body.concat("Solve time: ${feedback.solveTimeMilliseconds}ms");
                    this.bot.chat.send(this.makeChannel(username), { body: body });
                    this.users[username].currentProblem++;
                    return [2];
                }
                else {
                    pct = ~~(100 * (feedback.userScore / feedback.maxScore)).toString() + "%";
                    body = body.concat("Unfortunately, you only solved " + pct + " of the test cases.  Think it through and try again in a minute!");
                    this.bot.chat.send(this.makeChannel(username), { body: body });
                    return [2];
                }
                return [2];
            });
        });
    };
    Bot.prototype.getLambdaFunctionName = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.lambda = new aws_sdk_1.Lambda({ region: 'us-east-1' });
            _this.lambda.listFunctions({}, function (err, data) {
                for (var _i = 0, _a = data.Functions; _i < _a.length; _i++) {
                    var fxn = _a[_i];
                    if (/GrindyWiz/.test(fxn.FunctionName)) {
                        _this.solutionGrader = new solution_grader_1["default"](_this.lambda, fxn.FunctionName);
                        resolve(fxn.FunctionName);
                        return;
                    }
                }
            });
        });
    };
    return Bot;
}());
exports["default"] = Bot;
//# sourceMappingURL=bot.js.map