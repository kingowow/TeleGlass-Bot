
// Define the bot token directly in the code.
// WARNING: This is less secure than using environment variables.
const BOT_TOKEN = "YOUR_BOT_TOKEN_HERE";

// Export a default object containing event handlers
export default {
  // The fetch handler is called for every HTTP request
  async fetch(request) {
    // Handle the request using the handleRequest function and the hardcoded token
    return handleRequest(request, BOT_TOKEN);
  },
};

/**
 * Handles incoming requests from Telegram.
 * @param {Request} request The incoming request object.
 * @param {string} token The bot token.
 * @returns {Promise<Response>} A promise that resolves to the response object.
 */
async function handleRequest(request, token) {
  // Only process POST requests
  if (request.method !== "POST") {
    return new Response("Please send a POST request.", { status: 405 });
  }

  try {
    const update = await request.json();

    if (update.message) {
      const message = update.message;
      const chatId = message.chat.id;
      const text = message.text;

      // Handle /start command
      if (text && text.startsWith("/start")) {
        const firstName = message.from.first_name || "کاربر";
        const startMessage = `سلام ${firstName} عزیز 👋

به ربات ساخت دکمه شیشه‌ای خوش آمدید.

**راهنمای استفاده:**
1.  ابتدا پیام اصلی خود را (متن، عکس، ویدیو و...) در ربات ارسال کنید.
2.  سپس روی آن پیام ریپلای کنید و اطلاعات دکمه‌ها را به فرمت زیر بفرستید:

\`\`\`
@ChannelUsername
متن دکمه ۱ | http://example.com/link1
متن دکمه ۲ | http://example.com/link2
\`\`\`

-   **خط اول:** شناسه کانال یا کاربر مقصد (مثلاً \`@mychannel\` یا یک آیدی عددی).
-   **خطوط بعدی:** هر خط یک دکمه است که شامل متن و لینک می‌باشد و با کاراکتر \`|\` از هم جدا شده‌اند.

ربات پیام شما را به همراه دکمه‌های ساخته شده به مقصد مورد نظر ارسال می‌کند.
 @kingoteel
`;

        await sendMessage(token, chatId, startMessage);
      }
      // Handle replies to create buttons
      else if (message.reply_to_message) {
        const repliedTo = message.reply_to_message;
        const configText = message.text;

        if (!configText || configText.trim() === "") {
            await sendMessage(token, chatId, "لطفاً تنظیمات دکمه‌ها را طبق راهنما ارسال کنید.");
            return new Response("ok");
        }

        const lines = configText.split('\n').map(line => line.trim()).filter(line => line);
        if (lines.length < 2) {
          await sendMessage(
            token,
            chatId,
            "فرمت ارسالی اشتباه است. لطفاً خط اول شناسه مقصد و در خطوط بعدی دکمه‌ها را مشخص کنید."
          );
          return new Response("ok");
        }

        const targetChatId = lines.shift();
        const inline_keyboard = [];

        for (const line of lines) {
          const parts = line.split("|").map(part => part.trim());
          if (parts.length === 2) {
            inline_keyboard.push([{ text: parts[0], url: parts[1] }]);
          }
        }

        if (inline_keyboard.length === 0) {
            await sendMessage(token, chatId, "هیچ دکمه‌ای با فرمت صحیح یافت نشد. لطفاً راهنما را مطالعه کنید.");
            return new Response("ok");
        }

        const reply_markup = { inline_keyboard };

        // Forward the original message content (text, photo, etc.) with the new buttons
        const response = await forwardMessageWithButtons(token, targetChatId, repliedTo, reply_markup);

        if (response.ok) {
            await sendMessage(token, chatId, "پیام با موفقیت به مقصد ارسال شد. ✅");
        } else {
            const error = await response.json();
            await sendMessage(token, chatId, `خطا در ارسال پیام: ${error.description}`);
        }
      }
    }
  } catch (error) {
    console.error("Error processing update:", error);
    // Return a 200 to acknowledge receipt of the update, even if processing failed.
    // Telegram will stop sending this update if it receives a 200.
    return new Response("ok");
  }

  return new Response("ok");
}

/**
 * Sends a message using the Telegram Bot API.
 * @param {string} token The bot token.
 * @param {number | string} chatId The chat ID to send the message to.
 * @param {string} text The text of the message to send.
 * @param {object} [reply_markup] Optional: An object for an inline keyboard.
 * @returns {Promise<Response>} The fetch Response object.
 */
function sendMessage(token, chatId, text, reply_markup = null) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: "Markdown",
  };
  if (reply_markup) {
    payload.reply_markup = JSON.stringify(reply_markup);
  }
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/**
 * Forwards various message types with an inline keyboard.
 * @param {string} token The bot token.
 * @param {string | number} targetChatId The destination chat ID.
 * @param {object} message The original message object from Telegram to be forwarded.
 * @param {object} reply_markup The inline keyboard markup.
 * @returns {Promise<Response>} The fetch Response object from the Telegram API call.
 */
function forwardMessageWithButtons(token, targetChatId, message, reply_markup) {
  const SIGNATURE = "\n\n⚡ کینگو تیم | @kingo_team";
  let methodName;
  const payload = {
    chat_id: targetChatId,
    reply_markup: JSON.stringify(reply_markup),
  };

  // Determine message type and content
  if (message.text) {
    methodName = 'sendMessage';
    payload.text = message.text;
  } else if (message.photo) {
    methodName = 'sendPhoto';
    payload.photo = message.photo[message.photo.length - 1].file_id;
    payload.caption = message.caption || '';
  } else if (message.video) {
    methodName = 'sendVideo';
    payload.video = message.video.file_id;
    payload.caption = message.caption || '';
  } else if (message.audio) {
    methodName = 'sendAudio';
    payload.audio = message.audio.file_id;
    payload.caption = message.caption || '';
  } else if (message.document) {
    methodName = 'sendDocument';
    payload.document = message.document.file_id;
    payload.caption = message.caption || '';
  } else if (message.voice) {
    methodName = 'sendVoice';
    payload.voice = message.voice.file_id;
    payload.caption = message.caption || '';
  } else if (message.sticker) {
    methodName = 'sendSticker';
    payload.sticker = message.sticker.file_id;
    // Stickers don't get signatures or keyboards
    delete payload.reply_markup;
  } else {
    // Fallback for unsupported types
    methodName = 'sendMessage';
    payload.text = "این نوع پیام برای ارسال با دکمه پشتیبانی نمی‌شود.";
  }

  // Add signature to text or caption, but not for stickers
  if (methodName !== 'sendSticker') {
      if (payload.text) {
          payload.text += SIGNATURE;
      } else if (payload.caption !== undefined) {
          payload.caption += SIGNATURE;
      }
  }

  // Clean up payload: don't send an empty caption field
  if (payload.caption === '') delete payload.caption;

  const url = `https://api.telegram.org/bot${token}/${methodName}`;

  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}
