import { Message, EmbedBuilder, AttachmentBuilder } from "discord.js";
import { PrefixCommand } from "../../handler";
import fs from "fs";
import os from "os";
import path from "path";
import OpenAI from "openai";
import { createCanvas } from "canvas";
import { OPENAI_API_KEY } from "../../../../ep_bot/extras/settings";
const Chart = require("chart.js/auto");
const ChartDataLabels = require("chartjs-plugin-datalabels");
Chart.register(ChartDataLabels);

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

function generateChartConfig(chartType, graphData) {
  const isPieChart = chartType === "pie";

  return {
    type: chartType,
    data: isPieChart
      ? {
        labels: graphData.labels,
        datasets: [
          {
            data: graphData.values,
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"], // Colors for pie slices
          },
        ],
      }
      : {
        labels: graphData.x,
        datasets: [
          {
            label: "Generated Data",
            data: graphData.y,
            backgroundColor: chartType === "bar" ? ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"] : "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
    options: {
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            generateLabels: (chart) => {
              const { labels } = chart.data;
              const backgroundColors = chart.data.datasets[0].backgroundColor;

              return labels.map((label, index) => ({
                text: `${label} (Color: ${backgroundColors[index]})`,
                fillStyle: backgroundColors[index],
                strokeStyle: backgroundColors[index],
                hidden: false,
                index,
              }));
            },
            color: "black",
          },
        },
        tooltip: {
          callbacks: {
            label: (tooltipItem) => {
              const dataset = tooltipItem.dataset;
              const value = dataset.data[tooltipItem.dataIndex];
              const color = isPieChart
                ? dataset.backgroundColor[tooltipItem.dataIndex]
                : dataset.backgroundColor;
              return isPieChart
                ? `${tooltipItem.label}: ${value} (Color: ${color})`
                : `Value: ${value} (Color: ${color})`;
            },
          },
        },
        datalabels: {
          color: "white",
          anchor: isPieChart ? "end" : "center",
          align: isPieChart ? "start" : "top",
          formatter: (value, context) => {
            const index = context.dataIndex;
            if (isPieChart) {
              return `${context.chart.data.labels[index]}: ${value}`;
            }
            return value;
          },
          font: {
            size: 14,
            weight: "bold",
          },
        },
      },
      scales: isPieChart
        ? undefined
        : {
          y: {
            beginAtZero: true,
            ticks: {
              color: "black",
            },
          },
          x: {
            ticks: {
              color: "black",
            },
          },
        },
    },
  };
}
export default new PrefixCommand({
  name: "gi",
  aliases: ["graphit", "mygraph", "graph"],
  async execute(message: Message): Promise<void> {
    const jsonFilePath = path.resolve(__dirname, "../../handler/utils/data.json");

    if (!fs.existsSync(jsonFilePath)) {
      console.error("data.json file does not exist at:", jsonFilePath);
      await message.reply("Sorry, I couldn't find the required data file.");
      return;
    }

    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf-8"));

    const content = message.content.split(" ");
    const chartType = content[2]?.toLowerCase() || "bar"; // Default to "bar"
    const question = content.slice(3).join(" ") || "Generate a graph based on the data.";

    const validChartTypes = ["bar", "line", "pie", "radar", "doughnut"];
    if (!validChartTypes.includes(chartType)) {
      await message.reply(`Invalid chart type. Use one of: ${validChartTypes.join(", ")}`);
      return;
    }

    // Send a "working" status message
    const statusMessage = await message.reply("Processing your request...");

    try {
      const context = JSON.stringify(jsonData, null, 2);
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: `You are an assistant AI that generates data for graphing. Use the following JSON context to understand the query and extract relevant data for the chart:\n\n${context}\n\nYour response must include:\n1. A table or textual explanation in plain text format.\n2. A JSON object with the chart data in the format:\ndata: { labels: [categories], values: [numerical values] }\n\nIf the query is unclear, generate random data for the requested chart type.`,
          },
          { role: "user", content: question },
        ],
      });

      const aiReply = response.choices[0]?.message?.content?.trim() || "No response from AI.";
      console.log("AI Response:", aiReply);

      let graphData;
      const match = aiReply.match(/data:\s*({.*})/i);
      const plainText = aiReply.replace(/data:\s*({.*})/i, "").trim();

      if (match && match.length >= 2) {
        graphData = JSON.parse(match[1]);
      } else {
        console.warn("AI did not provide valid data. Falling back to default random data.");
        graphData = chartType === "pie"
          ? {
            labels: ["Example A", "Example B", "Example C"],
            values: [20, 30, 50],
          }
          : {
            x: [1, 2, 3, 4],
            y: [10, 20, 30, 40],
          };
      }

      // Generate the graph
      const canvas = createCanvas(800, 400);
      const ctx = canvas.getContext("2d");

      const chartConfig = generateChartConfig(chartType, graphData);

      new Chart(ctx, chartConfig);

      const filePath = path.join(os.tmpdir(), `graph_${Date.now()}.png`);
      fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

      const attachment = new AttachmentBuilder(filePath, { name: "graph.png" });
      const embed = new EmbedBuilder()
        .setTitle("AI-Generated Graph")
        .setDescription(plainText) // Include the plain text response here
        .setImage("attachment://graph.png")
        .setColor(0x00ae86)
        .setTimestamp();

      // Edit the status message with the final output
      await statusMessage.edit({ content: null, embeds: [embed], files: [attachment] });
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error("Error while generating graph:", error);

      // Update the status message to indicate failure
      await statusMessage.edit("Sorry, I couldn't generate a graph. Please try again.");
    }
  },
});