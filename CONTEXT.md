# MCP Server Context for Telegram Bot API

## Purpose
Code Claude is building an MCP (Model Context Protocol) server that exposes Telegram Bot API functionality to the main TelegramAgent. The MCP server acts as a reliable interface layer preventing API hallucinations.

## Required MCP Tools
The MCP server should expose these Telegram Bot API methods as tools:

**Message Management:**
- `sendMessage` - Send text with inline keyboards
- `editMessageText` - Update conversation flow
- `editMessageReplyMarkup` - Modify button layouts
- `answerCallbackQuery` - Handle button presses

**Mini App Integration:**
- `setChatMenuButton` - Link generated Mini Apps to bot menu
- `answerWebAppQuery` - Process data from Mini Apps
- `setWebHook` - Configure webhook for receiving updates

**Bot Configuration:**
- `getMe` - Bot info retrieval
- `setMyCommands` - Command menu setup

## MCP Tool Parameters
Each tool should validate:
- Bot token authentication
- Required parameters (chat_id, text, etc.)
- Proper JSON formatting for keyboards and buttons
- HTTPS URL validation for Mini App links

## Error Handling
MCP server must handle Telegram API errors gracefully and return structured error responses to prevent the main agent from making invalid assumptions about API behavior.

The main agent will use these MCP tools to build dynamic conversation flows and integrate generated Mini Apps seamlessly.
