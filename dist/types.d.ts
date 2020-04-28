/**
* blockchain types supported by the SDK
*/
export declare enum BlockchainType {
    Ethereum = "ethereum",
    EOS = "eos"
}
/**
* SDK initialization settings interface
*/
export interface Settings {
    ethereumNodeEndpoint?: string | Object;
    eosNodeEndpoint?: string;
}
/**
* Token interface
*/
export interface Token {
    blockchainType: BlockchainType;
    blockchainId: string;
    symbol?: string;
}
/**
* Converter interface
*/
export interface Converter {
    blockchainType: BlockchainType;
    blockchainId: string;
    symbol?: string;
}
/**
* ConversionEvent interface
*/
export interface ConversionEvent {
    blockNumber: number;
    sourceToken: string;
    targetToken: string;
    inputAmount: string;
    outputAmount: string;
    conversionFee?: string;
    trader: string;
}
/**
* Blockchain interface - defines the methods that each blockchain plugin should implement
*/
export interface Blockchain {
    getAnchorToken(): Token;
    getPaths(sourceToken: Token, targetToken: Token): Promise<Token[][]>;
    getRates(tokenPaths: Token[][], tokenAmount: string): Promise<string[]>;
    getConverterVersion(converter: Converter): Promise<string>;
    getConversionEvents(token: Token, fromBlock: number, toBlock: number): Promise<ConversionEvent[]>;
    getConversionEventsByTimestamp(token: Token, fromTimestamp: number, toTimestamp: number): Promise<ConversionEvent[]>;
}
