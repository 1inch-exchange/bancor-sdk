/* eslint-disable max-len */
/* eslint-disable no-sync */
/* eslint-disable prefer-reflect */
import Web3 from 'web3';
import { BancorConverterV9 } from './contracts/BancorConverterV9';
import { fromWei, toWei } from './utils';
import { ConversionPathStep, Token } from '../../path_generation';
import { BancorConverter } from './contracts/BancorConverter';
import { ContractRegistry } from './contracts/ContractRegistry';
import { BancorConverterRegistry } from './contracts/BancorConverterRegistry';
import { BancorNetwork } from './contracts/BancorNetwork';
import { SmartToken } from './contracts/SmartToken';
import { ERC20Token } from './contracts/ERC20Token';

const ETHBlockchainId = '0xc0829421c1d260bd3cb3e0f06cfe2d52db2ce315';
const BNTBlockchainId = '0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C';
let web3;
let bancorConverter = BancorConverter;
let contractRegistry = ContractRegistry;
let registryAbi = BancorConverterRegistry;
let networkAbi = BancorNetwork;
let registry;
let network;

export async function init(ethereumNodeUrl, ethereumContractRegistryAddress = '0xf078b4ec84e5fc57c693d43f1f4a82306c9b88d6') {
    web3 = new Web3(ethereumNodeUrl);
    const contractRegistryContract = new web3.eth.Contract(contractRegistry, ethereumContractRegistryAddress);
    const registryBlockchainId = await contractRegistryContract.methods.addressOf(Web3.utils.asciiToHex('BancorConverterRegistry')).call();
    const networkBlockchainId = await contractRegistryContract.methods.addressOf(Web3.utils.asciiToHex('BancorNetwork')).call();
    registry = new web3.eth.Contract(registryAbi, registryBlockchainId);
    network = new web3.eth.Contract(networkAbi, networkBlockchainId);
}

export async function deinit() {
    if (web3 && web3.currentProvider.constructor.name == 'WebsocketProvider')
        web3.currentProvider.connection.close();
}

export const getAmountInTokenWei = async (token: string, amount: string, web3) => {
    const decimals = await getTokenDecimals(token);
    return toWei(amount, decimals);
};

export const getConversionReturn = async (converterPair: ConversionPathStep, amount: string, ABI, web3) => {
    let converterContract = new web3.eth.Contract(ABI, converterPair.converterBlockchainId);
    const returnAmount = await converterContract.methods.getReturn(converterPair.fromToken, converterPair.toToken, amount).call();
    return returnAmount;
};

export const getTokenDecimals = async tokenBlockchainId => {
    let tokenDecimals = {
        '0xe0b7927c4af23765cb51314a0e0521a9645f0e2a': '9',
        '0xbdeb4b83251fb146687fa19d1c660f99411eefe3': '18'
    };

    if (tokenBlockchainId.toLowerCase() in tokenDecimals)
        return tokenDecimals[tokenBlockchainId.toLowerCase()];

    const token = new web3.eth.Contract(ERC20Token, tokenBlockchainId);
    return await token.methods.decimals().call();
};

export async function getPathStepRate(converterPair: ConversionPathStep, amount: string) {
    let amountInTokenWei = await getAmountInTokenWei((converterPair.fromToken as string), amount, web3);
    const tokenBlockchainId = converterPair.toToken;
    const tokenDecimals = await getTokenDecimals(tokenBlockchainId);
    try {
        const returnAmount = await getConversionReturn(converterPair, amountInTokenWei, bancorConverter, web3);
        amountInTokenWei = returnAmount['0'];
    }
    catch (e) {
        if (e.message.includes('insufficient data for uint256'))
            amountInTokenWei = await getConversionReturn(converterPair, amountInTokenWei, BancorConverterV9, web3);

        else throw (e);
    }
    return fromWei(amountInTokenWei, tokenDecimals);
}

export async function getRegistry() {
    const contractRegistryContract = new web3.eth.Contract(contractRegistry, '0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4');
    const registryBlockchainId = await contractRegistryContract.methods.addressOf(Web3.utils.asciiToHex('BancorConverterRegistry')).call();
    return new web3.eth.Contract(registryAbi, registryBlockchainId);
}

export const getConverterBlockchainId = async blockchainId => {
    const tokenContract = new web3.eth.Contract(SmartToken, blockchainId);
    return await tokenContract.methods.owner().call();
};

export function getSourceAndTargetTokens(srcToken: string, trgToken: string) {
    const isSourceETH = (srcToken || BNTBlockchainId).toLocaleLowerCase() == ETHBlockchainId.toLocaleLowerCase();
    const sourceToken = isSourceETH ? BNTBlockchainId : (srcToken || BNTBlockchainId);
    const targetToken = trgToken == ETHBlockchainId ? BNTBlockchainId : (trgToken || BNTBlockchainId);

    return {
        srcToken: sourceToken,
        trgToken: targetToken
    };
}

export async function getReserves(converterBlockchainId) {
    const reserves = new web3.eth.Contract(bancorConverter, converterBlockchainId);
    return { reserves };
}

export async function getReservesCount(reserves) {
    return await getTokenCount(reserves, 'connectorTokenCount');
}

export async function getReserveBlockchainId(converter, position) {
    const blockchainId = await converter.methods.connectorTokens(position).call();
    const returnValue: Token = {
        blockchainType: 'ethereum',
        blockchainId
    };

    return returnValue;
}

export async function getConverterSmartToken(converter) {
    return await converter.methods.token().call();
}

async function getTokenCount(converter: any, funcName: string) {
    let response = null;
    try {
        response = await converter.methods[funcName]().call();
        return response;
    }
    catch (error) {
        if (!error.message.startsWith('Invalid JSON RPC response')) {
            response = 0;
            return response;
        }
    }
}

export async function getReserveToken(converterContract, i) {
    const blockchainId = await converterContract.methods.connectorTokens(i).call();
    const token: Token = {
        blockchainType: 'ethereum',
        blockchainId
    };
    return token;
}

export async function getSmartTokens(token: Token) {
    const isSmartToken = await registry.methods.isSmartToken(token.blockchainId).call();
    const smartTokens = isSmartToken ? [token.blockchainId] : await registry.methods.getConvertibleTokenSmartTokens(token.blockchainId).call();
    return smartTokens;
}

function registryDataUpdate(registryData, key, value) {
    if (registryData[key] == undefined)
        registryData[key] = [value];
    else if (!registryData[key].includes(value))
        registryData[key].push(value);
}

function getAllPathsRecursive(paths, path, targetToken, registryData) {
    const prevToken = path[path.length - 1];
    if (prevToken == targetToken)
        paths.push(path);
    else for (const nextToken of registryData[prevToken].filter(token => !path.includes(token)))
        getAllPathsRecursive(paths, [...path, nextToken], targetToken, registryData);
}

export async function getAllPathsAndRates(sourceToken, targetToken, amount) {
    const MULTICALL_ABI = [{"constant":false,"inputs":[{"components":[{"internalType":"address","name":"target","type":"address"},{"internalType":"bytes","name":"callData","type":"bytes"}],"internalType":"struct Multicall.Call[]","name":"calls","type":"tuple[]"},{"internalType":"bool","name":"strict","type":"bool"}],"name":"aggregate","outputs":[{"internalType":"uint256","name":"blockNumber","type":"uint256"},{"components":[{"internalType":"bool","name":"success","type":"bool"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"struct Multicall.Return[]","name":"returnData","type":"tuple[]"}],"payable":false,"stateMutability":"nonpayable","type":"function"}];
    const MULTICALL_ADDRESS = '0x5Eb3fa2DFECdDe21C950813C665E9364fa609bD2';
    const multicall = new web3.eth.Contract(MULTICALL_ABI, MULTICALL_ADDRESS);

    const convertibleTokens = await registry.methods.getConvertibleTokens().call();
    const calls = convertibleTokens.map(convertibleToken => [registry._address, registry.methods.getConvertibleTokenSmartTokens(convertibleToken).encodeABI()]);
    const [blockNumber, returnData] = await multicall.methods.aggregate(calls, true).call();

    const registryData = {};

    for (let i = 0; i < returnData.length; i++) {
        for (const smartToken of Array.from(Array((returnData[i].data.length - 130) / 64).keys()).map(n => Web3.utils.toChecksumAddress(returnData[i].data.substr(64 * n + 154, 40)))) {
            if (convertibleTokens[i] != smartToken) {
                registryDataUpdate(registryData, convertibleTokens[i], smartToken);
                registryDataUpdate(registryData, smartToken, convertibleTokens[i]);
            }
        }
    }

    const paths = [];
    getAllPathsRecursive(paths, [Web3.utils.toChecksumAddress(sourceToken)], Web3.utils.toChecksumAddress(targetToken), registryData);

    const sourceDecimals = await getDecimals(sourceToken);
    const targetDecimals = await getDecimals(targetToken);
    const rates = await getRates(multicall, paths, toWei(amount, sourceDecimals));
    return [paths, rates.map(rate => fromWei(rate, targetDecimals))];
}

const getDecimals = async function(token) {
    return await getTokenDecimals(token);
};

const getRates = async function(multicall, paths, amount) {
    const calls = paths.map(path => [network._address, network.methods.getReturnByPath(path, amount).encodeABI()]);
    const [blockNumber, returnData] = await multicall.methods.aggregate(calls, false).call();
    return returnData.map(item => item.success ? Web3.utils.toBN(item.data.substr(0, 66)).toString() : "0");
};
