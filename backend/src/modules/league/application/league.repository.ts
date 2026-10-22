import { Club } from '../../clubs/domain/club';
import { Player } from '../../players/domain/player';
import { Formation } from '../domain/lineup';
import { MatchSummary, PlayedMatch, RecordedMatch } from '../domain/match';
import { MatchScore } from '../domain/standings';

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

  /** Clubes encontrados entre os ids, travados para leitura em ordem de id: a escalação não muda até o fim. */
  lockClubsForMatch(ids: readonly number[]): Promise<Club[]>;

  findLineup(clubId: number): Promise<StoredLineup>;

  /** Grava a partida, as formações e os 6 duelos; devolve o id da partida. */
  recordMatch(match: PlayedMatch, playedAt: Date): Promise<number>;
}

export abstract class LeagueRepository {
  abstract inTransaction<T>(work: (session: LeagueSession) => Promise<T>): Promise<T>;

  /** `null` quando o clube não existe. */
  abstract findLineup(clubId: number): Promise<StoredLineup | null>;

  /** RN21: da mais recente para a mais antiga (mesmo instante: maior id primeiro), sem os duelos. */
  abstract findMatches(clubId?: number): Promise<MatchSummary[]>;

  /** RN21: a partida com os 6 duelos na ordem gravada; `null` quando não existe. */
  abstract findMatch(id: number): Promise<RecordedMatch | null>;

  abstract findMatchScores(): Promise<MatchScore[]>;
}
