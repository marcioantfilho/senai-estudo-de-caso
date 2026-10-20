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

export interface StoredContract extends ContractTerms {
  id: number;
}

export interface SaleRecord {
  transaction: TransactionRecord;
  contractId: number;
  contractStatus: ContractStatus;
  clubCash: number;
}

/** Operações de uma transação do banco; jogador e clube lidos ficam travados até o fim dela. */
export interface MarketSession {
  lockActivePlayer(id: number): Promise<Player | null>;

  lockClub(id: number): Promise<Club | null>;

  countSquad(clubId: number): Promise<number>;

  hasSold(clubId: number, playerId: number): Promise<boolean>;

  findActiveContract(playerId: number): Promise<StoredContract | null>;

  /** Debita o caixa, vincula o jogador, cria o contrato e grava a transação `COMPRA`. */
  recordPurchase(purchase: PurchaseRecord): Promise<Transaction>;

  /**
   * Credita o caixa, libera o jogador, encerra ou rescinde o contrato, grava a
   * transação `VENDA` e tira o jogador da escalação, se for titular.
   */
  recordSale(sale: SaleRecord): Promise<Transaction>;
}

export abstract class MarketRepository {
  /** Executa `work` numa única transação do banco: ou tudo é gravado, ou nada. */
  abstract inTransaction<T>(work: (session: MarketSession) => Promise<T>): Promise<T>;
}
