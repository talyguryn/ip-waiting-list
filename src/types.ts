export type Alloclist = Lir[];

export type Lir = {
  id: string;
  name: string;
  nets: LirNetwork[];
};

export type LirNetwork = {
  date: Date;
  subnet: string;
  type: LirNetworkType;
  status?: string;
}

export enum LirNetworkType {
  IPv4 = 'IPv4',
  IPv6 = 'IPv6',
}

export type AssignedNetwork = {
  lir: Lir;
  net: LirNetwork;
}

export type StatsList = Record<string, StatsItem>;

export type StatsItem = {
  first_position_days: number;
  length: number;
}