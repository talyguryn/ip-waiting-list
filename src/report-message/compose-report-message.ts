import { AssignedNetwork, LirNetworkType, StatsItem, TransfersAllocationsItem, TransfersAssignmentsItem } from '../types';
import { escapeSpecialChars as esc } from './escape-special-chars';

export function ComposeReportMessage(reportDate: Date, assignedNetworks: AssignedNetwork[], transfersAllocations: TransfersAllocationsItem[], transfersAssignments: TransfersAssignmentsItem[], stats: StatsItem): string {
  let message: string = '';

  let dateString = `${reportDate.getUTCDate()} ${reportDate.toLocaleString('default', { month: 'long' })} ${reportDate.getUTCFullYear()}`;

  const numberOfAssignedNetworks = assignedNetworks.length;
  message += `*${numberOfAssignedNetworks} network${numberOfAssignedNetworks > 1 ? 's' : ''}* received on ${dateString}:\n`;
  message += '\n';

  if (numberOfAssignedNetworks) {
    const ipv4Nets = assignedNetworks.filter(assignedNetwork => assignedNetwork.net.type === LirNetworkType.IPv4);

    ipv4Nets.forEach((assignedNetwork, index) => {
      const limit = 50;

      if (index >= limit) {
        if (index === limit) {
          message += `… and ${numberOfAssignedNetworks - limit} more\n`;
        }

        return;
      }

      message += `\`${esc(assignedNetwork.net.subnet)}\` ${esc(assignedNetwork.lir.id)}\n`;
    });

    if (ipv4Nets.length) {
      message += '\n';
    }


    const ipv6Nets = assignedNetworks.filter(assignedNetwork => assignedNetwork.net.type === LirNetworkType.IPv6);

    ipv6Nets.forEach((assignedNetwork, index) => {
      const limit = 50;

      if (index >= limit) {
        if (index === limit) {
          message += `… and ${numberOfAssignedNetworks - limit} more\n`;
        }

        return;
      }

      message += `\`${esc(assignedNetwork.net.subnet)}\` ${esc(assignedNetwork.lir.id)}\n`;
    });

    if (ipv6Nets.length) {
      message += '\n';
    }
  }

  let lirsNumber = stats.length;
  let daysNumber = stats.first_position_days;

  message += `*${lirsNumber} LIR${lirsNumber > 1 ? 's' : ''}* in queue.\n`;
  message += `*${daysNumber} day${daysNumber > 1 ? 's' : ''}* that first LIR in queue has been waiting.\n`;
  message += '\n';

  let transfersAllocationsNumber = transfersAllocations.length;
  let transfersAssignmentsNumber = transfersAssignments.length;

  if (transfersAllocationsNumber || transfersAssignmentsNumber) {
    message += `*Huge network transfers:*\n`;

    transfersAllocations.forEach((transfersAllocation, index) => {
      const limit = 10;

      if (index >= limit) {
        if (index === limit) {
          message += `… and ${transfersAllocationsNumber - limit} more\n`;
        }

        return;
      };

      message += `PA \`${esc(transfersAllocation.transferred_blocks)}\` ${esc(transfersAllocation.from)} → ${esc(transfersAllocation.to)}\n`;
    });

    transfersAssignments.forEach((transfersAssignments, index) => {
      const limit = 10;

      if (index >= limit) {
        if (index === limit) {
          message += `… and ${transfersAssignmentsNumber - limit} more\n`;
        }

        return;
      };

      message += `PI \`${esc(transfersAssignments.transferred_blocks)}\` ${esc(transfersAssignments.from)} → ${esc(transfersAssignments.to)}\n`;
    });

    message += '\n';
  }

  message += 'Daily report by [@IPv4_Waiting_List](https://t.me/+61Qp3vl97Xw3Zjhi)';

  return message;
}