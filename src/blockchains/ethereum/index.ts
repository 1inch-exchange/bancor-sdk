import Web3 from 'web3';
import * as abis from './abis';
import * as helpers from '../../helpers';
import * as conversionEvents from './conversion_events';
import * as converterVersion from './converter_version';
import { Token, Converter, ConversionEvent } from '../../types';
import { timestampToBlockNumber } from './timestamp_to_block_number';

const CONTRACT_ADDRESSES = {
    main: {
        registry: '0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4',
        multicall: '0x5Eb3fa2DFECdDe21C950813C665E9364fa609bD2',
        anchorToken: '0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C',
        pivotTokens: [
            '0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C',
            '0x309627af60F0926daa6041B8279484312f2bf060'
        ],
        nonStandardTokenDecimals: {
            '0xE0B7927c4aF23765Cb51314A0E0521A9645F0E2A': '9',
            '0xbdEB4b83251Fb146687fa19D1C660F99411eefe3': '18'
        }
    },
    ropsten: {
        registry: '0xFD95E724962fCfC269010A0c6700Aa09D5de3074',
        multicall: '0xf3ad7e31b052ff96566eedd218a823430e74b406',
        anchorToken: '0x62bd9D98d4E188e281D7B78e29334969bbE1053c',
        pivotTokens: [
            '0x62bd9D98d4E188e281D7B78e29334969bbE1053c'
        ],
        nonStandardTokenDecimals: {
        }
    },
    dummy: {
        registry: '0x0000000000000000000000000000000000000000',
        multicall: '0x0000000000000000000000000000000000000000',
        anchorToken: '0x0000000000000000000000000000000000000000',
        pivotTokens: [
        ],
        nonStandardTokenDecimals: {
        }
    }
};

export class Ethereum {
    web3: Web3;
    networkType: string;
    bancorNetwork: Web3.eth.Contract;
    converterRegistry: Web3.eth.Contract;
    multicallContract: Web3.eth.Contract;
    decimals: object;
    graph: object;
    trees: object;
    getPathsFunc: (sourceToken: string, targetToken: string) => string[][];

    static async create(nodeEndpoint: string | Object): Promise<Ethereum> {
        const ethereum = new Ethereum();
        ethereum.web3 = getWeb3(nodeEndpoint);
        ethereum.networkType = await ethereum.web3.eth.net.getNetworkType();
        const contractRegistry = new ethereum.web3.eth.Contract(abis.ContractRegistry, getContractAddresses(ethereum).registry);
        const bancorNetworkAddress = await contractRegistry.methods.addressOf(Web3.utils.asciiToHex('BancorNetwork')).call();
        const converterRegistryAddress = await contractRegistry.methods.addressOf(Web3.utils.asciiToHex('BancorConverterRegistry')).call();
        ethereum.bancorNetwork = new ethereum.web3.eth.Contract(abis.BancorNetwork, bancorNetworkAddress);
        ethereum.converterRegistry = new ethereum.web3.eth.Contract(abis.BancorConverterRegistry, converterRegistryAddress);
        ethereum.multicallContract = new ethereum.web3.eth.Contract(abis.MulticallContract, getContractAddresses(ethereum).multicall);
        ethereum.decimals = {...CONTRACT_ADDRESSES[ethereum.networkType].nonStandardTokenDecimals};
        ethereum.getPathsFunc = ethereum.getSomePathsFunc;
        await ethereum.refresh();
        return ethereum;
    }

    static async destroy(ethereum: Ethereum): Promise<void> {
        if (ethereum.web3.currentProvider && ethereum.web3.currentProvider.constructor.name == 'WebsocketProvider')
            ethereum.web3.currentProvider.connection.close();
    }

    async refresh(): Promise<void> {
        this.graph = await getGraph(this);
        this.trees = await getTrees(this);
    }

    getAnchorToken(): string {
        return getContractAddresses(this).anchorToken;
    }

    async getRateByPath(path: Token[], amount: string): Promise<string> {
        const tokens = path.map(token => token.blockchainId);
        const sourceDecimals = await getDecimals(this, tokens[0]);
        const targetDecimals = await getDecimals(this, tokens[tokens.length - 1]);
        amount = helpers.toWei(amount, sourceDecimals);
        amount = await getReturn(this, tokens, amount);
        amount = helpers.fromWei(amount, targetDecimals);
        return amount;
    }

    async getAllPathsAndRates(sourceToken, targetToken, amount) {
        sourceToken = Web3.utils.toChecksumAddress(sourceToken);
        targetToken = Web3.utils.toChecksumAddress(targetToken);
        const paths = this.getPathsFunc(sourceToken, targetToken);
        const sourceDecimals = await getDecimals(this, sourceToken);
        const targetDecimals = await getDecimals(this, targetToken);
        const rates = await getRatesSafe(this, paths, helpers.toWei(amount, sourceDecimals));
        return [paths, rates.map(rate => helpers.fromWei(rate, targetDecimals))];
    }

    async getConverterVersion(converter: Converter): Promise<string> {
        return (await converterVersion.get(this.web3, converter.blockchainId)).value;
    }

    async getConversionEvents(token: Token, fromBlock: number, toBlock: number): Promise<ConversionEvent[]> {
        return await conversionEvents.get(this.web3, this.decimals, token.blockchainId, fromBlock, toBlock);
    }

    async getConversionEventsByTimestamp(token: Token, fromTimestamp: number, toTimestamp: number): Promise<ConversionEvent[]> {
        const fromBlock = await timestampToBlockNumber(this.web3, fromTimestamp);
        const toBlock = await timestampToBlockNumber(this.web3, toTimestamp);
        return await conversionEvents.get(this.web3, this.decimals, token.blockchainId, fromBlock, toBlock);
    }

    getAllPathsFunc(sourceToken: string, targetToken: string): string[][] {
        const paths = [];
        const tokens = [Web3.utils.toChecksumAddress(sourceToken)];
        const destToken = Web3.utils.toChecksumAddress(targetToken);
        getAllPathsRecursive(paths, this.graph, tokens, destToken);
        return paths;
    }

    getSomePathsFunc(sourceToken: string, targetToken: string): string[][] {
        const commonTokens = this.graph[sourceToken].filter(token => this.graph[targetToken].includes(token));
        const paths = commonTokens.map(commonToken => [sourceToken, commonToken, targetToken]);
        const pivotTokens = getContractAddresses(this).pivotTokens;
        for (const pivotToken1 of pivotTokens) {
            for (const pivotToken2 of pivotTokens) {
                const sourcePath = getOnePathRecursive(this.trees[pivotToken1], sourceToken);
                const middlePath = getOnePathRecursive(this.trees[pivotToken2], pivotToken1);
                const targetPath = getOnePathRecursive(this.trees[pivotToken2], targetToken);
                paths.push(getMergedPath(sourcePath.concat(middlePath.slice(1)), targetPath));
            }
        }
        return Array.from(new Set<string>(paths.map(path => path.join(',')))).map(path => path.split(','));
    }
}

export const getWeb3 = function(nodeEndpoint) {
    const web3 = new Web3();
    web3.setProvider(nodeEndpoint);
    return web3;
};

export const getContractAddresses = function(ethereum) {
    if (CONTRACT_ADDRESSES[ethereum.networkType])
        return CONTRACT_ADDRESSES[ethereum.networkType];
    throw new Error(ethereum.networkType + ' network not supported');
};

export const getReturn = async function(ethereum, path, amount) {
    return (await ethereum.bancorNetwork.methods.getReturnByPath(path, amount).call())['0'];
};

export const getDecimals = async function(ethereum, token) {
    if (ethereum.decimals[token] == undefined) {
        const tokenContract = new ethereum.web3.eth.Contract(abis.ERC20Token, token);
        ethereum.decimals[token] = await tokenContract.methods.decimals().call();
    }
    return ethereum.decimals[token];
};

export const getRatesSafe = async function(ethereum, paths, amount) {
    try {
        return await getRates(ethereum, paths, amount);
    }
    catch (error) {
        const mid = paths.length >> 1;
        const arr1 = await getRatesSafe(ethereum, paths.slice(0, mid), amount);
        const arr2 = await getRatesSafe(ethereum, paths.slice(mid, paths.length), amount);
        return [...arr1, ...arr2];
    }
}

export const getRates = async function(ethereum, paths, amount) {
    const calls = paths.map(path => [ethereum.bancorNetwork._address, ethereum.bancorNetwork.methods.getReturnByPath(path, amount).encodeABI()]);
    const [blockNumber, returnData] = await ethereum.multicallContract.methods.aggregate(calls, false).call();
    return returnData.map(item => item.success ? Web3.utils.toBN(item.data.substr(0, 66)).toString() : '0');
};

export const getGraph = async function(ethereum) {
    const graph = {};

    const convertibleTokens = await ethereum.converterRegistry.methods.getConvertibleTokens().call();
    const calls = convertibleTokens.map(convertibleToken => [ethereum.converterRegistry._address, ethereum.converterRegistry.methods.getConvertibleTokenSmartTokens(convertibleToken).encodeABI()]);
    const [blockNumber, returnData] = await ethereum.multicallContract.methods.aggregate(calls, true).call();

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

export const getTrees = async function(ethereum) {
    const trees = {};

    for (const pivotToken of getContractAddresses(ethereum).pivotTokens)
        trees[pivotToken] = getTree(ethereum.graph, pivotToken);

    return trees;
};

function updateGraph(graph, key, value) {
    if (graph[key] == undefined)
        graph[key] = [value];
    else if (!graph[key].includes(value))
        graph[key].push(value);
}

function getTree(graph, root) {
    const tree = {[root]: null};
    const queue = [root];
    while (queue.length > 0) {
        const dst = queue.shift();
        for (const src of graph[dst].filter(node => tree[node] === undefined)) {
            tree[src] = dst;
            queue.push(src);
        }
    }
    return tree;
}

function getAllPathsRecursive(paths, graph, tokens, destToken) {
    const prevToken = tokens[tokens.length - 1];
    if (prevToken == destToken)
        paths.push(tokens);
    else for (const nextToken of graph[prevToken].filter(token => !tokens.includes(token)))
        getAllPathsRecursive(paths, graph, [...tokens, nextToken], destToken);
}

function getOnePathRecursive(tree, token) {
    if (tree[token])
        return [token, ...getOnePathRecursive(tree, tree[token])];
    return [token];
}

function getMergedPath(sourcePath, targetPath) {
    if (sourcePath.length > 0 && targetPath.length > 0) {
        let i = sourcePath.length - 1;
        let j = targetPath.length - 1;
        while (i >= 0 && j >= 0 && sourcePath[i] == targetPath[j]) {
            i--;
            j--;
        }

        const path = [];
        for (let m = 0; m <= i + 1; m++)
            path.push(sourcePath[m]);
        for (let n = j; n >= 0; n--)
            path.push(targetPath[n]);

        let length = 0;
        for (let p = 0; p < path.length; p += 1) {
            for (let q = p + 2; q < path.length - p % 2; q += 2) {
                if (path[p] == path[q])
                    p = q;
            }
            path[length++] = path[p];
        }

        return path.slice(0, length);
    }

    return [];
}
