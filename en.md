# 💎 TeleGlass Bot: Serverless Telegram Button Bot

A lightweight, serverless Telegram bot that runs on Cloudflare Workers. It allows users to easily add inline keyboard buttons ("glass buttons") to any message and send it to a channel or user.

---

## ✨ Features

-   **✍️ Easy Message Creation**: Send any message (text, photo, video, etc.) to the bot.
-   **🖱️ Inline Button Builder**: Simply reply to your message with the button configuration.
-   **🚀 Serverless**: Runs entirely on Cloudflare's free tier. No servers, no hassle.
-   **📢 Multi-Destination**: Send the final message to any channel, group, or user.
-   **👥 Multi-User**: Can be used by multiple people simultaneously without conflict.
-   **🔒 Secure**: Designed to be secure and lightweight.

---

## ⚙️ How It Works

The workflow is designed to be simple and intuitive:

1.  **Send Content**: You send the primary message content (like a text post, an image, or a video) directly to the bot.
2.  **Reply with Config**: You reply to that message with a special format: the first line is the destination chat ID (`@your_channel` or a numeric ID), and the subsequent lines define your buttons.

---

## 🚀 Setup and Deployment

Follow these steps to get your bot running in minutes.

### 1. Get a Telegram Bot Token

-   Talk to [@BotFather](https://t.me/BotFather) on Telegram.
-   Create a new bot using the `/newbot` command.
-   BotFather will give you a unique token. Keep it safe.

### 2. Get the Code

-   Copy the code from the `worker.js` file in this repository.

### 3. Deploy on Cloudflare Workers

-   Log in to your Cloudflare dashboard.
-   Go to **Workers & Pages** and create a new **Worker**.
-   Give it a name (e.g., `telegram-button-bot`).
-   Paste the `worker.js` code into the Cloudflare Worker editor.

### 4. Set Your Bot Token

The script needs your bot token to work. Find this line at the top of the `worker.js` script and add your token:
```javascript
const BOT_TOKEN = "YOUR_BOT_TOKEN_HERE";
```
Replace `"YOUR_BOT_TOKEN_HERE"` with the token you got from BotFather.

*(For better security, you can use environment variables (secrets) in Cloudflare instead of writing the token in the code, but this requires a small code modification.)*

### 5. Deploy

-   Click **Save and Deploy**. Cloudflare will give you a unique URL (e.g., `https://telegram-button-bot.your-name.workers.dev`).

### 6. Set the Webhook

-   Finally, tell Telegram where to send updates. Open the following URL in your browser, replacing the placeholders:

    ```
    https://api.telegram.org/bot[YOUR_BOT_TOKEN]/setWebhook?url=[YOUR_WORKER_URL]
    ```
-   Replace `[YOUR_BOT_TOKEN]` with your bot token.
-   Replace `[YOUR_WORKER_URL]` with the URL of your deployed worker.

Your bot is now live!

---

## 💬 Usage

-   **Start the Bot**: Send `/start` to the bot to get a welcome message and instructions.
-   **Create a Post**:
    1.  Send any message (text, photo, etc.) to the bot.
    2.  Reply to that message with your button configuration. The format is:

    ```
    @TargetChannelOrUser
    Button Text 1 | https://link-to-website.com
    Another Button | https://another-link.com
    ```
    -   The first line is the destination chat (e.g., `@my_channel` or a user ID).
    -   Each following line creates one button. The text and URL are separated by a `|`.

The bot will then send your message with the shiny new buttons to the specified destination!

---

## 📄 License

This project is open source and licensed under the **MIT License**.
