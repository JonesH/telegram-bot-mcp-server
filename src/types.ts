import { z } from "zod";

export const TelegramCommandSchema = z.object({
  command: z.string().min(1, "Command is required"),
  description: z.string().min(1, "Description is required"),
});

export const InlineKeyboardButtonSchema = z.object({
  text: z.string().min(1, "Button text is required"),
  url: z.string().url().optional(),
  callback_data: z.string().max(64).optional(),
  web_app: z.object({
    url: z.string().url()
  }).optional(),
  switch_inline_query: z.string().optional(),
  switch_inline_query_current_chat: z.string().optional(),
}).refine(
  (data) => {
    const keys = [
      data.url, 
      data.callback_data, 
      data.web_app, 
      data.switch_inline_query, 
      data.switch_inline_query_current_chat
    ].filter(Boolean);
    return keys.length === 1;
  },
  { message: "Button must have exactly one action type" }
);

export const InlineKeyboardMarkupSchema = z.object({
  inline_keyboard: z.array(z.array(InlineKeyboardButtonSchema)).min(1, "At least one row required")
});

export const MenuButtonSchema = z.union([
  z.object({ type: z.literal("default") }),
  z.object({ type: z.literal("commands") }),
  z.object({ 
    type: z.literal("web_app"),
    text: z.string().min(1, "Button text is required"),
    web_app: z.object({
      url: z.string().url("Must be a valid HTTPS URL")
    })
  })
]);

export const WebHookInfoSchema = z.object({
  url: z.string().url("Must be a valid HTTPS URL"),
  max_connections: z.number().min(1).max(100).optional(),
  allowed_updates: z.array(z.string()).optional(),
  secret_token: z.string().max(256).optional(),
  drop_pending_updates: z.boolean().optional()
});
