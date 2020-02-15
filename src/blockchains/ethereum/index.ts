import Web3 from 'web3';

import { ContractRegistry } from './contracts/ContractRegistry';
import { BancorConverter } from './contracts/BancorConverter';
import { BancorConverterV9 } from './contracts/BancorConverterV9';
import { BancorConverterRegistry } from './contracts/BancorConverterRegistry';
import { ERC20Token } from './contracts/ERC20Token';
import { SmartToken } from './contracts/SmartToken';

import * as utils from './utils';
import * as retrieve_converter_version from './retrieve_converter_version';
import * as fetch_conversion_events from './fetch_conversion_events';

const CONTRACT_ADDRESSES = {
    main: {
        registry: '0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4',
        multicall: '0x5Eb3fa2DFECdDe21C950813C665E9364fa609bD2',
        anchorToken: '0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C',
    },
    ropsten: {
        registry: '0xFD95E724962fCfC269010A0c6700Aa09D5de3074',
        multicall: '0xf3ad7e31b052ff96566eedd218a823430e74b406',
        anchorToken: '0x62bd9D98d4E188e281D7B78e29334969bbE1053c',
    }
};

const MULTICALL_CONTRACT_ABI = [{"constant":false,"inputs":[{"components":[{"internalType":"address","name":"target","type":"address"},{"internalType":"bytes","name":"callData","type":"bytes"}],"internalType":"struct Multicall.Call[]","name":"calls","type":"tuple[]"},{"internalType":"bool","name":"strict","type":"bool"}],"name":"aggregate","outputs":[{"internalType":"uint256","name":"blockNumber","type":"uint256"},{"components":[{"internalType":"bool","name":"success","type":"bool"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"struct Multicall.Return[]","name":"returnData","type":"tuple[]"}],"payable":false,"stateMutability":"nonpayable","type":"function"}];

export {
    init,
    getAnchorToken,
    getConversionRate,
    getAllPaths,
    retrieveConverterVersion,
    fetchConversionEvents,
    fetchConversionEventsByTimestamp
};

let web3;
let networkType;
let converterRegistryAddress;

async function init(nodeAddress) {
    web3 = new Web3(new Web3.providers.HttpProvider(nodeAddress));
    networkType = await web3.eth.net.getNetworkType();
    const contractRegistry = new web3.eth.Contract(ContractRegistry, getContractAddresses().registry);
    converterRegistryAddress = await contractRegistry.methods.addressOf(Web3.utils.asciiToHex('BancorConverterRegistry')).call();
}

function getAnchorToken() {
    return getContractAddresses().anchorToken;
}

async function getConversionRate(smartToken, fromToken, toToken, amount) {
    const inputAmount = await toWei(fromToken, amount);
    try {
        const outputAmount = await getReturn(smartToken, BancorConverter, fromToken, toToken, inputAmount);
        return await fromWei(toToken, outputAmount['0']);
    }
    catch (error) {
        if (!error.message.includes('insufficient data for uint256'))
            throw error;
        const outputAmount = await getReturn(smartToken, BancorConverterV9, fromToken, toToken, inputAmount);
        return await fromWei(toToken, outputAmount);
    }
}

async function getAllPaths(sourceToken, targetToken) {
    const paths = [];
    const graph = await getGraph();
    getAllPathsRecursive(paths, graph, [sourceToken], targetToken);
    return paths;
}

async function retrieveConverterVersion(converter) {
    return await retrieve_converter_version.run(web3, converter);
}

async function fetchConversionEvents(token, fromBlock, toBlock) {
    return await fetch_conversion_events.run(web3, token, fromBlock, toBlock);
}

async function fetchConversionEventsByTimestamp(token, fromTimestamp, toTimestamp) {
    const fromBlock = await utils.timestampToBlockNumber(web3, fromTimestamp);
    const toBlock = await utils.timestampToBlockNumber(web3, toTimestamp);
    return await fetch_conversion_events.run(web3, token, fromBlock, toBlock);
}

export const getContractAddresses = function() {
    if (CONTRACT_ADDRESSES.hasOwnProperty(networkType))
        return CONTRACT_ADDRESSES[networkType];
    throw new Error(networkType + ' network not supported');
};

export const toWei = async function(token, amount) {
    const tokenContract = new web3.eth.Contract(ERC20Token, token);
    const decimals = await tokenContract.methods.decimals().call();
    return utils.toWei(amount, decimals);
};

export const fromWei = async function(token, amount) {
    const tokenContract = new web3.eth.Contract(ERC20Token, token);
    const decimals = await tokenContract.methods.decimals().call();
    return utils.fromWei(amount, decimals);
};

export const getReturn = async function(smartToken, converterABI, fromToken, toToken, amount) {
    const tokenContract = new web3.eth.Contract(SmartToken, smartToken);
    const converter = await tokenContract.methods.owner().call();
    const converterContract = new web3.eth.Contract(converterABI, converter);
    return await converterContract.methods.getReturn(fromToken, toToken, amount).call();
};

export const getGraph = async function() {
    const graph = {};

    const multicallContract = new web3.eth.Contract(MULTICALL_CONTRACT_ABI, getContractAddresses().multicall);
    const converterRegistry = new web3.eth.Contract(BancorConverterRegistry, converterRegistryAddress);

    const convertibleTokens = await converterRegistry.methods.getConvertibleTokens().call();
    const calls = convertibleTokens.map(convertibleToken => [converterRegistry._address, converterRegistry.methods.getConvertibleTokenSmartTokens(convertibleToken).encodeABI()]);
    const [blockNumber, returnData] = await multicallContract.methods.aggregate(calls, true).call();

    for (let i = 0; i < returnData.length; i++) {
        for (const smartToken of Array.from(Array((returnData[i].data.length - 130) / 64).keys()).map(n => Web3.utils.toChecksumAddress(returnData[i].data.substr(64 * n + 154, 40)))) {
            if (convertibleTokens[i] != smartToken) {
                updateGraph(graph, convertibleTokens[i], smartToken);
                updateGraph(graph, smartToken, convertibleTokens[i]);
            }
        }
    }

    return graph;
};

function updateGraph(graph, key, value) {
    if (graph[key] == undefined)
        graph[key] = [value];
    else if (!graph[key].includes(value))
        graph[key].push(value);
}

function getAllPathsRecursive(paths, graph, tokens, destToken) {
    const prevToken = tokens[tokens.length - 1];
    if (prevToken == destToken)
        paths.push(tokens);
    else for (const nextToken of graph[prevToken].filter(token => !tokens.includes(token)))
        getAllPathsRecursive(paths, graph, [...tokens, nextToken], destToken);
}
