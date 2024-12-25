import { MyContext } from "./types/types";
import { get_cg_chart, get_cg_price } from "./cg_calls";
import { NarrowedContext } from "telegraf";
import { CallbackQuery, Update } from "telegraf/typings/core/types/typegram";
import { message } from "telegraf/filters";

const callback_handler = async (
  ctx: NarrowedContext<
    MyContext,
    Update.CallbackQueryUpdate<Record<"data", {}> & CallbackQuery.DataQuery>
  >
): Promise<void> => {
  const query = ctx.callbackQuery;
  const selected_option = query.data;
  try {
    if (selected_option.startsWith("chart_")) {
      const coin = selected_option.slice(6);
      await get_cg_chart(coin, ctx);
      await ctx.deleteMessage(query.message?.message_id);
    } else if (selected_option.startsWith("cmc_")) {
      // TO DO
    } else if (selected_option.startsWith("period_")) {
      const index_dot = selected_option.indexOf(".");
      const coin = selected_option.slice(index_dot + 1);
      const period = selected_option.slice(7, index_dot);
      await get_cg_chart(coin, ctx, period);
      await ctx.deleteMessage(query.message?.message_id);
    } else {
      await get_cg_price(selected_option, ctx);
      await ctx.deleteMessage(query.message?.message_id);
    }
  } catch (error) {
    console.log(error);
  }
};

export { callback_handler };
