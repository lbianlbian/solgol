/**
 * 
 * @param {str} mktPubkey 
 * @returns filter object to use in getProgramAccounts call to get mktLiqAcc
 */
export function filterFactory(mktPubkey){
    return {
        filters: [
            {
                memcmp: {
                    offset: 0,
                    bytes: "2dK7qMscg4w"
                }
            },
            {
                memcmp: {
                    offset: 8,
                    bytes: mktPubkey
                }
            }
        ]
    };
}

export const mktLiqSchema = {
    struct: {
        market: { array: { type: 'u8', len: 32 } },     // fixed array of 32 u8
        enableCrossMatching: 'bool',                     // bool (same as u8 in Borsh, but use 'bool' here)
        stakeMatchedTotal: 'u64',
        liquiditiesFor: { 
            array: { 
                type: {
                    struct: {
                        outcome: 'u16',
                        price: 'f64',
                        sources: { 
                            array: { 
                                type: {
                                    struct: {
                                        outcome: 'u16',
                                        price: 'f64'
                                    }
                                }
                            } 
                        }, // dynamic array of LiquiditySource
                        liquidity: 'u64',
                    }
                }
            } 
        },   // dynamic array of MarketOutcomePriceLiquidity
        liquiditiesAgainst: { 
            array: { 
                type: {
                    struct: {
                        outcome: 'u16',
                        price: 'f64',
                        sources: { 
                            array: { 
                                type: {
                                    struct: {
                                        outcome: 'u16',
                                        price: 'f64'
                                    }
                                }
                            } 
                        }, // dynamic array of LiquiditySource
                        liquidity: 'u64',
                    }
                }
                
            } 
        },   // dynamic array of MarketOutcomePriceLiquidity
    }
};