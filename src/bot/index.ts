import TelegramBot from 'node-telegram-bot-api';
import { Database, DatabaseData } from '../database';
import { ChatsNotifications, ChatsNotificationsData } from '../service/chats-notifications';

export type BotParams = {
  BOT_TOKEN: string;
  db: Database<DatabaseData<any>>;
}

export class Bot {
  bot: TelegramBot;
  db: Database<DatabaseData<any>>;
  chatsNotifications: ChatsNotifications;

  constructor({ BOT_TOKEN, db }: BotParams) {
    this.bot = new TelegramBot(BOT_TOKEN, {polling: true});
    this.db = db;

    this.chatsNotifications = new ChatsNotifications({ db });
  }

  launch() {
    this.bot.onText(/\/start/, async (msg: any) => {
      const chatId = msg.chat.id;
      const thread_id = msg.is_topic_message ? msg.message_thread_id : null;

      const chatNotificationsData: ChatsNotificationsData = {
        chatId,
        thread_id,
      }

      let message = `👋 Hey! I can forward messages from [@IPv4_Waiting_List](https://t.me/IPv4_Waiting_List).\n`;
      message += `\n`;
      message += `Use /notifications command to check the notifications status for this chat.\n`;

      await this.bot.sendMessage(chatId, message, {
        message_thread_id: thread_id,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      });
    });

    this.bot.onText(/\/enable_notifications/, async (msg: any) => {
      const chatId = msg.chat.id;
      const thread_id = msg.is_topic_message ? msg.message_thread_id : null;

      const chatNotificationsData: ChatsNotificationsData = {
        chatId,
        thread_id,
      }

      await this.chatsNotifications.enable(chatNotificationsData);

      let message = '🔔 Notifications are enabled\n';
      message += '\n';
      message += 'Type /disable_notifications to turn them off';

      await this.bot.sendMessage(chatId, message, {
        message_thread_id: thread_id,
      });
    });

    this.bot.onText(/\/disable_notifications/, async (msg: any) => {
      const chatId = msg.chat.id;
      const thread_id = msg.is_topic_message ? msg.message_thread_id : null;

      const chatNotificationsData: ChatsNotificationsData = {
        chatId,
        thread_id,
      }

      await this.chatsNotifications.disable(chatNotificationsData);

      let message = '🔕 Notifications are disabled\n';
      message += '\n';
      message += 'Type /enable_notifications to turn them on';

      await this.bot.sendMessage(chatId, message, {
        message_thread_id: thread_id,
      });
    });

    this.bot.onText(/\/notifications/, async (msg: any) => {
      const chatId = msg.chat.id;
      const thread_id = msg.is_topic_message ? msg.message_thread_id : null;

      const chatNotificationsData: ChatsNotificationsData = {
        chatId,
        thread_id,
      }

      const enabledNotifications = await this.chatsNotifications.isEnabled(chatNotificationsData);

      let message = '';

      if (enabledNotifications) {
        message += '🔔 Notifications are enabled\n';
        message += '\n';
        message += 'Type /disable_notifications to turn them off';
      } else {
        message += '🔕 Notifications are disabled\n';
        message += '\n';
        message += 'Type /enable_notifications to turn them on';
      }

      await this.bot.sendMessage(chatId, message, {
        message_thread_id: thread_id,
      });
    });
  }

  async sendMessage(chatId: TelegramBot.ChatId, message: string, options?: TelegramBot.SendMessageOptions): Promise<TelegramBot.Message> {
    return this.bot.sendMessage(chatId, message, options);
  }

async forwardMessageToAllSubscribers(fromChatId: TelegramBot.ChatId, messageId: number, options?: TelegramBot.SendMessageOptions) {
    const chatsNotifications = await this.db.readAll();

    Object.keys(chatsNotifications).forEach(async (chatId: string) => {
      try {
        const [flag, chatIdText, thread_idText] = chatId.split('_');
        const chatIdInt = parseInt(chatIdText, 10);
        const threadIdInt = parseInt(thread_idText, 10);

        const mergedOptions = Object.assign({}, options, { message_thread_id: threadIdInt });
  
        await this.bot.forwardMessage(chatIdInt, fromChatId, messageId, mergedOptions);
      } catch (error) {
        console.error(`Error sending message to chat ${chatId}: ${error}`);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    });
  }

  async sendMessageToAllSubscribers(message: string, options?: TelegramBot.SendMessageOptions) {
    const chatsNotifications = await this.db.readAll();

    Object.keys(chatsNotifications).forEach(async (chatId: string) => {
      try {
        const [flag, chatIdText, thread_idText] = chatId.split('_');
        const chatIdInt = parseInt(chatIdText, 10);
        const threadIdInt = parseInt(thread_idText, 10);

        const mergedOptions = Object.assign({}, options, { message_thread_id: threadIdInt });
  
        await this.bot.sendMessage(chatIdInt, message, mergedOptions);
      } catch (error) {
        console.error(`Error sending message to chat ${chatId}: ${error}`);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    });
  }
}