/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetTreasuryRevenue
// ====================================================

export interface GetTreasuryRevenue_treasuryRevenues {
  __typename: "TreasuryRevenue";
  id: string;
  timestamp: any;
  qiClamAmount: any;
  qiMarketValue: any;
  dystClamAmount: any;
  dystMarketValue: any;
  penClamAmount: any;
  penMarketValue: any;
  penDystClamAmount: any;
  penDystMarketValue: any;
  ottopiaClamAmount: any;
  ottopiaMarketValue: any;
  ldoClamAmount: any;
  ldoMarketValue: any;
  usdPlusClamAmount: any;
  usdPlusMarketValue: any;
  daiClamAmount: any;
  daiMarketValue: any;
  totalRevenueClamAmount: any;
  totalRevenueMarketValue: any;
}

export interface GetTreasuryRevenue {
  treasuryRevenues: GetTreasuryRevenue_treasuryRevenues[];
}
