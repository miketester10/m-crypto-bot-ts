import { MyContext } from "./types/types";


async function send_error(e_type: string, ctx: MyContext): Promise<void> {
    const errors: { [key: string]: string } = {
        symbol: "Please enter a valid crypto symbol.",
        generic: "An error occurred. Please try again later.",
        erc_contract: "⚠️ invalid erc20 contract",
        bsc_contract: "⚠️ invalid bsc contract",
    };

    const cur_error = errors[e_type] || "Generic error.";

    await ctx.reply(cur_error);
}

export { send_error };
