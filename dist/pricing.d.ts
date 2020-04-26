import { SDKModule } from './sdk_module';
import { Token } from './types';
/**
 * The Pricing module provides access to pricing and rates logic for tokens in the bancor network
 */
export declare class Pricing extends SDKModule {
    /**
    * returns the best conversion path for a given pair of tokens in the bancor network, along with its rate
    * this function currently does not support tokens of different blockchains; use `getRateByPath` instead
    *
    * @param sourceToken    source token
    * @param targetToken    target token
    * @param amount         input amount
    *
    * @returns  the best conversion path between the source token and the target token, along with the output amount
    */
    getRate(sourceToken: Token, targetToken: Token, amount?: string): Promise<{
        path: Token[];
        rate: string;
    }>;
    /**
    * returns the rate for a given conversion path in the bancor network
    *
    * @param path    conversion path
    * @param amount  input amount
    *
    * @returns  output amount for a conversion on the given path
    */
    getRateByPath(path: Token[], amount?: string): Promise<string>;
}
