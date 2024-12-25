import { Context } from "telegraf";

export enum API {
  CG_COIN_LIST = "https://api.coingecko.com/api/v3/coins/list?include_platform=false",
  CG_CRYPTO_DATA = "https://api.coingecko.com/api/v3/coins/",
  CG_CRYPTO_DATA_TAIL = "?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false",
}

export interface MyContext extends Context {}

export type Coin = {
  id: string;
  symbol: string;
  name: string;
};
