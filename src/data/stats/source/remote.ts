import { StatsList } from '../../../types';

import axios from 'axios';

export const getStats = async function (): Promise<StatsList> {
  const result = await axios.get('https://www-static.ripe.net/dynamic/ipv4-waiting-list/stats.json')
    .then(response => {
      return response.data
    })

  return result;
}