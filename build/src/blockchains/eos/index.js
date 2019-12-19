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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var eosjs_1 = require("eosjs");
var node_fetch_1 = __importDefault(require("node-fetch"));
var converter_blockchain_ids_1 = require("./converter_blockchain_ids");
var fs_1 = __importDefault(require("fs"));
var formulas_1 = require("../../utils/formulas");
var paths_1 = require("./paths");
var pathJson;
var jsonRpc;
function initEOS(endpoint) {
    pathJson = paths_1.Paths;
    jsonRpc = new eosjs_1.JsonRpc(endpoint, { fetch: node_fetch_1.default });
}
exports.initEOS = initEOS;
function getEosjsRpc() {
    return jsonRpc;
}
exports.getEosjsRpc = getEosjsRpc;
function getReservesFromCode(code) {
    return __awaiter(this, void 0, void 0, function () {
        var rpc;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    rpc = getEosjsRpc();
                    return [4 /*yield*/, rpc.get_table_rows({
                            json: true,
                            code: code,
                            scope: code,
                            table: 'reserves',
                            limit: 10
                        })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getReservesFromCode = getReservesFromCode;
function getConverterSettings(code) {
    return __awaiter(this, void 0, void 0, function () {
        var rpc;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    rpc = getEosjsRpc();
                    return [4 /*yield*/, rpc.get_table_rows({
                            json: true,
                            code: code,
                            scope: code,
                            table: 'settings',
                            limit: 10
                        })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getConverterSettings = getConverterSettings;
function getConverterFeeFromSettings(code) {
    return __awaiter(this, void 0, void 0, function () {
        var settings;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getConverterSettings(code)];
                case 1:
                    settings = _a.sent();
                    return [2 /*return*/, settings.rows[0].fee];
            }
        });
    });
}
function getSmartToken(code) {
    return __awaiter(this, void 0, void 0, function () {
        var rpc;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    rpc = getEosjsRpc();
                    return [4 /*yield*/, rpc.get_table_rows({
                            json: true,
                            code: code,
                            scope: code,
                            table: 'settings',
                            limit: 10
                        })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getSmartToken = getSmartToken;
function getSmartTokenSupply(account, code) {
    return __awaiter(this, void 0, void 0, function () {
        var rpc;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    rpc = getEosjsRpc();
                    return [4 /*yield*/, rpc.get_table_rows({
                            json: true,
                            code: account,
                            scope: code,
                            table: 'stat',
                            limit: 10
                        })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getSmartTokenSupply = getSmartTokenSupply;
function getReserveBalances(code, scope) {
    return __awaiter(this, void 0, void 0, function () {
        var rpc;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    rpc = getEosjsRpc();
                    return [4 /*yield*/, rpc.get_table_rows({
                            json: true,
                            code: code,
                            scope: scope,
                            table: 'accounts',
                            limit: 10
                        })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getReserveBalances = getReserveBalances;
function getReserveTokenSymbol(reserve) {
    return getSymbol(reserve.currency);
}
exports.getReserveTokenSymbol = getReserveTokenSymbol;
function getSymbol(string) {
    return string.split(' ')[1];
}
exports.getSymbol = getSymbol;
function getBalance(string) {
    return string.split(' ')[0];
}
exports.getBalance = getBalance;
function buildPathsFile() {
    return __awaiter(this, void 0, void 0, function () {
        var tokens;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (paths_1.Paths)
                        return [2 /*return*/];
                    tokens = {};
                    return [4 /*yield*/, Promise.all(converter_blockchain_ids_1.converterBlockchainIds.map(function (converterBlockchainId) { return __awaiter(_this, void 0, void 0, function () {
                            var smartToken, smartTokenContract, smartTokenName, reservesObject, reserves;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, getSmartToken(converterBlockchainId)];
                                    case 1:
                                        smartToken = _b.sent();
                                        smartTokenContract = smartToken.rows[0].smart_contract;
                                        smartTokenName = getSymbol(smartToken.rows[0].smart_currency);
                                        return [4 /*yield*/, getReservesFromCode(converterBlockchainId)];
                                    case 2:
                                        reservesObject = _b.sent();
                                        reserves = Object.values(reservesObject.rows);
                                        tokens[smartTokenContract] = (_a = {}, _a[smartTokenName] = [converterBlockchainId], _a);
                                        reserves.map(function (reserveObj) {
                                            var _a;
                                            var reserveSymbol = getReserveTokenSymbol(reserveObj);
                                            var existingRecord = tokens[reserveObj.contract];
                                            if (existingRecord)
                                                existingRecord[reserveSymbol].push(converterBlockchainId);
                                            tokens[reserveObj.contract] = existingRecord ? existingRecord : (_a = {}, _a[reserveSymbol] = [converterBlockchainId], _a);
                                        });
                                        return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 1:
                    _a.sent();
                    // eslint-disable-next-line no-console
                    fs_1.default.writeFile('./src/blockchains/eos/paths.ts', "export const Paths = " + JSON.stringify(tokens), 'utf8', function () { return console.log('Done making paths json'); });
                    return [2 /*return*/];
            }
        });
    });
}
exports.buildPathsFile = buildPathsFile;
function isFromSmartToken(pair, reserves) {
    return (!reserves.includes(pair.fromToken));
}
function isToSmartToken(pair, reserves) {
    return (!reserves.includes(pair.toToken));
}
function getPathStepRate(pair, amount) {
    return __awaiter(this, void 0, void 0, function () {
        var converterBlockchainId, reserves, reservesContacts, fee, isConversionFromSmartToken, balanceFrom, balanceTo, isConversionToSmartToken, amountWithoutFee, magnitude, balanceObject, converterReserves, tokenSymbol, tokenSupplyObj, toReserveRatio, tokenSupply, reserveTokenBalance, tokenSymbol, tokenSupplyObj, toReserveRatio, tokenSupply, reserveTokenBalance;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    converterBlockchainId = pair.converterBlockchainId;
                    return [4 /*yield*/, getReservesFromCode(converterBlockchainId)];
                case 1:
                    reserves = _b.sent();
                    reservesContacts = reserves.rows.map(function (res) { return res.contract; });
                    return [4 /*yield*/, getConverterFeeFromSettings(converterBlockchainId)];
                case 2:
                    fee = _b.sent();
                    isConversionFromSmartToken = isFromSmartToken(pair, reservesContacts);
                    return [4 /*yield*/, getReserveBalances(pair.fromToken, pair.converterBlockchainId)];
                case 3:
                    balanceFrom = _b.sent();
                    return [4 /*yield*/, getReserveBalances(pair.toToken, pair.converterBlockchainId)];
                case 4:
                    balanceTo = _b.sent();
                    isConversionToSmartToken = isToSmartToken(pair, reservesContacts);
                    amountWithoutFee = 0;
                    magnitude = 0;
                    balanceObject = (_a = {}, _a[pair.fromToken] = balanceFrom.rows[0].balance, _a[pair.toToken] = balanceTo.rows[0].balance, _a);
                    converterReserves = {};
                    reserves.rows.map(function (reserve) {
                        converterReserves[reserve.contract] = { ratio: reserve.ratio, balance: balanceObject[reserve.contract] };
                    });
                    if (!isConversionFromSmartToken) return [3 /*break*/, 6];
                    tokenSymbol = Object.keys(pathJson[pair.fromToken])[0];
                    return [4 /*yield*/, getSmartTokenSupply(pair.fromToken, tokenSymbol)];
                case 5:
                    tokenSupplyObj = _b.sent();
                    toReserveRatio = converterReserves[pair.toToken].ratio;
                    tokenSupply = getBalance(tokenSupplyObj.rows[0].supply);
                    reserveTokenBalance = getBalance(balanceTo.rows[0].balance);
                    amountWithoutFee = formulas_1.sellSmartToken(reserveTokenBalance, toReserveRatio, amount, tokenSupply);
                    magnitude = 1;
                    return [3 /*break*/, 9];
                case 6:
                    if (!isConversionToSmartToken) return [3 /*break*/, 8];
                    tokenSymbol = Object.keys(pathJson[pair.toToken])[0];
                    return [4 /*yield*/, getSmartTokenSupply(pair.toToken, tokenSymbol)];
                case 7:
                    tokenSupplyObj = _b.sent();
                    toReserveRatio = converterReserves[pair.fromToken].ratio;
                    tokenSupply = getBalance(tokenSupplyObj.rows[0].supply);
                    reserveTokenBalance = getBalance(balanceFrom.rows[0].balance);
                    amountWithoutFee = formulas_1.buySmartToken(reserveTokenBalance, toReserveRatio, amount, tokenSupply);
                    magnitude = 1;
                    return [3 /*break*/, 9];
                case 8:
                    amountWithoutFee = formulas_1.shortConvert(amount, getBalance(converterReserves[pair.toToken].balance), getBalance(converterReserves[pair.fromToken].balance));
                    magnitude = 2;
                    _b.label = 9;
                case 9:
                    if (fee == 0)
                        return [2 /*return*/, amountWithoutFee];
                    return [2 /*return*/, formulas_1.returnWithFee(amountWithoutFee, fee, magnitude)];
            }
        });
    });
}
exports.getPathStepRate = getPathStepRate;
function getConverterBlockchainId(token) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, pathJson[token.tokenAccount][token.tokenSymbol][0]];
        });
    });
}
exports.getConverterBlockchainId = getConverterBlockchainId;
function getReserveBlockchainId(reserves, position) {
    return __awaiter(this, void 0, void 0, function () {
        var reserveToken, symbol, tok;
        return __generator(this, function (_a) {
            reserveToken = reserves[position].tokenAccount;
            symbol = reserves[position].tokenSymbol;
            tok = {
                eosBlockchainId: {
                    tokenAccount: reserveToken,
                    tokenSymbol: symbol
                },
                blockchainType: 'eos'
            };
            return [2 /*return*/, tok];
        });
    });
}
exports.getReserveBlockchainId = getReserveBlockchainId;
function getReserves(converterBlockchainId) {
    return __awaiter(this, void 0, void 0, function () {
        var reserves, tokens;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getReservesFromCode(converterBlockchainId)];
                case 1:
                    reserves = _a.sent();
                    tokens = [];
                    reserves.rows.map(function (reserve) {
                        var symbol = getSymbol(reserve.currency);
                        tokens.push({ tokenSymbol: symbol, tokenAccount: reserve.contract });
                    });
                    return [2 /*return*/, { reserves: tokens }];
            }
        });
    });
}
exports.getReserves = getReserves;
function getReservesCount(reserves) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, reserves.length];
        });
    });
}
exports.getReservesCount = getReservesCount;
