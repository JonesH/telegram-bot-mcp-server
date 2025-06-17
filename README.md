# 🧠 Telegram Bot MCP Server

This project is a **Telegram bot integration** built using the [Model Context Protocol (MCP)](https://modelcontextprotocol.org/) that exposes a comprehensive suite of tools for interacting with the Telegram Bot API. It enables standardized communication with Telegram via structured commands, **interactive UI components**, **dynamic conversation flows**, and **Mini App integration**.

**Perfect for TelegramAgent integration** - provides reliable API interface preventing hallucinations and enabling advanced bot capabilities.

---

## 🚀 Features

This MCP server exposes the following tools:

## 🎯 **TelegramAgent Core Tools**

### ⚡ `sendMessage`

Send messages with **inline keyboard support** for dynamic conversation flows.

- **Input**:
  - `chatId`: Target chat ID or username
  - `text`: Message content
  - `parse_mode` (optional): "Markdown", "MarkdownV2", or "HTML"
  - `reply_markup` (optional): Inline keyboard configuration

**Example Inline Keyboard:**
```json
{
  "inline_keyboard": [
    [
      {"text": "🔗 Open App", "web_app": {"url": "https://your-mini-app.com"}},
      {"text": "📞 Call", "callback_data": "call_action"}
    ],
    [{"text": "🌐 Visit Website", "url": "https://example.com"}]
  ]
}
```

---

### ✏️ `editMessageText`

Edit message text for **real-time conversation updates**.

- **Input**:
  - `chatId`: Target chat ID
  - `messageId`: Message ID to edit
  - `text`: New message text
  - `parse_mode` (optional): Text formatting
  - `reply_markup` (optional): Updated inline keyboard

---

### 🔄 `editMessageReplyMarkup`

Modify button layouts without changing message text.

- **Input**:
  - `chatId`: Target chat ID
  - `messageId`: Message ID to edit
  - `reply_markup` (optional): New keyboard layout

---

### 🎛️ `answerCallbackQuery`

Handle button press responses from inline keyboards.

- **Input**:
  - `callback_query_id`: Query identifier from button press
  - `text` (optional): Notification text (0-200 chars)
  - `show_alert` (optional): Show alert vs notification
  - `url` (optional): URL to open
  - `cache_time` (optional): Caching duration

---

### 📱 `setChatMenuButton`

Link generated **Mini Apps** to bot menu.

- **Input**:
  - `chat_id` (optional): Target private chat
  - `menu_button`: Button configuration

**Menu Button Types:**
- `{"type": "default"}` - Default behavior
- `{"type": "commands"}` - Show command list
- `{"type": "web_app", "text": "Open App", "web_app": {"url": "https://your-app.com"}}` - Mini App integration

---

### 🌐 `answerWebAppQuery`

Process data sent from **Mini Apps**.

- **Input**:
  - `web_app_query_id`: Query identifier
  - `result`: Result object with type, id, title, description, message_text

---

### 🔗 `setWebHook`

Configure webhook for receiving **real-time updates**.

- **Input**:
  - `url`: HTTPS webhook URL
  - `max_connections` (optional): 1-100 connections
  - `allowed_updates` (optional): Update types to receive
  - `secret_token` (optional): Security token
  - `drop_pending_updates` (optional): Clear pending updates

---

## 📦 **Legacy Tools (Maintained for Compatibility)**

### ✅ `get-me`
Test bot authentication and retrieve basic information.

### 💬 `send-message`
Send plain text message (legacy - use `sendMessage` for inline keyboards).

### 🖼️ `send-photo`
Send photo with optional caption.

### 🔨 `kick-chat-member` / ♻️ `un-ban-chat-member`
Ban/unban users from chats.

### 🧾 `get-chat` / 👥 `get-chat-member-count` / 🔍 `get-chat-member`
Chat information and member management.

### 📝 `set-my-commands` / 📋 `get-my-commands`
Bot command menu configuration.

### 🧑‍💻 `set-my-name` / 🙋 `get-my-name`
Bot name management.

### 📘 `set-my-description` / 📖 `get-my-description`
Bot description management.

### ✏️ `set-my-short-description` / 📄 `get-my-short-description`
Bot short description management.

---

## 🛡️ **Enhanced Features**

- **🔍 Detailed Error Handling**: Comprehensive Telegram API error messages with error codes
- **✅ Input Validation**: Zod schemas for all parameters with HTTPS URL validation
- **🎯 Type Safety**: Full TypeScript compatibility with Telegraf
- **🔄 Backward Compatibility**: All existing tools remain functional
- **📋 Clean Architecture**: DRY principles with reusable error formatting

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/siavashdelkhosh81/telegram-bot-mcp-server.git
cd telegram-bot-mcp-server
```

---

### 2. Get Your Telegram Bot Token

1. Open Telegram and search for [@BotFather](https://t.me/BotFather).
2. Start a conversation and run the command:
   ```
   /newbot
   ```
3. Follow the prompts to name your bot and get your **API token**.
4. Save the token.

---

### 3. Install and build

Install packages

```bash
yarn
```

Build packages

```bash
yarn build
```

---

### 4. Configure Your MCP Client

Add this to your MCP client configuration:

```json
{
  "mcpServers": {
    "telegram_bot": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/PARENT/FOLDER/.build/index.js"],
      "env": {
        "TELEGRAM_BOT_API_TOKEN": "your bot token"
      }
    }
  }
}
```

> 🔁 Replace `/ABSOLUTE/PATH/TO/PARENT/FOLDER/.build/index.js` with the real path to your compiled project entry point.

---

## 🔗 **API Coverage**

This MCP server now covers **23 tools** including:
- ✅ Interactive UI components (inline keyboards, callback queries)
- ✅ Dynamic conversation flows (message editing)
- ✅ Mini App integration (web app buttons, queries)
- ✅ Real-time updates (webhooks)
- ✅ Basic messaging and media
- ✅ Chat and user management
- ✅ Bot configuration and info

---

## 💬 Support & Feedback

Feel free to open issues or contribute to the project. For Telegram-specific help, refer to the [Telegram Bot API documentation](https://core.telegram.org/bots/api).

**TelegramAgent Integration**: This MCP server provides the essential tools for building sophisticated Telegram bots with interactive UIs and Mini App support.

Buy me a Coffee :) https://buymeacoffee.com/delkhoshsiv

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
