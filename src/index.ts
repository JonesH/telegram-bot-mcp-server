import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Telegraf } from "telegraf";
import { z } from "zod";
import { 
  TelegramCommandSchema, 
  InlineKeyboardMarkupSchema, 
  MenuButtonSchema, 
  WebHookInfoSchema 
} from "./types";
import { BotCommand, InlineKeyboardMarkup, MenuButton, Update } from "telegraf/types";

const TELEGRAM_BOT_API_TOKEN = process.env.TELEGRAM_BOT_API_TOKEN;

if (!TELEGRAM_BOT_API_TOKEN) {
  console.error("No bot token");
  process.exit(1);
}

const server = new McpServer({
  name: "telegram_bot",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

const bot = new Telegraf(TELEGRAM_BOT_API_TOKEN);

function formatTelegramError(error: any): string {
  if (error?.response?.error_code && error?.response?.description) {
    return `Telegram API Error ${error.response.error_code}: ${error.response.description}`;
  }
  if (error?.message) {
    return `Error: ${error.message}`;
  }
  return `Unknown error occurred: ${String(error)}`;
}

server.tool(
  "get-me",
  "A simple method for testing your bot's authentication token. Requires no parameters",
  async () => {
    try {
      const response = await bot.telegram.getMe();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response),
          },
        ],
      };
    } catch (error) {
      console.error(error);

      return {
        content: [
          {
            type: "text",
            text: `Something went wrong`,
          },
        ],
      };
    }
  }
);

server.tool(
  "send-message",
  "Send message using a chat id",
  {
    chatId: z
      .string()
      .describe(
        "Unique identifier for the target chat or username of the target channel"
      ),
    text: z.string().describe("Message the user want to send to chat id"),
  },
  async ({ chatId, text }) => {
    try {
      await bot.telegram.sendMessage(chatId, text);

      return {
        content: [
          {
            type: "text",
            text: "Message sent to telegram user chat id",
          },
        ],
      };
    } catch (error) {
      console.error(error);

      return {
        content: [
          {
            type: "text",
            text: `Something went wrong`,
          },
        ],
      };
    }
  }
);

server.tool(
  "send-photo",
  "Send photo with message using a chat id",
  {
    chatId: z
      .string()
      .describe(
        "Unique identifier for the target chat or username of the target channel"
      ),
    text: z
      .string()
      .describe("Caption for the photo that user want to send")
      .optional(),
    media: z
      .string()
      .describe(
        "Photo to send. Pass a file_id as String to send a photo that exists on the Telegram servers (recommended), pass an HTTP URL as a String for Telegram to get a photo from the Internet, or upload a new photo using multipart/form-data. The photo must be at most 10 MB in size. The photo's width and height must not exceed 10000 in total. Width and height ratio must be at most 20 "
      ),
  },
  async ({ chatId, text, media }) => {
    try {
      await bot.telegram.sendPhoto(chatId, media, { caption: text });

      return {
        content: [
          {
            type: "text",
            text: "Message sent to telegram user chat id",
          },
        ],
      };
    } catch (error) {
      console.error(error);

      return {
        content: [
          {
            type: "text",
            text: `Something went wrong`,
          },
        ],
      };
    }
  }
);

server.tool(
  "kick-chat-member",
  "Kick a user from a group, a supergroup or a channel",
  {
    chatId: z
      .string()
      .describe(
        "Unique identifier for the target chat or username of the target channel"
      ),
    userId: z.number().describe("Unique identifier of the target user"),
  },
  async ({ chatId, userId }) => {
    try {
      await bot.telegram.banChatMember(chatId, userId);

      return {
        content: [
          {
            type: "text",
            text: "user banned from chat successfully",
          },
        ],
      };
    } catch (error) {
      console.error(error);

      return {
        content: [
          {
            type: "text",
            text: `Something went wrong`,
          },
        ],
      };
    }
  }
);

server.tool(
  "un-ban-chat-member",
  "Use this method to unban a previously banned user in a supergroup or channel. The user will not return to the group or channel automatically",
  {
    chatId: z
      .string()
      .describe(
        "Unique identifier for the target chat or username of the target channel"
      ),
    userId: z.number().describe("Unique identifier of the target user"),
  },
  async ({ chatId, userId }) => {
    try {
      await bot.telegram.unbanChatMember(chatId, userId, {
        only_if_banned: true,
      });

      return {
        content: [
          {
            type: "text",
            text: "user unbanned from chat successfully",
          },
        ],
      };
    } catch (error) {
      console.error(error);

      return {
        content: [
          {
            type: "text",
            text: `Something went wrong`,
          },
        ],
      };
    }
  }
);

server.tool(
  "get-chat",
  "Use this method to get up-to-date information about the chat",
  {
    chatId: z
      .string()
      .describe(
        "Unique identifier for the target chat or username of the target channel"
      ),
  },
  async ({ chatId }) => {
    try {
      const chatFullInfo = await bot.telegram.getChat(chatId);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(chatFullInfo),
          },
        ],
      };
    } catch (error) {
      console.error(error);

      return {
        content: [
          {
            type: "text",
            text: `Something went wrong`,
          },
        ],
      };
    }
  }
);

server.tool(
  "get-chat-member-count",
  "Use this method to get the number of members in a chat",
  {
    chatId: z
      .string()
      .describe(
        "Unique identifier for the target chat or username of the target channel"
      ),
  },
  async ({ chatId }) => {
    try {
      const memberCount = await bot.telegram.getChatMembersCount(chatId);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(memberCount),
          },
        ],
      };
    } catch (error) {
      console.error(error);

      return {
        content: [
          {
            type: "text",
            text: `Something went wrong`,
          },
        ],
      };
    }
  }
);

server.tool(
  "get-chat-member",
  "get information about a member of a chat",
  {
    chatId: z
      .string()
      .describe(
        "Unique identifier for the target chat or username of the target channel"
      ),
    userId: z.number().describe("Unique identifier of the target user"),
  },
  async ({ chatId, userId }) => {
    try {
      const member = await bot.telegram.getChatMember(chatId, userId);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(member),
          },
        ],
      };
    } catch (error) {
      console.error(error);

      return {
        content: [
          {
            type: "text",
            text: `Something went wrong`,
          },
        ],
      };
    }
  }
);

server.tool(
  "set-my-short-description",
  "Use this method to change the bot's short description, which is shown on the bot's profile page and is sent together with the link when users share the bot",
  {
    short_description: z
      .string()
      .describe(
        "New short description for the bot; 0-120 characters. Pass an empty string to remove the dedicated short description for the given language"
      ),
  },
  async ({ short_description }) => {
    try {
      await bot.telegram.setMyShortDescription(short_description);

      return {
        content: [
          {
            type: "text",
            text: "Successfully update short description",
          },
        ],
      };
    } catch (error) {
      console.error(error);

      return {
        content: [
          {
            type: "text",
            text: `Something went wrong`,
          },
        ],
      };
    }
  }
);

server.tool(
  "get-my-short-description",
  "Use this method to get the current bot short description",
  async () => {
    try {
      const response = await bot.telegram.getMyShortDescription();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response),
          },
        ],
      };
    } catch (error) {
      console.error(error);

      return {
        content: [
          {
            type: "text",
            text: `Something went wrong`,
          },
        ],
      };
    }
  }
);

server.tool(
  "set-my-commands",
  "Use this method to change the list of the bot's commands",
  {
    commands: z.array(TelegramCommandSchema),
  },
  async ({ commands }) => {
    try {
      await bot.telegram.setMyCommands(commands);

      return {
        content: [
          {
            type: "text",
            text: "Successfully updated bot commands",
          },
        ],
      };
    } catch (error) {
      console.error(error);

      return {
        content: [
          {
            type: "text",
            text: `Something went wrong`,
          },
        ],
      };
    }
  }
);

server.tool(
  "get-my-commands",
  "Use this method to get the current list of the bot's commands",
  async () => {
    try {
      const response = await bot.telegram.getMyCommands();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response),
          },
        ],
      };
    } catch (error) {
      console.error(error);

      return {
        content: [
          {
            type: "text",
            text: `Something went wrong`,
          },
        ],
      };
    }
  }
);

server.tool(
  "set-my-name",
  "Use this method to change the bot's name",
  {
    name: z.string().describe("New bot name; 0-64 characters"),
  },
  async ({ name }) => {
    try {
      await bot.telegram.setMyName(name);

      return {
        content: [
          {
            type: "text",
            text: "Successfully updated bot name",
          },
        ],
      };
    } catch (error) {
      console.error(error);

      return {
        content: [
          {
            type: "text",
            text: `Something went wrong`,
          },
        ],
      };
    }
  }
);

server.tool(
  "get-my-name",
  "Use this method to get the bot's name",
  async () => {
    try {
      const response = await bot.telegram.getMyName();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response),
          },
        ],
      };
    } catch (error) {
      console.error(error);

      return {
        content: [
          {
            type: "text",
            text: `Something went wrong`,
          },
        ],
      };
    }
  }
);

server.tool(
  "set-my-description",
  "Use this method to change the bot's description, which is shown in the chat with the bot if the chat is empty",
  {
    description: z.string().describe("New bot description; 0-512 characters"),
  },
  async ({ description }) => {
    try {
      await bot.telegram.setMyDescription(description);

      return {
        content: [
          {
            type: "text",
            text: "Successfully updated bot description",
          },
        ],
      };
    } catch (error) {
      console.error(error);

      return {
        content: [
          {
            type: "text",
            text: `Something went wrong`,
          },
        ],
      };
    }
  }
);

server.tool(
  "get-my-description",
  "Use this method to get the bot's description",
  async () => {
    try {
      const response = await bot.telegram.getMyDescription();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response),
          },
        ],
      };
    } catch (error) {
      console.error(error);

      return {
        content: [
          {
            type: "text",
            text: `Something went wrong`,
          },
        ],
      };
    }
  }
);

// Enhanced sendMessage with inline keyboard support
server.tool(
  "sendMessage",
  "Send message with optional inline keyboard for dynamic conversation flows",
  {
    chatId: z
      .string()
      .describe("Unique identifier for the target chat or username of the target channel"),
    text: z.string().describe("Text of the message to be sent"),
    parse_mode: z.enum(["Markdown", "MarkdownV2", "HTML"]).optional(),
    reply_markup: InlineKeyboardMarkupSchema.optional(),
  },
  async ({ chatId, text, parse_mode, reply_markup }) => {
    try {
      const result = await bot.telegram.sendMessage(chatId, text, {
        parse_mode,
        reply_markup: reply_markup as InlineKeyboardMarkup | undefined,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: formatTelegramError(error),
          },
        ],
      };
    }
  }
);

// Edit message text for conversation flow updates
server.tool(
  "editMessageText",
  "Edit text of a message, used for updating conversation flows dynamically",
  {
    chatId: z
      .string()
      .describe("Unique identifier for the target chat or username of the target channel"),
    messageId: z.number().describe("Identifier of the message to edit"),
    text: z.string().describe("New text of the message"),
    parse_mode: z.enum(["Markdown", "MarkdownV2", "HTML"]).optional(),
    reply_markup: InlineKeyboardMarkupSchema.optional(),
  },
  async ({ chatId, messageId, text, parse_mode, reply_markup }) => {
    try {
      const result = await bot.telegram.editMessageText(
        chatId,
        messageId,
        undefined,
        text,
        {
          parse_mode,
          reply_markup: reply_markup as InlineKeyboardMarkup | undefined,
        }
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: formatTelegramError(error),
          },
        ],
      };
    }
  }
);

// Edit message reply markup for button layout updates
server.tool(
  "editMessageReplyMarkup",
  "Edit only the reply markup of a message, used for modifying button layouts",
  {
    chatId: z
      .string()
      .describe("Unique identifier for the target chat or username of the target channel"),
    messageId: z.number().describe("Identifier of the message to edit"),
    reply_markup: InlineKeyboardMarkupSchema.optional(),
  },
  async ({ chatId, messageId, reply_markup }) => {
    try {
      const result = await bot.telegram.editMessageReplyMarkup(
        chatId,
        messageId,
        undefined,
        reply_markup as InlineKeyboardMarkup | undefined
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: formatTelegramError(error),
          },
        ],
      };
    }
  }
);

// Answer callback queries from button presses
server.tool(
  "answerCallbackQuery",
  "Answer callback queries sent from inline keyboards, handles button press responses",
  {
    callback_query_id: z.string().describe("Unique identifier for the query to be answered"),
    text: z.string().max(200).optional().describe("Text of the notification (0-200 characters)"),
    show_alert: z.boolean().optional().describe("Show alert instead of notification"),
    url: z.string().url().optional().describe("URL to open"),
    cache_time: z.number().min(0).optional().describe("Maximum time in seconds for caching"),
  },
  async ({ callback_query_id, text, show_alert, url, cache_time }) => {
    try {
      const result = await bot.telegram.answerCbQuery(callback_query_id, text, {
        show_alert,
        url,
        cache_time,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: formatTelegramError(error),
          },
        ],
      };
    }
  }
);

// Set chat menu button for Mini App integration
server.tool(
  "setChatMenuButton",
  "Set the bot's menu button for a specific chat, used to link generated Mini Apps",
  {
    chat_id: z.string().optional().describe("Unique identifier for the target private chat"),
    menu_button: MenuButtonSchema.describe("Menu button configuration"),
  },
  async ({ chat_id, menu_button }) => {
    try {
      const result = await bot.telegram.setChatMenuButton({
        chatId: chat_id ? parseInt(chat_id) : undefined,
        menuButton: menu_button as MenuButton
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: formatTelegramError(error),
          },
        ],
      };
    }
  }
);

// Answer web app queries from Mini Apps
server.tool(
  "answerWebAppQuery",
  "Answer queries from Mini Apps, processes data sent from web applications",
  {
    web_app_query_id: z.string().describe("Unique identifier for the answered query"),
    result: z.object({
      type: z.string(),
      id: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      message_text: z.string().optional(),
      parse_mode: z.enum(["Markdown", "MarkdownV2", "HTML"]).optional(),
    }).describe("Result object for the web app query"),
  },
  async ({ web_app_query_id, result }) => {
    try {
      const response = await bot.telegram.answerWebAppQuery(web_app_query_id, result as any);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: formatTelegramError(error),
          },
        ],
      };
    }
  }
);

// Set webhook for receiving updates
server.tool(
  "setWebHook",
  "Configure webhook URL for receiving updates from Telegram",
  {
    url: z.string().url("Must be a valid HTTPS URL").describe("HTTPS URL to send updates to"),
    max_connections: z.number().min(1).max(100).optional().describe("Maximum allowed connections"),
    allowed_updates: z.array(z.enum(["message", "callback_query", "inline_query", "chosen_inline_result", "channel_post", "edited_message", "edited_channel_post", "shipping_query", "pre_checkout_query", "poll", "poll_answer", "my_chat_member", "chat_member", "chat_join_request", "message_reaction", "message_reaction_count", "chat_boost", "removed_chat_boost"])).optional().describe("List of update types to receive"),
    secret_token: z.string().max(256).optional().describe("Secret token for webhook security"),
    drop_pending_updates: z.boolean().optional().describe("Drop all pending updates"),
  },
  async ({ url, max_connections, allowed_updates, secret_token, drop_pending_updates }) => {
    try {
      const result = await bot.telegram.setWebhook(url, {
        max_connections,
        allowed_updates,
        secret_token,
        drop_pending_updates,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: formatTelegramError(error),
          },
        ],
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("Telegram bot MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Something went wrong", error);
  process.exit(1);
});
