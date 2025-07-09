require("dotenv").config();
const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
const line = require("@line/bot-sdk");

const app = express();
const port = process.env.PORT || 3000;

// LINE Config
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

// OpenAI Config
const { Configuration, OpenAIApi } = require("openai");
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// LINE Webhook Handler
app.post("/webhook", line.middleware(config), async (req, res) => {
  const events = req.body.events;

  const results = await Promise.all(
    events.map(async (event) => {
      if (event.type === "message" && event.message.type === "text") {
        const userText = event.message.text;

        // ตัวอย่างการใช้ keyword (คุณสามารถปรับให้ฉลาดขึ้น)
        if (userText.toLowerCase().includes("โปร")) {
          return client.replyMessage(event.replyToken, {
            type: "text",
            text: "💥 โปรดี ๆ ต้องรีบเลย! ไม่มีขั้นต่ำ ไม่ต้องทำเทิร์น!",
          });
        }

        // ถ้าไม่เจอ keyword ส่งไปหา GPT
        try {
          const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: userText }],
          });

          const reply = response.data.choices[0].message.content;
          return client.replyMessage(event.replyToken, {
            type: "text",
            text: reply,
          });
        } catch (error) {
          console.error("GPT Error:", error.message);
          return client.replyMessage(event.replyToken, {
            type: "text",
            text: "ขอโทษค่ะ ระบบตอบกลับมีปัญหาชั่วคราว 😢",
          });
        }
      }
    })
  );

  res.status(200).send("OK");
});

// Start server
const client = new line.Client(config);
app.listen(port, () => {
  console.log(`LINE GPT Bot is running on port ${port}`);
});
