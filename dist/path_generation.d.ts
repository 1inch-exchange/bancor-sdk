export declare type BlockchainType = 'ethereum' | 'eos';
export interface ConversionPathsTokens {
    from: Token;
    to: Token;
}
export interface ConversionPath {
    type: BlockchainType;
    path: string[] | ConversionToken[];
}
export interface ConversionToken {
    [key: string]: string;
}
export interface ConversionPathStep {
    converterBlockchainId: string | ConversionToken;
    fromToken: string | ConversionToken;
    toToken: string | ConversionToken;
}
export interface ConversionPaths {
    paths: ConversionPath[];
}
export interface Token {
    blockchainType: BlockchainType;
    blockchainId: string;
    symbol?: string;
}
export declare function generatePathByBlockchainIds(sourceToken: Token, targetToken: Token): Promise<ConversionPaths>;
