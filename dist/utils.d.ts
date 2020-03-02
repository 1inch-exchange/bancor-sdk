export declare function init(): void;
export declare function toWei(number: any, decimals: any): string;
export declare function fromWei(number: any, decimals: any): string;
export declare function calculatePurchaseReturn(supply: any, reserveBalance: any, reserveRatio: any, depositAmount: any): any;
export declare function calculateSaleReturn(supply: any, reserveBalance: any, reserveRatio: any, sellAmount: any): any;
export declare function calculateCrossReserveReturn(fromReserveBalance: any, fromReserveRatio: any, toReserveBalance: any, toReserveRatio: any, amount: any): any;
export declare function calculateFundCost(supply: any, reserveBalance: any, totalRatio: any, amount: any): any;
export declare function calculateLiquidateReturn(supply: any, reserveBalance: any, totalRatio: any, amount: any): any;
export declare function getFinalAmount(amount: any, conversionFee: any, magnitude: any): any;
