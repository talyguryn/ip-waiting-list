import { AssignedNetwork, StatsItem } from '../types';

export function ComposeReportMessage(reportDate: Date, assignedNetworks: AssignedNetwork[], stats: StatsItem): string {
  let message: string = '';

  let dateString = `${reportDate.getUTCDate()} ${reportDate.toLocaleString('default', { month: 'long' })} ${reportDate.getUTCFullYear()}`;

  const numberOfAssignedNetworks = assignedNetworks.length;
  message += `*${numberOfAssignedNetworks} network${numberOfAssignedNetworks > 1 ? 's' : ''}* received on ${dateString}:\n`;
  message += '\n';

  if (numberOfAssignedNetworks) {
    assignedNetworks.forEach((assignedNetwork, index) => {
      const limit = 70;

      if (index >= limit) {
        if (index === limit) {
          message += `… and ${numberOfAssignedNetworks - limit} more\n`;
        }

        return;
      }

      message += `\`${assignedNetwork.net.subnet}\` ${assignedNetwork.lir.id}\n`;
    });

    message += '\n';
  }

  let lirsNumber = stats.length;
  let daysNumber = stats.first_position_days;

  message += `*${lirsNumber} LIR${lirsNumber > 1 ? 's' : ''}* in queue.\n`;
  message += `*${daysNumber} day${daysNumber > 1 ? 's' : ''}* that first LIR in queue has been waiting.\n`;
  message += '\n';

  message += 'Daily report by [@IPv4_Waiting_List](https://t.me/IPv4_Waiting_List)';

  return message;
}