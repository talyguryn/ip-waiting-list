import { TransfersAssignmentsList } from '../../../types';

import fs from 'fs';

export const getTransfersAssignments = async function (): Promise<TransfersAssignmentsList> {
  const result = fs.readFileSync('./data/transfers-assignments.json', 'utf8');

  return JSON.parse(result);
}