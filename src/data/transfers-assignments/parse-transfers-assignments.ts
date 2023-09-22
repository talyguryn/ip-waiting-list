import { TransfersAssignmentsList } from '../../types';

export const parseTransfersAssignments = (transfersAssignments: TransfersAssignmentsList): TransfersAssignmentsList => {
  console.log('Parsing transfers-assignments...');

  transfersAssignments = transfersAssignments.filter(transfersAssignments => {
    // if (+transfersAssignments.transferred_blocks.slice(-2) <= 19 ) {
      return true;
    // }
  });

  return transfersAssignments;
}