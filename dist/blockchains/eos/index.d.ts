import { JsonRpc } from 'eosjs';
import { Blockchain, Converter, ConversionEvent, Token } from '../../types';
export declare class EOS implements Blockchain {
    jsonRpc: JsonRpc;
    static create(nodeEndpoint: string): Promise<EOS>;
    static destroy(eos: EOS): Promise<void>;
    refresh(): Promise<void>;
    getAnchorToken(): Token;
    getPaths(from: Token, to: Token): Promise<Token[][]>;
    getRateByPath(path: Token[], amount: string): Promise<string>;
    getRates(tokenPaths: Token[][], tokenAmount: string): Promise<string[]>;
    getConverterVersion(converter: Converter): Promise<string>;
    getConversionEvents(token: Token, fromBlock: number, toBlock: number): Promise<ConversionEvent[]>;
    getConversionEventsByTimestamp(token: Token, fromTimestamp: number, toTimestamp: number): Promise<ConversionEvent[]>;
    private getConverterSettings;
    private getSmartTokenStat;
    private getReserves;
    private getReserveBalance;
    private getReserve;
    private getBalance;
    private getSymbol;
    private getDecimals;
    private getConversionRate;
    private getTokenSmartTokens;
    private getPathToAnchor;
    private getShortestPath;
}
