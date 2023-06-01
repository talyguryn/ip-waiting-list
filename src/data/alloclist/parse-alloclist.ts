import { Alloclist, Lir, LirNetwork, LirNetworkType } from '../../types';

export const parseAlloclist = (alloclist: string): Alloclist => {
  const lines = alloclist.split('\n');

  const lirs: Lir[] = [];
  let lir: Lir | undefined;

  let nextLineIsName = false;

  for (const line of lines) {
    // if line starts with a letters, dots, numbers and dashes, it's a LIR's id
    if (/^[a-z0-9.-]+$/i.test(line)) {
      const id = line.trim();

      lir = { id, name: '', nets: [] };
      lirs.push(lir);

      // read next line to get LIR's name
      nextLineIsName = true;
      continue;
    }

    // if next line is LIR's name, then this line is LIR's name
    if (nextLineIsName) {
      lir!.name = line.trim();
      nextLineIsName = false;
      continue;
    }

    // if line starts with a four spaces and date, it's a network
    if (/^    \d{8}/.test(line)) {
      const [date, subnet, status] = line.split('\t').map(text => text.trim());

      // parse date from YYYYMMDD to date object
      const year = parseInt(date.slice(0, 4));
      const month = parseInt(date.slice(4, 6)) - 1;
      const day = parseInt(date.slice(6, 8));

      // new date in utc format from given data
      const dateObj = new Date(Date.UTC(year, month, day));

      // detect network type by subnet
      const type = subnet.includes(':') ? LirNetworkType.IPv6 : LirNetworkType.IPv4;

      const network: LirNetwork = {
        date: dateObj,
        subnet,
        type: type as LirNetworkType,
      };

      if (status) {
        network.status = status;
      }

      lir!.nets.push(network);
      continue;
    }
  }

  return lirs;
}