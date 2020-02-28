export type BlockchainType = 'ethereum' | 'eos';

export interface Token {
    blockchainType: BlockchainType;
    blockchainId: string;
    symbol?: string;
}

export interface Converter {
    blockchainType: BlockchainType;
    blockchainId: string;
    symbol?: string;
}
