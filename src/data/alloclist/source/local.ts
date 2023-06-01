import fs from 'fs';

export const getAlloclist = async function (): Promise<string> {
  return fs.readFileSync('./data/alloclist.txt', 'utf8');
}