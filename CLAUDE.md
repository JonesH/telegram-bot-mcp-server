# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
# Install dependencies
yarn install

# Build TypeScript to JavaScript
yarn build

# The compiled output goes to ./.build directory
# Main entry point: ./.build/index.js
```

## Development Environment

This is a **Telegram Bot MCP (Model Context Protocol) Server** designed specifically for **TelegramAgent integration**. The server prevents API hallucinations by providing a reliable interface layer between Claude and the Telegram Bot API.

### Required Environment Variables
- `TELEGRAM_BOT_API_TOKEN`: Telegram bot token from @BotFather

## Architecture Overview

### Core Components

**MCP Server Structure:**
- `src/index.ts`: Main MCP server implementation with all tools
- `src/types.ts`: Zod validation schemas for Telegram API types
- Built using `@modelcontextprotocol/sdk` and `telegraf` for Telegram API

**Tool Categories:**
1. **TelegramAgent Core Tools** (camelCase naming):
   - `sendMessage`, `editMessageText`, `editMessageReplyMarkup`
   - `answerCallbackQuery`, `setChatMenuButton`, `answerWebAppQuery`, `setWebHook`

2. **Legacy Tools** (kebab-case naming):
   - `get-me`, `send-message`, `send-photo`, `kick-chat-member`, etc.
   - Maintained for backward compatibility

### Key Design Patterns

**Error Handling:**
- `formatTelegramError()` function provides detailed Telegram API errors
- All tools return structured error responses with error codes when available

**Validation Strategy:**
- Comprehensive Zod schemas in `types.ts` for all interactive UI components
- Inline keyboard buttons must have exactly one action type (enforced via refinement)
- HTTPS URL validation for Mini App integration
- TypeScript casting for Telegraf compatibility (`as InlineKeyboardMarkup`)

**MCP Tool Pattern:**
```typescript
server.tool(
  "toolName",
  "Description for TelegramAgent",
  { /* Zod schema for parameters */ },
  async ({ param1, param2 }) => {
    try {
      const result = await bot.telegram.apiMethod();
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    } catch (error) {
      return { content: [{ type: "text", text: formatTelegramError(error) }] };
    }
  }
);
```

## Interactive UI Components

**Inline Keyboard Structure:**
- Defined by `InlineKeyboardMarkupSchema` and `InlineKeyboardButtonSchema`
- Button types: `url`, `callback_data`, `web_app`, `switch_inline_query`
- Validation ensures exactly one action type per button

**Mini App Integration:**
- Menu buttons support web app integration via `MenuButtonSchema`
- Web app queries handled through `answerWebAppQuery` tool
- All Mini App URLs must be HTTPS (enforced by validation)

## MCP Client Configuration

The server runs on stdio transport and should be configured in MCP clients as:
```json
{
  "mcpServers": {
    "telegram_bot": {
      "command": "node",
      "args": ["/path/to/.build/index.js"],
      "env": {
        "TELEGRAM_BOT_API_TOKEN": "your_bot_token"
      }
    }
  }
}
```

## Clean Code Requirements

**DRY (Don't Repeat Yourself):**
- Use `formatTelegramError()` function for all error handling - never duplicate error formatting logic
- Reuse Zod schemas from `types.ts` - avoid defining validation inline
- Extract common MCP tool patterns into reusable functions when adding multiple similar tools
- Leverage existing type definitions and imports rather than recreating them

**Code Organization:**
- Keep all validation schemas in `types.ts`
- Maintain consistent tool structure using the established MCP tool pattern
- Group related functionality (all message tools together, all callback tools together)
- Use descriptive parameter names that match Telegram API documentation

**Type Safety:**
- Always use proper TypeScript types from Telegraf
- Cast custom Zod schemas to Telegraf types when needed (`as InlineKeyboardMarkup`)
- Maintain strict TypeScript configuration - fix type errors, don't suppress them

## Context-Specific Development Notes

- **Tool Naming**: New tools use camelCase (TelegramAgent requirement), legacy tools use kebab-case
- **Type Safety**: Telegraf types require explicit casting for custom schemas
- **Button Validation**: Inline keyboard buttons enforce mutual exclusivity of action types
- **Error Format**: Always use `formatTelegramError()` for consistent error reporting
- **HTTPS Requirement**: All URLs for Mini Apps and webhooks must be HTTPS
# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
NEVER add Co-Authored-By lines to commit messages.