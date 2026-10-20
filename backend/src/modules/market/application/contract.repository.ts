import { ContractTerms } from '../domain/loyalty';

export interface ActiveContract extends ContractTerms {
  playerId: number;
}

export abstract class ContractRepository {
  abstract findActiveByClub(clubId: number): Promise<ActiveContract[]>;
}
