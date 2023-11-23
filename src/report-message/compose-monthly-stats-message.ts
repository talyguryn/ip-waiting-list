import { TransfersAllocationsItem, TransfersAssignmentsItem } from '../types';
import { escapeSpecialChars as esc } from './escape-special-chars';

export function ComposeMonthlyStatsMessage(targetDate: Date, stats: Record<string, number>): string {
  const total = Object.values(stats).reduce((acc, value) => acc + value, 0);

  let reportMessage = `*Monthly stats for ${targetDate.toLocaleString('en', { month: 'long' })} ${targetDate.getFullYear()}* grouped by mask:\n\n`;

  Object.keys(stats).forEach(mask => {
    reportMessage += `\`/${mask}:\` ${stats[mask]}\n`;
  });

  reportMessage += `\nTotal: ${total} nets`;
  
  return reportMessage;
};