import { Markup } from "telegraf";
import { CoinHandler } from "./shared";
import { API, Coin, MyContext } from "./types/types";
import { send_error } from "./errors";
import axios, { AxiosResponse } from "axios";
import { CG_CRYPO_DATA } from "./types/cg_crypto_data";
import { mk2Formatter } from "./utility";
import { create_chart } from "./chart";

const coin_handler = CoinHandler.getInstance();

const get_cg_id = (crypto_symbol: string): string[] => {
  const api_ids = [];
  for (const crypto of coin_handler.coin_list) {
    if (crypto.symbol === crypto_symbol) {
      api_ids.push(crypto.id);
    }
  }
  return api_ids;
};

const get_cg_coin_info = (coin_name: string): Coin => {
  let id = "";
  let symbol = "";
  let name = "";

  for (const crypto of coin_handler.coin_list) {
    if (coin_name === crypto.id) {
      id = crypto.id;
      symbol = crypto.symbol.toUpperCase();
      name = crypto.name;
    }
  }
  return { id, symbol, name };
};

const cg_coin_check = async (
  coin: string,
  ctx: MyContext,
  options?: { type: string }
): Promise<string | void> => {
  console.log(coin);
  const coin_type = options?.type;

  let coins_id = get_cg_id(coin);
  console.log(coins_id);

  if (coins_id.length === 0) {
    const updated = await coin_handler.update_coin_list_from_CG();
    if (!updated) {
      console.log("Error during updating coin list from CoinGecko API");
      await send_error("symbol", ctx);
      return;
    }

    coins_id = get_cg_id(coin);

    if (coins_id.length === 0) {
      console.log("After update, No coins found with the given symbol");
      await send_error("symbol", ctx);
      return;
    }
  }

  if (coins_id.length === 1) {
    return coins_id[0];
  }

  const buttons = coins_id.map((crypto) =>
    Markup.button.callback(
      crypto,
      coin_type === "chart" ? `chart_${crypto}` : crypto
    )
  );

  const keyboard = Markup.inlineKeyboard(buttons.map((btn) => [btn]));

  console.log(buttons);

  await ctx.reply(
    "🟠 There are multiple coins with the same symbol, please select the desired one:",
    keyboard
  );
};

const get_cg_price = async (coin: string, ctx: MyContext): Promise<void> => {
  try {
    const result: AxiosResponse<CG_CRYPO_DATA> = await axios.get(
      API.CG_CRYPTO_DATA + coin + API.CG_CRYPTO_DATA_TAIL
    );
    const crypto_data = result.data;
    if ("error" in crypto_data) {
      await send_error("generic", ctx);
      return;
    }
    const usd_price = crypto_data.market_data.current_price?.usd;
    const usd_price_str = usd_price
      ? `\`${usd_price}$\``
      : "`Price not available for this coin.`";
    await ctx.reply(mk2Formatter(usd_price_str), { parse_mode: "MarkdownV2" });
  } catch (error) {
    console.log(error);
    await send_error("generic", ctx);
  }
};

const get_cg_chart = async (
  coin: string,
  ctx: MyContext,
  period: string = "1"
): Promise<void> => {
  await create_chart(coin, ctx, period);
};

export {
  get_cg_id,
  get_cg_coin_info,
  cg_coin_check,
  get_cg_price,
  get_cg_chart,
};
