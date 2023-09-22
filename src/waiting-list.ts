import { Alloclist, StatsList, AssignedNetwork, StatsItem, TransfersAllocationsList, TransfersAssignmentsList, TransfersAllocationsItem } from './types';
import { Database, DatabaseData } from './database';

import { getAlloclist } from './data/alloclist/source/remote';
import { parseAlloclist } from './data/alloclist/parse-alloclist';

import { getStats } from './data/stats/source/remote';
import { parseStats } from './data/stats/parse-stats';

import { getTransfersAllocations } from './data/transfers-allocations/source/remote';
import { parseTransfersAllocations } from './data/transfers-allocations/parse-transfers-allocations';

import { getTransfersAssignments } from './data/transfers-assignments/source/remote';
import { parseTransfersAssignments } from './data/transfers-assignments/parse-transfers-assignments';

import { ComposeReportMessage } from './report-message/compose-report-message';
import { ComposeTechReportMessage } from './report-message/compose-tech-report-message';

export class WaitingList {
  private alloclist: Alloclist;
  private stats: StatsList;
  private transfersAllocations: TransfersAllocationsList;
  private transfersAssignments: TransfersAssignmentsList

  constructor() {}

  public async pullUpdates() {
    console.log('Pulling updates...');

    const alloclistSource = await getAlloclist();
    this.alloclist = parseAlloclist(alloclistSource);

    const statsList = await getStats();
    this.stats = parseStats(statsList);

    const transfersAllocations = await getTransfersAllocations();
    this.transfersAllocations = parseTransfersAllocations(transfersAllocations);

    const transfersAssignments = await getTransfersAssignments();
    this.transfersAssignments = parseTransfersAssignments(transfersAssignments);

    console.log('Updates pulled');
  }

  public getReportMessageByDateOffset(offset: number = 0): string {
    const targetDate = this.getDateWithOffset(offset);

    const assignedNetworks = this.getAssignedNetworksByDate(targetDate);
    const stats = this.getStatsByDate(targetDate);
    const transfersAllocations = this.getTransfersAllocationsByDate(targetDate)
    .filter(item => +item.transferred_blocks.slice(-2) <= 19);
    const transfersAssignments = this.getTransfersAssignmentsByDate(targetDate)
    .filter(item => +item.transferred_blocks.slice(-2) <= 19);

    if (!assignedNetworks.length && !transfersAllocations.length && !transfersAssignments.length) {
      console.log(`No assigned networks for ${targetDate.toISOString().slice(0, 10)}`);
      return;
    }

    const reportMessage = ComposeReportMessage(targetDate, assignedNetworks, transfersAllocations, transfersAssignments, stats);

    return reportMessage;
  }

  private getAssignedNetworksByDate(targetDate: Date): AssignedNetwork[] {
    const nets: AssignedNetwork[] = [];

    this.alloclist.filter(lir => lir.nets.filter(net => {
      if (net.date.getTime() === targetDate.getTime()) {
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

  private getTransfersAllocationsByDate(targetDate: Date): TransfersAllocationsList {
    const targetTransfersAllocations = this.transfersAllocations
    .filter(item => {
      let [day, month, year] = item.date.split('/')
      const itemDate = new Date(`${year}-${month}-${day}`);

      if (itemDate.getTime() === targetDate.getTime()) {
        return true;
      }

      return false;
    });

    return targetTransfersAllocations;
  }

  private getTransfersAssignmentsByDate(targetDate: Date): TransfersAssignmentsList {
    const targetTransfersAssignments = this.transfersAssignments
    .filter(item => {
      let [day, month, year] = item.date.split('/')
      const itemDate = new Date(`${year}-${month}-${day}`);

      if (itemDate.getTime() === targetDate.getTime()) {
        return true;
      }

      return false;
    });

    return targetTransfersAssignments;
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

  public async getTechReportMessageByDateOffset(offset: number = 0, dbTransfers: Database<DatabaseData<any>>): Promise<string> {
    const targetDate = this.getDateWithOffset(offset);

    const transfersAllocations = this.getTransfersAllocationsByDate(targetDate);
    const transfersAssignments = this.getTransfersAssignmentsByDate(targetDate);

    for (let i = 0; i < transfersAllocations.length; i++) {
      const transferItem = transfersAllocations[i];
      const isNewTransfer = await this.saveNewTransfer(transferItem, dbTransfers);

      if (!isNewTransfer) {
        transfersAllocations.splice(i, 1);
        i--;
      }
    }

    for (let i = 0; i < transfersAssignments.length; i++) {
      const transferItem = transfersAssignments[i];
      const isNewTransfer = await this.saveNewTransfer(transferItem, dbTransfers);

      if (!isNewTransfer) {
        transfersAssignments.splice(i, 1);
        i--;
      }
    }

    const reportMessage = ComposeTechReportMessage(transfersAllocations, transfersAssignments);

    return reportMessage;
  }

  private async saveNewTransfer(transferItem: TransfersAllocationsItem | TransfersAllocationsItem, database: Database<DatabaseData<any>>): Promise<boolean> {
    const key = JSON.stringify(transferItem);
    const itemInDB = await database.read(key);

    if (itemInDB) {
      return false;
    }

    await database.create(key, true);
    return true;
  }
}