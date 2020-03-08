import Web3 from 'web3';
import { Token, Converter } from '../../path_generation';
export declare class Ethereum {
    web3: Web3;
    networkType: string;
    bancorNetwork: Web3.eth.Contract;
    converterRegistry: Web3.eth.Contract;
    multicallContract: Web3.eth.Contract;
    decimals: {};
    static create(nodeEndpoint: string): Promise<Ethereum>;
    static destroy(ethereum: Ethereum): Promise<void>;
    getAnchorToken(): string;
    getRateByPath(path: Token[], amount: string): Promise<string>;
    getAllPathsAndRates(sourceToken: any, targetToken: any, amount: any): Promise<any[]>;
    getConverterVersion(converter: Converter): Promise<string>;
    getConversionEvents(token: Token, fromBlock: number, toBlock: number): Promise<object[]>;
    getConversionEventsByTimestamp(token: Token, fromTimestamp: number, toTimestamp: number): Promise<object[]>;
}
export declare const getWeb3: (nodeEndpoint: any) => any;
export declare const getContractAddresses: (ethereum: any) => any;
export declare const getReturn: (ethereum: any, path: any, amount: any) => Promise<any>;
export declare const getDecimals: (ethereum: any, token: any) => Promise<any>;
export declare const getRates: (ethereum: any, paths: any, amount: any) => Promise<any>;
export declare const getGraph: (ethereum: any) => Promise<{}>;
