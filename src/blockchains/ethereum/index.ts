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
import { SmartToken } from './contracts/SmartToken';
import { ERC20Token } from './contracts/ERC20Token';

const ETHBlockchainId = '0xc0829421c1d260bd3cb3e0f06cfe2d52db2ce315';
const BNTBlockchainId = '0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C';
let web3;
let bancorConverter = BancorConverter;
let contractRegistry = ContractRegistry;
let registryAbi = BancorConverterRegistry;
let registry;

export async function init(ethereumNodeUrl, ethereumContractRegistryAddress = '0xf078b4ec84e5fc57c693d43f1f4a82306c9b88d6') {
    web3 = new Web3(new Web3.providers.HttpProvider(ethereumNodeUrl));
    const contractRegistryContract = new web3.eth.Contract(contractRegistry, ethereumContractRegistryAddress);
    const registryBlockchainId = await contractRegistryContract.methods.addressOf(Web3.utils.asciiToHex('BancorConverterRegistry')).call(); // '0x85e27A5718382F32238497e78b4A40DD778ab847'
    registry = new web3.eth.Contract(registryAbi, registryBlockchainId);
}

export const getAmountInTokenWei = async (token: string | object, amount: string, web3) => {
    const tokenContract = new web3.eth.Contract(ERC20Token, token);
    const decimals = await tokenContract.methods.decimals().call();
    return toWei(amount, decimals);
};

export const getConversionReturn = async (converterPair: ConversionPathStep, amount: string, ABI, web3) => {
    let converterContract = new web3.eth.Contract(ABI, converterPair.converterBlockchainId);
    const returnAmount = await converterContract.methods.getReturn(converterPair.fromToken, converterPair.toToken, amount).call();
    return returnAmount;
};

export const getTokenDecimals = async tokenBlockchainId => {
    const token = new web3.eth.Contract(ERC20Token, tokenBlockchainId);
    return await token.methods.decimals().call();
};

export async function getPathStepRate(converterPair: ConversionPathStep, amount: string) {
    let amountInTokenWei = await getAmountInTokenWei(converterPair.fromToken, amount, web3);
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
