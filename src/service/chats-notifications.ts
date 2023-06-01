import { Database } from "../database/index.d";

export type ChatsNotificationsParams = {
  db: Database<boolean>;
}

export type ChatsNotificationsData = {
  chatId: string;
  thread_id: string | null;
}

export type ChatsNotificationsItem = {
  chatId: string;
  thread_id: string | null;
}

export class ChatsNotifications {
  private db: Database<boolean>;

  constructor({ db }: ChatsNotificationsParams) {
    this.db = db;
  }

  /**
   * Enable notifications for chat and thread
   */
  async enable({ chatId, thread_id }: ChatsNotificationsData) {
    const key = this.composeKey({ chatId, thread_id });

    if (await this.isEnabled({ chatId, thread_id })) {
      return;
    }

    await this.db.create(key, true);
  }

  /**
   * Disable notifications for chat and thread
   */
  async disable({ chatId, thread_id }: ChatsNotificationsData) {
    const key = this.composeKey({ chatId, thread_id });

    await this.db.delete(key);
  }

  /**
   * Check if notifications are enabled for chat and thread
   */
  async isEnabled({ chatId, thread_id }: ChatsNotificationsData) {
    const key = this.composeKey({ chatId, thread_id });

    const enabledNotifications = await this.db.read(key);

    return !!enabledNotifications;
  }

  async getAllChats(): Promise<ChatsNotificationsItem[]> {
    const enabledNotifications = await this.db.readAll();

    return enabledNotifications;
  }

  /**
   * Compose key for chat and thread
   */
  private composeKey({ chatId, thread_id }: ChatsNotificationsData): string {
    return `enabledNotifications_${chatId}_${thread_id}`;
  }
}