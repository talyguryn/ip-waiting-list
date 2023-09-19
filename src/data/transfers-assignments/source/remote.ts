import { TransfersAssignmentsList } from '../../../types';

import axios from 'axios';

export const getTransfersAssignments = async function (): Promise<TransfersAssignmentsList> {
  const result = await axios.get('https://www-static.ripe.net/dynamic/table-of-transfers/transfers-assignments.json')
    .then(response => {
      const data = response.data.slice(6, -1);
      
      return JSON.parse(data)
    });  

  return result.transfers;
}
