// index.js
require("dotenv").config();
const express = require("express");
const { Client } = require("@line/bot-sdk");
const { Configuration, OpenAIApi } = require("openai");

const app = express();
app.use(express.json());

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new Client(lineConfig);

// GPT setup
const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

async function askGPT(message) {
  const res = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "คุณคือแอดมินเว็บพนัน ใช้ภาษาสุภาพ อธิบายเข้าใจง่าย ตอบเร็ว พูดเก่ง ชวนลูกค้าฝากเงินอย่างเนียน ๆ",
      },
      {
        role: "user",
        content: message,
      },
    ],
    temperature: 0.7,
  });
  return res.data.choices[0].message.content;
}

app.post("/webhook", async (req, res) => {
  const events = req.body.events;
  if (!events || events.length === 0) {
    return res.status(200).send("OK");
  }

  const results = await Promise.all(
    events.map(async (event) => {
      if (event.type === "message" && event.message.type === "text") {
        const userText = event.message.text;

        // คุณสามารถใส่ keyword ที่คุณอยากให้ตอบเองแบบ manual ก่อนก็ได้
        if (userText.includes("โปร") || userText.includes("แนะนำเกม")) {
          return client.replyMessage(event.replyToken, {
            type: "text",
            text: "🔥 โปรใหม่ล่าสุด ฝาก 300 รับ 450 เทิร์นต่ำ ถอนง่าย! ลองเลย!",
          });
        }

        const gptReply = await askGPT(userText);
        return client.replyMessage(event.replyToken, {
          type: "text",
          text: gptReply,
        });
      }
    })
  );

  res.status(200).send("OK");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port {PORT}`);
});
