import { JsonRpc } from 'eosjs';
import fetch from 'node-fetch';
import { converterBlockchainIds } from './converter_blockchain_ids';
import fs from 'fs';
import { shortConvert, sellSmartToken, buySmartToken, returnWithFee } from '../../utils/formulas';
import { ConversionPathStep, Token } from '../../path_generation';
import { Paths } from './paths';

interface Reserve {
    contract: string;
    currency: string;
    ratio: number;
}

let pathJson = Paths;
let jsonRpc;

export function initEOS(endpoint) {
    jsonRpc = new JsonRpc(endpoint, { fetch });
}

export function getEosjsRpc() {
    return jsonRpc;
}

export const getReservesFromCode = async (code, symbol?) => {
    const scope = symbol ? symbol : code;
    const rpc = getEosjsRpc();

    return await rpc.get_table_rows({
        json: true,
        code: code,
        scope: scope,
        table: 'reserves',
        limit: 10
    });
};

export const getConverterSettings = async code => {
    const rpc = getEosjsRpc();

    return await rpc.get_table_rows({
        json: true,
        code: code,
        scope: code,
        table: 'settings',
        limit: 10
    });
};

export const getConverterFeeFromSettings = async code => {
    const settings = await getConverterSettings(code);
    return settings.rows[0].fee;
};

export async function getSmartToken(code) {
    const rpc = getEosjsRpc();

    return await rpc.get_table_rows({
        json: true,
        code: code,
        scope: code,
        table: 'settings',
        limit: 10
    });
}

export const getSmartTokenSupply = async (account, code) => {
    const rpc = getEosjsRpc();

    return await rpc.get_table_rows({
        json: true,
        code: account,
        scope: code,
        table: 'stat',
        limit: 10
    });
};

export const getIsMultiConverter = blockchhainId => {
    return pathJson.smartTokens[blockchhainId] && pathJson.smartTokens[blockchhainId].isMultiConverter;
};

export const getReserveBalances = async (code, scope, table = 'accounts') => {
    const rpc = getEosjsRpc();

    return await rpc.get_table_rows({
        json: true,
        code: code,
        scope: scope,
        table: table,
        limit: 10
    });
};

export const getReserveTokenSymbol = (reserve: Reserve) => {
    return getSymbol(reserve.currency);
};

export function getSymbol(string) {
    return string.split(' ')[1];
}

export function getBalance(string) {
    return string.split(' ')[0];
}

export async function buildPathsFile() {
    const tokens = {};
    const smartTokens = {};
    await Promise.all(converterBlockchainIds.map(async converterBlockchainId => {
        const smartToken = await getSmartToken(converterBlockchainId);
        const smartTokenContract = smartToken.rows[0].smart_contract;
        const smartTokenName = getSymbol(smartToken.rows[0].smart_currency);
        const reservesObject = await getReservesFromCode(converterBlockchainId);
        const reserves = Object.values(reservesObject.rows);
        smartTokens[smartTokenContract] = { [smartTokenName]: { [smartTokenName]: converterBlockchainId } };
        reserves.map((reserveObj: Reserve) => {
            const reserveSymbol = getReserveTokenSymbol(reserveObj);
            const existingRecord = tokens[reserveObj.contract];
            if (existingRecord)
                existingRecord[reserveSymbol][smartTokenName] = converterBlockchainId;

            tokens[reserveObj.contract] = existingRecord ? existingRecord : { [reserveSymbol]: { [smartTokenName]: converterBlockchainId } };
        });
    }));
    // eslint-disable-next-line no-console
    await fs.writeFile('./src/blockchains/eos/paths.ts', `export const Paths = \n{convertibleTokens:${JSON.stringify(tokens)}, \n smartTokens: ${JSON.stringify(smartTokens)}}`, 'utf8', () => console.log('Done making paths json'));
}

function isFromSmartToken(pair: ConversionPathStep, reserves: string[]) {
    return (!reserves.includes(Object.values(pair.fromToken)[0]));
}

function isToSmartToken(pair: ConversionPathStep, reserves: string[]) {
    return (!reserves.includes(Object.values(pair.toToken)[0]));
}

export async function getPathStepRate(pair: ConversionPathStep, amount: string) {
    const toTokenBlockchainId = Object.values(pair.toToken)[0];
    const fromTokenBlockchainId = Object.values(pair.fromToken)[0];
    const fromTokenSymbol = Object.keys(pair.fromToken)[0];
    const toTokenSymbol = Object.keys(pair.toToken)[0];
    const isFromTokenMultiToken = getIsMultiConverter(fromTokenBlockchainId);
    const isToTokenMultiToken = getIsMultiConverter(toTokenBlockchainId);
    const converterBlockchainId = Object.values(pair.converterBlockchainId)[0];
    let reserveSymbol;
    if (isFromTokenMultiToken)
        reserveSymbol = fromTokenSymbol;
    if (isToTokenMultiToken)
        reserveSymbol = toTokenSymbol;

    const reserves = await getReservesFromCode(converterBlockchainId, reserveSymbol);
    const reservesContacts = reserves.rows.map(res => res.contract);
    const fee = await getConverterFeeFromSettings(converterBlockchainId);
    const isConversionFromSmartToken = isFromSmartToken(pair, reservesContacts);
    const balanceFrom = isToTokenMultiToken ? await getReserveBalances(converterBlockchainId, toTokenSymbol, 'reserves') : await getReserveBalances(fromTokenBlockchainId, converterBlockchainId);
    const balanceTo = isFromTokenMultiToken ? await getReserveBalances(converterBlockchainId, fromTokenSymbol, 'reserves') : await getReserveBalances(toTokenBlockchainId, converterBlockchainId);
    const isConversionToSmartToken = isToSmartToken(pair, reservesContacts);
    let amountWithoutFee = 0;
    let magnitude = 0;
    const balanceObject = { [fromTokenBlockchainId]: balanceFrom.rows[0].balance, [toTokenBlockchainId]: balanceTo.rows[0].balance };
    const converterReserves = {};
    reserves.rows.map((reserve: Reserve) => {
        converterReserves[reserve.contract] = { ratio: reserve.ratio, balance: balanceObject[reserve.contract] };
    });

    if (isConversionFromSmartToken) {
        const token = pathJson.smartTokens[fromTokenBlockchainId] || pathJson.convertibleTokens[fromTokenBlockchainId];
        const tokenSymbol = Object.keys(token[fromTokenSymbol])[0];
        const tokenSupplyObj = await getSmartTokenSupply(fromTokenBlockchainId, tokenSymbol);
        const toReserveRatio = converterReserves[toTokenBlockchainId].ratio;
        const tokenSupply = getBalance(tokenSupplyObj.rows[0].supply);
        const reserveTokenBalance = getBalance(balanceTo.rows[0].balance);
        amountWithoutFee = sellSmartToken(reserveTokenBalance, toReserveRatio, amount, tokenSupply);
        magnitude = 1;
    }

    else if (isConversionToSmartToken) {
        const token = pathJson.smartTokens[toTokenBlockchainId] || pathJson.convertibleTokens[toTokenBlockchainId];
        const tokenSymbol = Object.keys(token[toTokenSymbol])[0];
        const tokenSupplyObj = await getSmartTokenSupply(toTokenBlockchainId, tokenSymbol);
        const toReserveRatio = converterReserves[fromTokenBlockchainId].ratio;
        const tokenSupply = getBalance(tokenSupplyObj.rows[0].supply);
        const reserveTokenBalance = getBalance(balanceFrom.rows[0].balance);
        amountWithoutFee = buySmartToken(reserveTokenBalance, toReserveRatio, amount, tokenSupply);
        magnitude = 1;
    }
    else {
        amountWithoutFee = shortConvert(amount, getBalance(converterReserves[toTokenBlockchainId].balance), getBalance(converterReserves[fromTokenBlockchainId].balance));
        magnitude = 2;
    }

    if (fee == 0)
        return amountWithoutFee;

    return returnWithFee(amountWithoutFee, fee, magnitude);
}

export async function getConverterBlockchainId(token: Token) {
    const isSmart = !pathJson.convertibleTokens[token.blockchainId];
    return pathJson[isSmart ? 'smartTokens' : 'convertibleTokens'][token.blockchainId][token.symbol];
}

export async function getReserveBlockchainId(reserves: Token[], position) {
    const blockchainId = reserves[position].blockchainId;
    const symbol = reserves[position].symbol;
    const tok: Token = {
        blockchainType: 'eos',
        blockchainId,
        symbol
    };

    return tok;
}

export async function getReserves(converterBlockchainId, symbol, isMulti = false) {
    const reserves = await getReservesFromCode(converterBlockchainId, isMulti ? symbol : null);
    const tokens = [];
    reserves.rows.map(reserve => {
        const symbol = getSymbol(reserve.currency);

        tokens.push({ symbol, blockchainId: reserve.contract });
    });
    return { reserves: tokens };
}

export async function getReservesCount(reserves: Token[]) {
    return reserves.length;
}
