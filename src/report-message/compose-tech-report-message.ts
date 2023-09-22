import { TransfersAllocationsItem, TransfersAssignmentsItem } from '../types';

export function ComposeTechReportMessage(transfersAllocations: TransfersAllocationsItem[], transfersAssignments: TransfersAssignmentsItem[]): string {
  let message: string = '';

  let transfersAllocationsNumber = transfersAllocations.length;
  let transfersAssignmentsNumber = transfersAssignments.length;

  // create date time in hh:mm dd-mm-yyyy format
  const nowDate = new Date();

  // get month in letters format
  const month = nowDate.toLocaleString('default', { month: 'short' });

  const nowDateFormatted = `${nowDate.getDate()} ${month} ${nowDate.getFullYear()}, ${nowDate.getHours()}:${nowDate.getMinutes()}`;

  if (transfersAllocationsNumber || transfersAssignmentsNumber) {
    message += `*Latest transfers for ${nowDateFormatted}*\n\n`;

    transfersAllocations.forEach((transfersAllocation, index) => {
      message += `PA \`${transfersAllocation.transferred_blocks}\` ${transfersAllocation.from} → ${transfersAllocation.to}\n\n`;
    });

    transfersAssignments.forEach((transfersAssignments, index) => {
      message += `PI \`${transfersAssignments.transferred_blocks}\` ${transfersAssignments.from} → ${transfersAssignments.to}\n\n`;
    });

    message += '\n';
  }

  return message;
};