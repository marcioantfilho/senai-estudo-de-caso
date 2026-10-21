import { Club } from '../../clubs/domain/club';
import { Player } from '../../players/domain/player';
import { Formation } from '../domain/lineup';

export interface StoredLineup {
  clubId: number;
  formation: Formation | null;
  starters: Player[];
}

/** Operações de uma transação do banco; jogadores e clube lidos ficam travados até o fim dela. */
export interface LeagueSession {
  /** Jogadores não excluídos entre os ids pedidos, travados sempre em ordem de id. */
  lockActivePlayers(ids: readonly number[]): Promise<Player[]>;

  lockClub(id: number): Promise<Club | null>;

  /** Substitui a formação e os titulares do clube por inteiro e devolve a escalação gravada. */
  replaceLineup(clubId: number, formation: Formation, playerIds: readonly number[]): Promise<StoredLineup>;
}

export abstract class LeagueRepository {
  abstract inTransaction<T>(work: (session: LeagueSession) => Promise<T>): Promise<T>;

  /** `null` quando o clube não existe. */
  abstract findLineup(clubId: number): Promise<StoredLineup | null>;
}
