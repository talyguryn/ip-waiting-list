import { TransfersAllocationsList } from '../../types';

export const parseTransfersAllocations = (transfersAllocations: TransfersAllocationsList): TransfersAllocationsList => {
  console.log('Parsing transfers-allocations...');

  transfersAllocations = transfersAllocations.filter(transfersAllocation => {
    if (+transfersAllocation.transferred_blocks.slice(-2) <= 19 ) {
      return true;
    }
  });

  return transfersAllocations;
}