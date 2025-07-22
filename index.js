require("dotenv").config();
const express = require("express");
const line = require("@line/bot-sdk");
const axios = require("axios");
const rawBody = require("raw-body");
const { Configuration, OpenAIApi } = require("openai");

const app = express();
const port = process.env.PORT || 3000;

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

app.post("/webhook", line.middleware(config), async (req, res) => {
  const events = req.body.events;
  for (const event of events) {
    if (event.type === "message" && event.message.type === "image") {
      try {
        const imageBuffer = await downloadImage(event.message.id, config.channelAccessToken);
        const goFileUrl = await uploadToGoFile(imageBuffer);
        const visionResult = await askOpenAIVision(goFileUrl);

        const client = new line.Client(config);
        await client.replyMessage(event.replyToken, {
          type: "text",
          text: "くまお先生の回答だよ🐻\n\n" + visionResult,
        });
      } catch (error) {
        console.error("エラー:", error);
      }
    }
  }
  res.sendStatus(200);
});

async function downloadImage(messageId, token) {
  const response = await axios({
    method: "get",
    url: `https://api-data.line.me/v2/bot/message/${messageId}/content`,
    responseType: "arraybuffer",
    headers: { Authorization: `Bearer ${token}` },
  });
  return Buffer.from(response.data, "binary");
}

async function uploadToGoFile(imageBuffer) {
  const form = new FormData();
  form.append("file", imageBuffer, { filename: "image.png" });

  const uploadRes = await axios.post("https://api.gofile.io/uploadFile", form, {
    headers: form.getHeaders(),
  });

  if (uploadRes.data.status !== "ok") throw new Error("GoFile upload failed");
  return uploadRes.data.data.downloadPage;
}

async function askOpenAIVision(imageUrl) {
  const res = await openai.createChatCompletion({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", content: "この画像に写っている問題を解説してください（高校生向けにやさしく）" },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ],
    max_tokens: 1000,
  });

  return res.data.choices[0].message.content;
}

app.listen(port, () => {
  console.log("Server running on port", port);
});
