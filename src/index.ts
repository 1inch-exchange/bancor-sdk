import { init as initEthereum, getConverterBlockchainId, getPathStepRate as getEthPathStepRate } from './blockchains/ethereum/index';
import { buildPathsFile, initEOS, getPathStepRate as getEOSPathStepRate, isMultiConverter } from './blockchains/eos';
import { Token, Contract, generatePathByBlockchainIds, ConversionPaths, ConversionPathStep, BlockchainType, ConversionToken } from './path_generation';
import { run as fetch_conversion_events } from './blockchains/ethereum/fetch_conversion_events';
import { run as retrieve_contract_version } from './blockchains/ethereum/retrieve_contract_version';
import { timestampToBlockNumber } from './blockchains/ethereum/utils';

interface Settings {
    ethereumNodeEndpoint: string;
    eosNodeEndpoint: string;
    ethereumContractRegistryAddress?: string;
}

export async function init(args: Settings) {
    if (args.eosNodeEndpoint)
        initEOS(args.eosNodeEndpoint);
    if (args.ethereumNodeEndpoint)
        await initEthereum(args.ethereumNodeEndpoint, args.ethereumContractRegistryAddress);
}

export async function generateEosPaths() {
    await buildPathsFile();
}

export async function generatePath(sourceToken: Token, targetToken: Token) {
    return await generatePathByBlockchainIds(sourceToken, targetToken);
}

export const calculateRateFromPaths = async (paths: ConversionPaths, amount) => {
    if (paths.paths.length == 0) return amount;
    const rate = await calculateRateFromPath(paths, amount);
    paths.paths.shift();
    return calculateRateFromPaths(paths, rate);
};

export async function calculateRateFromPath(paths: ConversionPaths, amount) {
    const blockchainType: BlockchainType = paths.paths[0].type;
    const convertPairs = await getConverterPairs(paths.paths[0].path, blockchainType);
    let i = 0;
    while (i < convertPairs.length) {
        amount = blockchainType == 'ethereum' ? await getEthPathStepRate(convertPairs[i], amount) : await getEOSPathStepRate(convertPairs[i], amount);
        i += 1;
    }
    return amount;
}

async function getConverterPairs(path: string[] | object[], blockchainType: BlockchainType) {
    const pairs: ConversionPathStep[] = [];
    for (let i = 0; i < path.length - 1; i += 2) {
        let converterBlockchainId = blockchainType == 'ethereum' ? await getConverterBlockchainId(path[i + 1]) : path[i + 1];
        pairs.push({ converterBlockchainId: converterBlockchainId, fromToken: (path[i] as string), toToken: (path[i + 2] as string) });
    }
    if (pairs.length == 0 && blockchainType == 'eos' && isMultiConverter(path[0])) {
        pairs.push({
            converterBlockchainId: (path[0] as ConversionToken), fromToken: (path[0] as ConversionToken), toToken: (path[0] as ConversionToken)
        });
    }
    return pairs;
}

export const getRateByPath = async (paths: ConversionPaths, amount) => {
    return await calculateRateFromPaths(paths, amount);
};

export async function getRate(sourceToken: Token, targetToken: Token, amount: string) {
    const paths = await generatePath(sourceToken, targetToken);
    return await getRateByPath(paths, amount);
}

export async function fetchConversionEvents(nodeAddress, token: Token, fromBlock, toBlock) {
    if (token.blockchainType == 'ethereum')
        return await fetch_conversion_events(nodeAddress, token.blockchainId, fromBlock, toBlock);
    throw new Error(token.blockchainType + ' blockchain not supported');
}

export async function fetchConversionEventsByTimestamp(nodeAddress, token: Token, fromTimestamp, toTimestamp) {
    if (token.blockchainType == 'ethereum') {
        const fromBlock = await timestampToBlockNumber(nodeAddress, fromTimestamp);
        const toBlock = await timestampToBlockNumber(nodeAddress, toTimestamp);
        return await fetch_conversion_events(nodeAddress, token.blockchainId, fromBlock, toBlock);
    }
    throw new Error(token.blockchainType + ' blockchain not supported');
}

export async function retrieveContractVersion(nodeAddress, contract: Contract) {
    if (contract.blockchainType == 'ethereum')
        return await retrieve_contract_version(nodeAddress, contract.blockchainId);
    throw new Error(contract.blockchainType + ' blockchain not supported');
}

export default {
    init,
    generateEosPaths,
    getRate,
    generatePath,
    getRateByPath,
    buildPathsFile,
    fetchConversionEvents,
    fetchConversionEventsByTimestamp,
    retrieveContractVersion
};
