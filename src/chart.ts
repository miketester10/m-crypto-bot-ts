import axios, { AxiosResponse } from "axios";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { ChartConfiguration } from "chart.js";
import { MyContext } from "./types/types";
import { CG_CHART_DATA } from "./types/cg_chart_data";
import { writeFile, unlink } from "fs";
import { send_error } from "./errors";
import { Markup } from "telegraf";
import { get_cg_coin_info } from "./cg_calls";

// Impostazioni del grafico
const width = 600;
const height = 400;
const background_color = "#001D3D";
const line_color = "#FF69B4";

// Funzione per formattare il tempo in base al range
const format_timestamp = (timestamp: number, period: string): string => {
  const date = new Date(timestamp);
  if (period === "1" || period === "7") {
    return date.toLocaleTimeString("it", {
      month: "short", // Mese abbreviato (es: "Dec")
      day: "2-digit", // Giorno con 2 cifre (es: "21")
      hour: "2-digit", // Ora con 2 cifre (es: "12")
      minute: "2-digit", // Minuti con 2 cifre (es: "30")
    });
  } else if (period === "30" || period === "90") {
    return date.toLocaleDateString("it", { month: "short", day: "2-digit" });
  } else {
    return date.toLocaleDateString("it", {
      year: "numeric", // Anno con 4 cifre (es: "2020")
      month: "short",
    });
  }
};

const create_chart = async (
  coin: string,
  ctx: MyContext,
  period: string
): Promise<void> => {
  try {
    const url = `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=${period}`;

    const result: AxiosResponse<CG_CHART_DATA> = await axios.get(url);
    const chart_data = result.data.prices;

    if (chart_data[0][0] === 0) {
      await ctx.reply("`Chart not available for this coin.`", {
        parse_mode: "MarkdownV2",
      });
      return;
    }

    const info_coin = get_cg_coin_info(coin);

    // Estrarre timestamp e prezzo
    const timestamps = chart_data.map((item) => item[0]);
    const prices = chart_data.map((item) => item[1]);

    // Formattare timestamp
    const labels = timestamps.map((timestamp) =>
      format_timestamp(timestamp, period)
    );

    // Configurazione del grafico
    const chartJSNodeCanvas = new ChartJSNodeCanvas({
      width,
      height,
      backgroundColour: background_color,
    });
    const configuration: ChartConfiguration = {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            data: prices,
            borderColor: line_color,
            backgroundColor: "rgba(203, 49, 175, 0.2)",
            fill: true,
            borderWidth: 1.5,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: `${info_coin.name} (${info_coin.symbol})`,
            color: "#FFFFFF",
            font: {
              size: 20,
              weight: "bold",
            },
          },
        },
        scales: {
          x: {
            ticks: { color: "#FFFFFF", font: { size: 14, weight: "bold" } }, // Colore asse X
            grid: { color: "#444444" },
            title: {
              display: true,
              text: `${
                period === "1" ? `${period} day` : `${period} days`
              } chart`,
              color: "#FFFFFF",
              font: {
                size: 14,
                weight: "bold",
              },
            },
          },
          y: {
            position: "right",
            ticks: { color: "#FFFFFF", font: { size: 14, weight: "bold" } }, // Colore asse Y
            grid: { color: "#444444" },
            title: {
              display: true,
              text: "Price ($)",
              color: "#FFFFFF",
              font: {
                size: 14,
                weight: "bold",
              },
            },
          },
        },
      },
      plugins: [
        {
          id: "customBackgroundText",
          beforeDraw: (chart) => {
            const ctx = chart.ctx;
            const width = chart.width;
            const height = chart.height;

            // Imposta lo stile del testo
            ctx.save();
            ctx.font = "bold 30px Arial"; // Font e dimensione
            ctx.fillStyle = "rgba(230, 214, 214, 0.2)"; // Colore (grigio chiaro, trasparente)
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // Disegna il testo al centro del grafico
            ctx.fillText("@m1keehrmantraut ©", width / 2, height / 2);

            ctx.restore();
          },
        },
      ],
    };

    // Generare l'immagine del grafico
    const image = await chartJSNodeCanvas.renderToBuffer(configuration);

    const periods = [
      { "1": "24h" },
      { "7": "7d" },
      { "30": "30d" },
      { "90": "90d" },
      { "365": "1y" },
    ];

    const checkbox: string[] = Array(periods.length).fill("");

    for (let i = 0; i < periods.length; i++) {
      const currentKey = Object.keys(periods[i])[0];
      if (currentKey === period) {
        checkbox[i] = "✅";
      }
    }

    const buttons = periods.map((_, i) =>
      Markup.button.callback(
        `${checkbox[i]}${Object.values(periods[i])[0]}`,
        `period_${Object.keys(periods[i])[0]}.${coin}`
      )
    );

    const keyboard = Markup.inlineKeyboard(buttons);

    // Salvare l'immagine prima dell'invio
    const file_name = "crypto_chart.png";
    writeFile(file_name, image, async (err) => {
      if (err) {
        console.log("Errore nella creazione del file:", err);
        throw err;
      } else {
        await ctx.replyWithPhoto({ source: file_name }, keyboard);
        // Rimuovere il file dopo l'invio
        unlink(file_name, (err) => {
          if (err) {
            console.log("Errore nella rimozione del file:", err);
          }
        });
      }
    });
  } catch (error) {
    console.log("Errore nella creazione del grafico:", error);
    await send_error("generic", ctx);
  }
};

export { create_chart };
