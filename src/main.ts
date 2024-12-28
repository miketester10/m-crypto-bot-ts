// npm run dev => run the bot in development mode
// npm start => run the bot in production mode (E.G. on render.com)
// for more details see package.json (scr

import { Telegraf } from "telegraf";
import { callbackQuery } from "telegraf/filters";
import { CoinHandler } from "./shared";
import { MyContext } from "./types/types";
import dotenv from "dotenv";
import { help, start } from "./info";
import { send_error } from "./errors";
import { cg_coin_check, get_cg_chart, get_cg_price } from "./cg_calls";
import { callback_handler } from "./callback";
import express from "express";
dotenv.config();

const coin_handler = CoinHandler.getInstance();
const TOKEN = <string>process.env.BOT_TOKEN;
const bot = new Telegraf<MyContext>(TOKEN);

const start_bot = async () => {
  try {
    const updated = await coin_handler.update_coin_list_from_CG();
    if (!updated) {
      throw new Error("Failed to update coin list from CoinGecko.");
    }

    const commands_set = await bot.telegram.setMyCommands([
      { command: "p", description: "<crypto_symbol> - Price from CoinGecko" },
      {
        command: "c",
        description: "<crypto_symbol> - Chart in different timeframes",
      },
      // {
      //   command: "cmc",
      //   description: "<crypto_symbol> - Price from CoinMarketCap",
      // },
      { command: "start", description: "Start the bot" },
      { command: "help", description: "Show list of available commands" },
    ]);

    if (!commands_set) {
      throw new Error("Error during commands set.");
    }

    console.log("****Bot Started****");
    await bot.launch();
  } catch (error) {
    // Gestione dell'errore
    console.error(`****Error during bot start: ${error}****`);
  }
};

start_bot();

bot.on(callbackQuery("data"), async (ctx) => await callback_handler(ctx));

bot.command("p", async (ctx) => {
  const crypto_symbol = ctx.text?.split(" ")[1]?.toLocaleLowerCase();
  if (!crypto_symbol) {
    await send_error("symbol", ctx);
    return;
  }
  const coin_id = await cg_coin_check(crypto_symbol, ctx);
  if (coin_id) {
    await get_cg_price(coin_id, ctx);
  }
});

bot.command("c", async (ctx) => {
  const crypto_symbol = ctx.text?.split(" ")[1]?.toLocaleLowerCase();
  if (!crypto_symbol) {
    await send_error("symbol", ctx);
    return;
  }
  const coin_id = await cg_coin_check(crypto_symbol, ctx, { type: "chart" });
  if (coin_id) {
    await get_cg_chart(coin_id, ctx);
  }
});

bot.start(async (ctx) => await start(ctx));
bot.help(async (ctx) => await help(ctx));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

// |------------------ Only for deploy on render.com -----------------------|
const app = express();
app.listen(3000, () => console.log("Web server running on port 3000."));
