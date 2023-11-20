import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
const __dirname = path.resolve();

import cron from 'node-cron';

import { WaitingList } from './waiting-list';
import { Bot } from './bot';
import { LowdbDatabase } from './database/lowdb';


const CRON_SCHEDULE_PULL_UPDATES = process.env.CRON_SCHEDULE_PULL_UPDATES || '0 * * * *';
const CRON_SCHEDULE_SEND_PUBLIC_REPORT = process.env.CRON_SCHEDULE_SEND_PUBLIC_REPORT || '0 12 * * *';
const CRON_SCHEDULE_SEND_TECH_REPORT = process.env.CRON_SCHEDULE_SEND_TECH_REPORT || '0 12 * * *';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const CHANNEL_ID = process.env.CHANNEL_ID || '';
const TECH_REPORTS_CHANNEL_ID = process.env.TECH_REPORTS_CHANNEL_ID || '';

const dbChats = new LowdbDatabase({ pathToDbFolder: path.join(__dirname, 'database') });
const dbTransfers = new LowdbDatabase({ pathToDbFolder: path.join(__dirname, 'database') });
const bot = new Bot({BOT_TOKEN, db: dbChats});

(async function main() {
  await dbChats.connect({ dbName: 'chats' });
  await dbTransfers.connect({ dbName: 'transfers' });

  bot.launch();

  const waitingList = new WaitingList();
  await waitingList.pullUpdates();

  /** Schedule updates pulling */
  cron.schedule(CRON_SCHEDULE_PULL_UPDATES, waitingList.pullUpdates);

  /** Schedule sending report */
  cron.schedule(CRON_SCHEDULE_SEND_PUBLIC_REPORT, async () => {
    const message = waitingList.getReportMessageByDateOffset(-1);

    if (!message) {
      console.error('Public report message is empty. Skipping sending report');
      return;
    }

    /** Send message to main channel */
    try {
      const channelMessage = await bot.sendMessage(CHANNEL_ID, message, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      });
      const channelMessageId = channelMessage.message_id;

      /** Forward channel message to all subscribers */
      await bot.forwardMessageToAllSubscribers(CHANNEL_ID, channelMessageId, {
        disable_web_page_preview: true,
      });
    } catch (error) {
      console.error('Error while sending or forwarding messages', error.message);
    }
  });

  cron.schedule(CRON_SCHEDULE_SEND_TECH_REPORT, async () => {
    const message = await waitingList.getTechReportMessageByDateOffset(-4, dbTransfers);

    if (!message) {
      console.error('Tech Report message is empty. Skipping sending report');
      return;
    }

    /** Send message to main channel */
    try {
      await bot.sendMessage(TECH_REPORTS_CHANNEL_ID, message, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      });
    } catch (error) {
      console.error('Error while sending message', error.message);
    }
  });
})();