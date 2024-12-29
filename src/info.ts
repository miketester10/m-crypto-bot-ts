import { MyContext } from "./types/types";
import { mk2Formatter } from "./utility";

const start = async (ctx: MyContext): Promise<void> => {
  const username = ctx.from?.first_name || ctx.from?.username || ctx.from?.id;
  const response_text =
    "Hi" +
    (username ? " " + username : "") +
    "! I am CryptoChartPrice, You can ask me for the current price of any crypto by typing:\n\n" +
    "`/p <crypto_symbol>` \n\n" +
    "For example, `/p btc` will give you the current price of Bitcoin,\n" +
    "or `/c btc` will give you the chart in different timeframes of Bitcoin. Enjoy!\n\n" +
    "To display the complete list of commands, type `/help`\n\n\n" +
    "`⚠️ Bot under development. Some commands may not work. For more information contact the developer:` @m1keehrmantraut";

  await ctx.reply(mk2Formatter(response_text), { parse_mode: "MarkdownV2" });
};

const help = async (ctx: MyContext): Promise<void> => {
  const response_text =
    "📚 *List of Commands:*\n\n" +
    "`/p <crypto_symbol>` - to receive the current price and historical variation from CoinGecko\n" +
    "`/c <crypto_symbol>` - to receive the chart in different timeframes of selected crypto\n" +
    "`/cmc <crypto_symbol>` - ~to receive the current price and historical variation from CoinMarketCap\n`(currently not available)`\n" +
    "`/cmckey` - to receive info about CoinMarketCap api key usage\n`(currently not available)`\n" +
    "`/dom` - to receive the top 10 most capitalized tokens\n`(currently not available)`\n" +
    "`/gas` - to receive real-time gas information on ERC\n`(currently not available)`\n" +
    "`/news` - to receive CoinDesk news~\n`(currently not available)`\n" +
    "`/help` - to receive this message\n\n";

  await ctx.reply(mk2Formatter(response_text), { parse_mode: "MarkdownV2" });
};

export { start, help };
