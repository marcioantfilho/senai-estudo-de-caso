import { Transaction, TransactionType } from '../domain/transaction';

export interface TransactionFilter {
  types?: readonly TransactionType[];
  playerId?: number;
}

export abstract class TransactionRepository {
  /** RN17: da mais recente para a mais antiga; no mesmo instante, maior id primeiro. */
  abstract findByClub(clubId: number, filter: TransactionFilter): Promise<Transaction[]>;
}
