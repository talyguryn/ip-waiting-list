import axios from 'axios';

export const getAlloclist = async function (): Promise<string> {
  const result = await axios.get('https://ftp.ripe.net/ripe/stats/membership/alloclist.txt')
    .then(response => {
      return response.data;
    })

  return result;
}