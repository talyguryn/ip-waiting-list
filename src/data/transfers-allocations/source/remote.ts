import { TransfersAllocationsList } from '../../../types';

import axios from 'axios';

export const getTransfersAllocations = async function (): Promise<TransfersAllocationsList> {
  const result = await axios.get('https://www-static.ripe.net/dynamic/table-of-transfers/transfers-allocations.json')
    .then(response => {
      const data = response.data.slice(6, -1);
      
      return JSON.parse(data)
    });  

  return result.transfers;
}
