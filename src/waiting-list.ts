import { Alloclist, StatsList, AssignedNetwork, StatsItem } from './types';

import { getAlloclist } from './data/alloclist/source/remote';
import { parseAlloclist } from './data/alloclist/parse-alloclist';

import { getStats } from './data/stats/source/remote';
import { parseStats } from './data/stats/parse-stats';

import { ComposeReportMessage } from './report-message/compose-report-message';

export class WaitingList {
  private alloclist: Alloclist;
  private stats: StatsList;

  constructor() {}

  public async pullUpdates() {
    console.log('Pulling updates...');

    const alloclistSource = await getAlloclist();
    this.alloclist = parseAlloclist(alloclistSource);

    const statsList = await getStats();
    this.stats = parseStats(statsList);

    console.log('Updates pulled');
  }

  public getReportMessageByDateOffset(offset: number = 0): string {
    const targetDate = this.getDateWithOffset(offset);

    const assignedNetworks = this.getAssignedNetworksByDate(targetDate);
    const stats = this.getStatsByDate(targetDate);

    const reportMessage = ComposeReportMessage(targetDate, assignedNetworks, stats);

    return reportMessage;
  }

  private getAssignedNetworksByDate(targetDate: Date): AssignedNetwork[] {
    const nets: AssignedNetwork[] = [];

    this.alloclist.filter(lir => lir.nets.filter(net => {
      if (net.date.getTime() === targetDate.getTime()) {
        // console.log(`${lir.id} > ${net.subnet}`);
        nets.push({
          lir,
          net,
        });

        return true;
      }

      return false;
    }));

    return nets;
  }

  private getStatsByDate(targetDate: Date): StatsItem {
    const targetStat = this.stats[targetDate.toISOString().slice(0, 10)];

    return targetStat;
  }
  
  /**
   * Compose UTC date with offset from current date
   */
  private getDateWithOffset(offset: number = 0): Date {
    const nowDate = new Date();

    const utcYear = nowDate.getUTCFullYear();
    const utcMonth = nowDate.getUTCMonth();
    const utcDate = nowDate.getUTCDate() + offset;

    const utcTimestamp = Date.UTC(utcYear, utcMonth, utcDate);
    const targetDate = new Date(utcTimestamp);

    return targetDate;
  }
}