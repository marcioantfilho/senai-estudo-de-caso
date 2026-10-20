import { Club } from '../../clubs/domain/club';
import { Player } from '../../players/domain/player';
import { ContractStatus } from '../domain/contract-status';
import { ContractTerms } from '../domain/loyalty';
import { Transaction, TransactionRecord } from '../domain/transaction';

export interface ContractRecord extends ContractTerms {
  status: ContractStatus;
}

export interface PurchaseRecord {
  transaction: TransactionRecord;
  contract: ContractRecord;
  clubCash: number;
}

/** Operações de uma transação do banco; jogador e clube lidos ficam travados até o fim dela. */
export interface MarketSession {
  lockActivePlayer(id: number): Promise<Player | null>;

  lockClub(id: number): Promise<Club | null>;

  countSquad(clubId: number): Promise<number>;

  hasSold(clubId: number, playerId: number): Promise<boolean>;

  /** Debita o caixa, vincula o jogador, cria o contrato e grava a transação `COMPRA`. */
  recordPurchase(purchase: PurchaseRecord): Promise<Transaction>;
}

export abstract class MarketRepository {
  /** Executa `work` numa única transação do banco: ou tudo é gravado, ou nada. */
  abstract inTransaction<T>(work: (session: MarketSession) => Promise<T>): Promise<T>;
}
