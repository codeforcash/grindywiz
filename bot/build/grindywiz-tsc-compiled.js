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
define("solution-grader", ["require", "exports"], function (require, exports) {
    "use strict";
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
});
define("bot", ["require", "exports", "keybase-bot", "aws-sdk", "solution-grader"], function (require, exports, KeybaseBot, aws_sdk_1, solution_grader_1) {
    "use strict";
    exports.__esModule = true;
    var fs = require('fs');
    var getKeybaseCredentials = require('./secret').getKeybaseCredentials;
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
});
var kissc = {
    compress: function (str, density) {
        var buffer = Int32Array || Array;
        var index = new buffer(1024 * 1024 * 4);
        var a, b;
        var commandlist = new buffer(1000002);
        var lastcommand;
        var rangemap = new buffer(524288);
        var rangemapfill;
        var rangemapmiss;
        var command;
        var commandindex = new buffer(327683);
        var nextinsert;
        var movernd;
        var base64 = [];
        for (a = 65; a < 91; a++) {
            base64.push(a);
        }
        for (a = 97; a < 123; a++) {
            base64.push(a);
        }
        for (a = 48; a < 58; a++) {
            base64.push(a);
        }
        base64.push(45);
        base64.push(95);
        var result = [(density == 15 ? "\u0100" : "A")];
        var resetpoint;
        var movinghash = 0;
        var hashpos;
        var length;
        var found;
        var tokenlist = [];
        var tokenlength = 0;
        var charbuffer = [];
        var charbufferlength = 0;
        var alternateindex = new buffer(1024 * 1024);
        function initialize() {
            var b;
            for (b = 0; b < 1024 * 1024 * 4; b++) {
                index[b] = -1;
            }
            resetpoint = a;
            commandlist[0] = 65536;
            commandlist[96] = 65537;
            commandlist[97] = 65538;
            lastcommand = 97;
            for (b = 1; b < 96; b++) {
                commandlist[b] = 31 + b;
            }
            for (b = 0; b < 327683; b++) {
                commandindex[b] = -1;
            }
            for (b = 0; b < 98; b++) {
                commandindex[commandlist[b]] = b;
            }
            for (b = 0; b < 524288; b++) {
                rangemap[b] = -1;
            }
            nextinsert = 0;
            movernd = 0;
            rangemapfill = 0;
            rangemapmiss = 0;
            for (b = 0; b < 1024 * 1024; b++) {
                alternateindex[b] = -1;
            }
        }
        function findalternate(pos, len, newending, newpos) {
            if (len > 250000) {
                return 0;
            }
            var combi1 = str.charCodeAt(newending) + (str.charCodeAt(newending + 1) << 16);
            var combi2 = str.charCodeAt(newending + 2) + (str.charCodeAt(newending + 3) << 16);
            var hash = ((len + 99 * pos + 919 * str.charCodeAt(newending) + 719 * str.charCodeAt(newending + 1) + 809 * str.charCodeAt(newending + 2) + 601 * str.charCodeAt(newending + 3)) & 0x3ffff) << 2;
            if (alternateindex[hash] === -1) {
                alternateindex[hash] = pos;
                alternateindex[hash + 1] = combi1;
                alternateindex[hash + 2] = combi2;
                alternateindex[hash + 3] = newpos;
            }
            else {
                if (alternateindex[hash] === pos && alternateindex[hash + 1] === combi1 && alternateindex[hash + 2] === combi2) {
                    return alternateindex[hash + 3];
                }
                else {
                    return 0;
                }
            }
        }
        function inithash() {
            var b;
            movinghash = 0;
            for (b = 0; b < 4; b++) {
                movinghash = (movinghash * 139 + str.charCodeAt(a + b)) & 0x3fffff;
            }
        }
        function findrange(hashpos, length) {
            var rangehash = (hashpos + 1099 * length) & 0x3ffff;
            var increment = 0;
            while (true) {
                found = (rangemap[rangehash * 2] === hashpos && rangemap[rangehash * 2 + 1] === length);
                if (found) {
                    return rangehash;
                }
                else if (rangemap[rangehash * 2] === -1) {
                    rangemap[rangehash * 2] = hashpos;
                    rangemap[rangehash * 2 + 1] = length;
                    rangemapfill++;
                    return rangehash;
                }
                else {
                    rangemapmiss++;
                    increment++;
                    rangehash = (rangehash + increment) & 0x3ffff;
                }
            }
        }
        function insertnew(obj) {
            lastcommand++;
            commandlist[lastcommand] = obj;
            updatecommandindex(lastcommand);
        }
        function updatecommandindex(index) {
            commandindex[commandlist[index]] = index;
        }
        function pushnumber(n) {
            while (n >= 4) {
                pushtoken((n & 3) + 4);
                n = (n >> 2) - 1;
            }
            pushtoken(n);
        }
        function pushcommand(n) {
            if (n < 64) {
                pushnumber(n);
            }
            else {
                pushnumber(lastcommand - n + 64);
            }
        }
        function promote(index) {
            var moveto;
            var mem;
            if (index < 64) {
                movernd = (movernd + 331804471) & 0x3fffffff;
                moveto = Math.max(0, Math.min(index - 1, (index >> 1) + (movernd >> 28)));
                mem = commandlist[index];
            }
            else {
                nextinsert = (nextinsert + 13) & 0x1f;
                moveto = nextinsert + 32;
                if (index !== lastcommand) {
                    lastcommand++;
                }
                mem = commandlist[index];
                index = lastcommand;
            }
            commandlist[index] = commandlist[moveto];
            commandlist[moveto] = mem;
            updatecommandindex(index);
            updatecommandindex(moveto);
        }
        function pushtoken6(token) {
            if (tokenlength === 0) {
                tokenlist[0] = token;
                tokenlength = 1;
            }
            else {
                charbuffer[charbufferlength] = base64[token * 8 + tokenlist[0]];
                tokenlength = 0;
                charbufferlength++;
                if (charbufferlength > 1023) {
                    result.push(String.fromCharCode.apply(null, charbuffer));
                    charbufferlength = 0;
                }
            }
        }
        function pushtoken15(token) {
            if (tokenlength < 4) {
                tokenlist[tokenlength] = token;
                tokenlength++;
            }
            else {
                charbuffer[charbufferlength] = 256 + tokenlist[0] + tokenlist[1] * 8 + tokenlist[2] * 64 + tokenlist[3] * 512 + token * 4096;
                tokenlength = 0;
                charbufferlength++;
                if (charbufferlength > 1023) {
                    result.push(String.fromCharCode.apply(null, charbuffer));
                    charbufferlength = 0;
                }
            }
        }
        var pushtoken = (density == 15 ? pushtoken15 : pushtoken6);
        var alternatepos;
        a = 0;
        initialize();
        inithash();
        while (a < str.length) {
            hashpos = index[movinghash];
            if (hashpos !== -1 && str[hashpos] === str[a] && str[hashpos + 1] === str[a + 1] && str[hashpos + 2] === str[a + 2] && str[hashpos + 3] === str[a + 3]) {
                length = 4;
                do {
                    while (str[a + length] === str[hashpos + length] && resetpoint + 5000000 - a > length) {
                        length++;
                    }
                    alternatepos = findalternate(hashpos, length, a + length, a);
                    if (alternatepos) {
                        hashpos = alternatepos;
                        length += 4;
                    }
                } while (alternatepos);
                var commandfull = findrange(hashpos, length);
                if (found) {
                    command = commandindex[commandfull + 65539];
                    pushcommand(command);
                    promote(command);
                }
                else {
                    var commandhalf = findrange(hashpos, 0);
                    if (found) {
                        command = commandindex[commandhalf + 65539];
                        pushcommand(command);
                        promote(command);
                        pushnumber(length - 4);
                        insertnew(commandfull + 65539);
                    }
                    else {
                        command = commandindex[65536];
                        pushcommand(command);
                        pushnumber(hashpos - resetpoint);
                        pushnumber(length - 4);
                        promote(command);
                        insertnew(commandhalf + 65539);
                        insertnew(commandfull + 65539);
                    }
                }
                a += length - 3;
                inithash();
                for (b = 0; b < 3; b++) {
                    if (index[movinghash] === -1) {
                        index[movinghash] = a;
                    }
                    a++;
                    movinghash = (movinghash * 139 + str.charCodeAt(a + 3) - 7985 * str.charCodeAt(a - 1)) & 0x3fffff;
                }
            }
            else {
                if (hashpos === -1) {
                    index[movinghash] = a;
                }
                var charcode = str.charCodeAt(a);
                command = commandindex[charcode];
                if (command !== -1) {
                    pushcommand(command);
                    promote(command);
                }
                else {
                    command = commandindex[65538];
                    pushcommand(command);
                    pushnumber(charcode);
                    promote(command);
                    insertnew(charcode);
                }
                a++;
                movinghash = (movinghash * 139 + str.charCodeAt(a + 3) - 7985 * str.charCodeAt(a - 1)) & 0x3fffff;
            }
            if (resetpoint + 5000000 <= a || lastcommand >= 1000000 || rangemapmiss > 10000000 || rangemapfill > 230000) {
                pushcommand(commandindex[65537]);
                initialize();
            }
        }
        while (tokenlength) {
            pushtoken(7);
        }
        result.push(String.fromCharCode.apply(String, charbuffer.slice(0, charbufferlength)));
        return result.join("");
    },
    decompress: function (str, maxlength) {
        maxlength = maxlength || Infinity;
        var a, b;
        var base64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
        var unbase641 = [];
        var unbase642 = [];
        for (a = 0; a < 64; a++) {
            unbase641[base64.charCodeAt(a)] = a & 7;
            unbase642[base64.charCodeAt(a)] = (a >> 3) & 7;
        }
        var strpos = 1;
        var numbers = [];
        var numberslength = 0;
        var procnumber = 0;
        var procshift = 0;
        function pushnumber(n) {
            numbers[numberslength] = n;
            numberslength++;
        }
        function morenumbers6() {
            var stop = Math.min(str.length, strpos + 50000);
            for (; strpos < stop; strpos++) {
                var inchar = str.charCodeAt(strpos);
                var lower = unbase641[inchar];
                var upper = unbase642[inchar];
                if (typeof lower !== "number") {
                    return false;
                }
                if (lower > 3) {
                    if (upper > 3) {
                        procnumber += (lower + (upper << 2)) << procshift;
                        procshift += 4;
                    }
                    else {
                        pushnumber(procnumber + ((lower + (upper << 2)) << procshift));
                        procnumber = 0;
                        procshift = 0;
                    }
                }
                else {
                    pushnumber(procnumber + (lower << procshift));
                    if (upper > 3) {
                        procnumber = upper;
                        procshift = 2;
                    }
                    else {
                        pushnumber(upper);
                        procnumber = 0;
                        procshift = 0;
                    }
                }
            }
        }
        function morenumbers15() {
            var stop = Math.min(str.length, strpos + 20000);
            for (; strpos < stop; strpos++) {
                var inchar = str.charCodeAt(strpos) - 256;
                if (!(inchar >= 0 && inchar < 32768)) {
                    return false;
                }
                for (var a = 0; a < 5; a++) {
                    var token = inchar & 7;
                    if (token > 3) {
                        procnumber += token << procshift;
                        procshift += 2;
                    }
                    else {
                        pushnumber(procnumber + (token << procshift));
                        procnumber = 0;
                        procshift = 0;
                    }
                    inchar = inchar >> 3;
                }
            }
        }
        var morenumbers;
        if (str[0] === "A") {
            morenumbers = morenumbers6;
        }
        else if (str[0] === "\u0100") {
            morenumbers = morenumbers15;
        }
        else {
            return false;
        }
        var commandlist = [];
        var lastcommand;
        var rangelist = [];
        var rangelistlength;
        var nextinsert;
        var movernd;
        function resetstate() {
            var a;
            commandlist[0] = 65536;
            commandlist[96] = 65537;
            commandlist[97] = 65538;
            lastcommand = 97;
            for (a = 1; a < 96; a++) {
                commandlist[a] = 31 + a;
            }
            nextinsert = 0;
            movernd = 0;
            rangelistlength = 0;
            originalpos = 0;
        }
        resetstate();
        function emptyoriginal() {
            var a;
            for (a = 0; a < originalpos; a += 1024) {
                result.push(String.fromCharCode.apply(String, original.slice(a, Math.min(a + 1024, originalpos))));
            }
        }
        function insertnew(obj) {
            lastcommand++;
            commandlist[lastcommand] = obj;
        }
        function pushoriginal(chr) {
            original[originalpos] = chr;
            originalpos++;
        }
        function newrange(pos, len) {
            insertnew(65539 + rangelistlength);
            rangelist[rangelistlength] = pos;
            rangelist[rangelistlength + 1] = len;
            rangelistlength += 2;
        }
        function promote(index) {
            var moveto;
            var mem;
            if (index < 64) {
                movernd = (movernd + 331804471) & 0x3fffffff;
                moveto = Math.max(0, Math.min(index - 1, (index >> 1) + (movernd >> 28)));
                mem = commandlist[index];
                commandlist[index] = commandlist[moveto];
            }
            else {
                nextinsert = (nextinsert + 13) & 0x1f;
                moveto = nextinsert + 32;
                if (index !== lastcommand) {
                    lastcommand++;
                }
                mem = commandlist[index];
                commandlist[lastcommand] = commandlist[moveto];
            }
            commandlist[moveto] = mem;
        }
        var original = [];
        var originalpos;
        var result = [];
        var rangelength;
        var beginfrom;
        if (morenumbers() === false) {
            return false;
        }
        for (a = 0; a < numberslength; a++) {
            if (a + 5 > numberslength) {
                for (b = a; b < numberslength; b++) {
                    numbers[b - a] = numbers[b];
                }
                numberslength = b - a;
                a = 0;
                if (morenumbers() === false) {
                    return false;
                }
            }
            var commandno = numbers[a];
            if (commandno >= 64) {
                commandno = lastcommand - commandno + 64;
            }
            var command = commandlist[commandno];
            if (typeof command !== "number") {
                return false;
            }
            promote(commandno);
            if (command > 65538) {
                rangelength = rangelist[command - 65538];
                beginfrom = rangelist[command - 65539];
                if (rangelength === 0) {
                    a++;
                    rangelength = numbers[a] + 4;
                    newrange(beginfrom, rangelength);
                }
                if (!(originalpos + rangelength < 5000010)) {
                    return false;
                }
                for (b = 0; b < rangelength; b++) {
                    pushoriginal(original[beginfrom + b]);
                }
            }
            else if (command === 65538) {
                a++;
                if (!(numbers[a] < 65536)) {
                    return false;
                }
                insertnew(numbers[a]);
                pushoriginal(numbers[a]);
            }
            else if (command === 65536) {
                a++;
                beginfrom = numbers[a];
                if (!(beginfrom < originalpos)) {
                    return false;
                }
                newrange(beginfrom, 0);
                a++;
                rangelength = numbers[a] + 4;
                if (!(originalpos + rangelength < 5000010)) {
                    return false;
                }
                for (b = 0; b < rangelength; b++) {
                    pushoriginal(original[beginfrom + b]);
                }
                newrange(beginfrom, rangelength);
            }
            else if (command === 65537) {
                maxlength -= originalpos;
                if (maxlength < 0) {
                    return false;
                }
                emptyoriginal();
                resetstate();
            }
            else if (command < 65536) {
                pushoriginal(command);
            }
            else {
                return false;
            }
        }
        if (maxlength - originalpos < 0) {
            return false;
        }
        emptyoriginal();
        return result.join("");
    }
};
module.exports = kissc;
define("main", ["require", "exports", "bot"], function (require, exports, bot_1) {
    "use strict";
    exports.__esModule = true;
    var main = function () { return __awaiter(void 0, void 0, void 0, function () {
        var bot;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    bot = new bot_1["default"]();
                    return [4, bot.init()];
                case 1:
                    _a.sent();
                    return [2];
            }
        });
    }); };
    function shutDown() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.error('Going for shutdown');
                process.exit();
                return [2];
            });
        });
    }
    process.on('SIGINT', shutDown);
    process.on('SIGTERM', shutDown);
    main();
});
define("secret", ["require", "exports", "crypto"], function (require, exports, crypto) {
    "use strict";
    exports.__esModule = true;
    var AWS = require('aws-sdk'), region = "us-east-1", keybaseCredentialsSecretName = "grindywiz_keybase", lambdaHmacSecretName = 'grindywiz_rubric_hmac', secret, decodedBinarySecret;
    var secretsManager = new AWS.SecretsManager({
        region: region
    });
    var getHmacKey = function () {
        return new Promise(function (resolve) {
            secretsManager.getSecretValue({ SecretId: lambdaHmacSecretName }, function (err, data) {
                if (err) {
                    console.error(err);
                    throw err;
                }
                else {
                    if ('SecretString' in data) {
                        resolve(data.SecretString);
                    }
                    else {
                        throw new Error();
                    }
                }
            });
        });
    };
    var validateLambdaPayload = function (resultsString, signature) {
        return new Promise(function (resolve) { return __awaiter(void 0, void 0, void 0, function () {
            var hmacKey;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, getHmacKey()["catch"](function (e) {
                            console.error('Could not get HMAC key.', { e: e });
                        })];
                    case 1:
                        hmacKey = _a.sent();
                        if (!hmacKey) {
                            throw new Error('');
                        }
                        resolve(signature === crypto.createHmac('sha256', hmacKey).update(resultsString).digest('base64'));
                        return [2];
                }
            });
        }); });
    };
    var getKeybaseCredentials = function () {
        return new Promise(function (resolve) {
            secretsManager.getSecretValue({ SecretId: keybaseCredentialsSecretName }, function (err, data) {
                if (err) {
                    if (err.code === 'DecryptionFailureException')
                        throw err;
                    else if (err.code === 'InternalServiceErrorException')
                        throw err;
                    else if (err.code === 'InvalidParameterException')
                        throw err;
                    else if (err.code === 'InvalidRequestException')
                        throw err;
                    else if (err.code === 'ResourceNotFoundException')
                        throw err;
                }
                else {
                    if ('SecretString' in data) {
                        secret = data.SecretString;
                    }
                }
                var keybaseSecret = JSON.parse(secret);
                var username = keybaseSecret.username, paperkey = keybaseSecret.paperkey;
                resolve({ username: username, paperkey: paperkey });
            });
        });
    };
    module.exports = { getKeybaseCredentials: getKeybaseCredentials, validateLambdaPayload: validateLambdaPayload };
});
//# sourceMappingURL=grindywiz-tsc-compiled.js.map