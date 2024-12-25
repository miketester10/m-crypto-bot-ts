import axios, { AxiosResponse } from "axios";
import { differenceInMinutes } from "date-fns";
import { API, Coin } from "./types/types";

class CoinHandler {
  private static _instance: CoinHandler;
  private delta: number = 20; // minutes
  public coin_list: Coin[] | [] = [];
  public coin_last_update: Date = new Date("2024-01-01");

  private constructor() {}

  public static getInstance(): CoinHandler {
    if (!CoinHandler._instance) {
      CoinHandler._instance = new CoinHandler();
    }
    return CoinHandler._instance;
  }

  public async update_coin_list_from_CG(): Promise<boolean> {
    if (this.should_update()) {
      try {
        const response: AxiosResponse<Coin[]> = await axios.get(
          API.CG_COIN_LIST
        );
        this.coin_list = response.data;
        this.coin_last_update = new Date();
        const excluded_values = [
          "-peg-",
          "-wormhole",
          "wrapped",
          "oec-",
          "-iou",
          "harrypotter",
          "blackrocktradingcurrency",
        ];
        this.coin_list = this.coin_list.filter((coin) => {
          for (const value of excluded_values) {
            if (coin.id.includes(value)) {
              return false;
            }
          }
          return true;
        });
        console.log("Reloaded coin list from CoinGecko API");
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    }

    console.log(`ANCORA NON SONO TRASCORSI ${this.delta} MINUTI`);
    return false;
  }

  public async update_coin_list_from_CMC(
    CMC_PRO_API_KEY: string
  ): Promise<void> {
    if (this.should_update()) {
      this.coin_last_update = new Date();
      console.log("AGGIONAMENTO COIN LIST DA CMC AVVENUTO");
      return;
    }
    console.log(`ANCORA NON SONO TRASCORSI ${this.delta} MINUTI`);
  }

  private should_update(): boolean {
    return differenceInMinutes(new Date(), this.coin_last_update) > this.delta;
  }
}

export { CoinHandler };
