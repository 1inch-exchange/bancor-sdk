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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable max-len */
var eos_1 = require("./blockchains/eos");
var ethereum_1 = require("./blockchains/ethereum");
var ETHBlockchainId = '0xc0829421c1d260bd3cb3e0f06cfe2d52db2ce315';
var BNTBlockchainId = '0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C';
var EOSAnchorToken = {
    tokenAccount: 'bntbntbntbnt',
    tokenSymbol: 'BNT'
};
var anchorTokens = {
    ethereum: BNTBlockchainId,
    eos: EOSAnchorToken
};
function isAnchorToken(token) {
    if (token.blockchainType == 'ethereum' && token.ethereumBlockchainId.toLowerCase() == ETHBlockchainId.toLowerCase())
        return true;
    if (token.blockchainType == 'eos' && token.eosBlockchainId.tokenAccount == anchorTokens['eos'].tokenAccount)
        return true;
    return false;
}
function getTokenBlockchainId(token) {
    if (token.blockchainType == 'ethereum')
        return token.ethereumBlockchainId.toLowerCase();
    return token.eosBlockchainId.tokenAccount.toLowerCase();
}
function isReserveToken(reserveToken, token) {
    if (token.blockchainType == 'ethereum' && token.ethereumBlockchainId == reserveToken.ethereumBlockchainId)
        return true;
    if (token.blockchainType == 'eos' && token.eosBlockchainId.tokenAccount == reserveToken.eosBlockchainId.tokenAccount)
        return true;
    return false;
}
function getConverterBlockchainId(token) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(token.blockchainType == 'ethereum')) return [3 /*break*/, 2];
                    return [4 /*yield*/, ethereum_1.getConverterBlockchainId(token.ethereumBlockchainId)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2: return [4 /*yield*/, eos_1.getConverterBlockchainId(token.eosBlockchainId)];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function getReserveCount(reserves, blockchainType) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(blockchainType == 'ethereum')) return [3 /*break*/, 2];
                    return [4 /*yield*/, ethereum_1.getReservesCount(reserves)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2: return [4 /*yield*/, eos_1.getReservesCount(reserves)];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function getReserves(blockchainId, blockchainType) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(blockchainType == 'ethereum')) return [3 /*break*/, 2];
                    return [4 /*yield*/, ethereum_1.getReserves(blockchainId)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2: return [4 /*yield*/, eos_1.getReserves(blockchainId)];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function getReserveToken(token, index, blockchainType) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(blockchainType == 'ethereum')) return [3 /*break*/, 2];
                    return [4 /*yield*/, ethereum_1.getReserveBlockchainId(token, index)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2: return [4 /*yield*/, eos_1.getReserveBlockchainId(token, index)];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function getConverterToken(blockchainId, connector, blockchainType) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(blockchainType == 'ethereum')) return [3 /*break*/, 2];
                    return [4 /*yield*/, ethereum_1.getConverterSmartToken(connector)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2: return [2 /*return*/, blockchainId];
            }
        });
    });
}
exports.getConverterToken = getConverterToken;
function generatePathByBlockchainIds(sourceToken, targetToken) {
    return __awaiter(this, void 0, void 0, function () {
        var pathObjects, _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    pathObjects = { paths: [] };
                    if (!(sourceToken.blockchainType == targetToken.blockchainType)) return [3 /*break*/, 2];
                    _b = (_a = pathObjects.paths).push;
                    _c = { type: sourceToken.blockchainType };
                    return [4 /*yield*/, getConversionPath(sourceToken, targetToken)];
                case 1:
                    _b.apply(_a, [(_c.path = _k.sent(), _c)]);
                    return [3 /*break*/, 5];
                case 2:
                    _e = (_d = pathObjects.paths).push;
                    _f = { type: sourceToken.blockchainType };
                    return [4 /*yield*/, getConversionPath(sourceToken, null)];
                case 3:
                    _e.apply(_d, [(_f.path = _k.sent(), _f)]);
                    _h = (_g = pathObjects.paths).push;
                    _j = { type: targetToken.blockchainType };
                    return [4 /*yield*/, getConversionPath(null, targetToken)];
                case 4:
                    _h.apply(_g, [(_j.path = _k.sent(), _j)]);
                    _k.label = 5;
                case 5: return [2 /*return*/, pathObjects];
            }
        });
    });
}
exports.generatePathByBlockchainIds = generatePathByBlockchainIds;
function getPath(from, to) {
    var _a, _b, _c, _d;
    var blockchainType = from ? from.blockchainType : to.blockchainType;
    var path = {
        from: from ? (_a = { blockchainType: blockchainType }, _a[blockchainType + "BlockchainId"] = from[blockchainType + "BlockchainId"], _a) : null,
        to: to ? (_b = { blockchainType: blockchainType }, _b[blockchainType + "BlockchainId"] = to[blockchainType + "BlockchainId"], _b) : null
    };
    if (!path.to)
        path.to = (_c = { blockchainType: blockchainType }, _c[blockchainType + "BlockchainId"] = anchorTokens["" + blockchainType], _c);
    if (!path.from)
        path.from = (_d = { blockchainType: blockchainType }, _d[blockchainType + "BlockchainId"] = anchorTokens["" + blockchainType], _d);
    return path;
}
function getConversionPath(from, to) {
    return __awaiter(this, void 0, void 0, function () {
        var blockchainType, path;
        return __generator(this, function (_a) {
            blockchainType = from ? from.blockchainType : to.blockchainType;
            path = getPath(from, to);
            return [2 /*return*/, findPath(path, blockchainType)];
        });
    });
}
exports.getConversionPath = getConversionPath;
function findPath(pathObject, blockchainType) {
    return __awaiter(this, void 0, void 0, function () {
        var from, to;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, getPathToAnchorByBlockchainId((_a = { blockchainType: blockchainType }, _a[blockchainType + "BlockchainId"] = pathObject.from[blockchainType + "BlockchainId"], _a), (_b = { blockchainType: blockchainType }, _b[blockchainType + "BlockchainId"] = anchorTokens[blockchainType], _b))];
                case 1:
                    from = _e.sent();
                    return [4 /*yield*/, getPathToAnchorByBlockchainId((_c = { blockchainType: blockchainType }, _c[blockchainType + "BlockchainId"] = pathObject.to[blockchainType + "BlockchainId"], _c), (_d = { blockchainType: blockchainType }, _d[blockchainType + "BlockchainId"] = anchorTokens[blockchainType], _d))];
                case 2:
                    to = _e.sent();
                    return [2 /*return*/, getShortestPath(from, to)];
            }
        });
    });
}
exports.findPath = findPath;
function getPathToAnchorByBlockchainId(token, anchorToken) {
    return __awaiter(this, void 0, void 0, function () {
        var smartTokens, _a, response, _i, smartTokens_1, smartToken, blockchainId, reserves, reservesCount, i, reserveToken, path;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (isAnchorToken(token))
                        return [2 /*return*/, [getTokenBlockchainId(token)]];
                    if (!(token.blockchainType == 'eos')) return [3 /*break*/, 1];
                    _a = [token.eosBlockchainId.tokenAccount];
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, ethereum_1.getSmartTokens(token)];
                case 2:
                    _a = _c.sent();
                    _c.label = 3;
                case 3:
                    smartTokens = _a;
                    response = [];
                    _i = 0, smartTokens_1 = smartTokens;
                    _c.label = 4;
                case 4:
                    if (!(_i < smartTokens_1.length)) return [3 /*break*/, 13];
                    smartToken = smartTokens_1[_i];
                    return [4 /*yield*/, getConverterBlockchainId(token.blockchainType == 'ethereum' ? (_b = { blockchainType: token.blockchainType }, _b[token.blockchainType + "BlockchainId"] = smartToken, _b) : token)];
                case 5:
                    blockchainId = _c.sent();
                    return [4 /*yield*/, getReserves(blockchainId, token.blockchainType)];
                case 6:
                    reserves = (_c.sent()).reserves;
                    return [4 /*yield*/, getReserveCount(reserves, token.blockchainType)];
                case 7:
                    reservesCount = _c.sent();
                    i = 0;
                    _c.label = 8;
                case 8:
                    if (!(i < reservesCount)) return [3 /*break*/, 12];
                    return [4 /*yield*/, getReserveToken(reserves, i, token.blockchainType)];
                case 9:
                    reserveToken = _c.sent();
                    if (!!isReserveToken(reserveToken, token)) return [3 /*break*/, 11];
                    return [4 /*yield*/, getPathToAnchorByBlockchainId(reserveToken, anchorToken)];
                case 10:
                    path = _c.sent();
                    if (path.length > 0)
                        return [2 /*return*/, __spreadArrays([getTokenBlockchainId(token), token.blockchainType == 'eos' ? blockchainId : smartToken], path)];
                    _c.label = 11;
                case 11:
                    i++;
                    return [3 /*break*/, 8];
                case 12:
                    _i++;
                    return [3 /*break*/, 4];
                case 13: return [2 /*return*/, response];
            }
        });
    });
}
exports.getPathToAnchorByBlockchainId = getPathToAnchorByBlockchainId;
function getShortestPath(sourcePath, targetPath) {
    if (sourcePath.length > 0 && targetPath.length > 0) {
        var i = sourcePath.length - 1;
        var j = targetPath.length - 1;
        while (i >= 0 && j >= 0 && sourcePath[i] == targetPath[j]) {
            i--;
            j--;
        }
        var path = [];
        for (var m = 0; m <= i + 1; m++)
            path.push(sourcePath[m]);
        for (var n = j; n >= 0; n--)
            path.push(targetPath[n]);
        var length_1 = 0;
        for (var p = 0; p < path.length; p += 1) {
            for (var q = p + 2; q < path.length - p % 2; q += 2) {
                if (path[p] == path[q])
                    p = q;
            }
            path[length_1++] = path[p];
        }
        return path.slice(0, length_1);
    }
    return [];
}