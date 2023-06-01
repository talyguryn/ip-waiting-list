import { StatsList } from '../../../types';

import fs from 'fs';

export const getStats = async function (): Promise<StatsList> {
  const result = fs.readFileSync('./data/stats.json', 'utf8');

  return JSON.parse(result);
}