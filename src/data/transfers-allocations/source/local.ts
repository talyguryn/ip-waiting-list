import { TransfersAllocationsList } from '../../../types';

import fs from 'fs';

export const getTransfersAllocations = async function (): Promise<TransfersAllocationsList> {
  const result = fs.readFileSync('./data/transfers-allocations.json', 'utf8');

  return JSON.parse(result);
}