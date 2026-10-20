import { TransactionClient } from '../../../infrastructure/database/transaction-runner';

/**
 * RN19: o titular sai da escalação na transação da operação que o tirou; a
 * formação do clube continua a salva e ninguém entra no lugar dele.
 */
export async function removeStarter(client: TransactionClient, playerId: number): Promise<void> {
  await client.lineupSlot.deleteMany({ where: { playerId } });
}
