import { PhysicalCondition } from '../domain/physical-condition';
import { NewPlayer, Player, PlayerProfile } from '../domain/player';
import { Position } from '../domain/position';

/** Filtros da listagem que não dependem de valores calculados. */
export interface PlayerFilter {
  position?: Position;
  condition?: PhysicalCondition;
  free?: boolean;
  clubId?: number;
  minAge?: number;
  maxAge?: number;
}

/** Acesso aos jogadores; os excluídos (RN09) nunca são devolvidos. */
export abstract class PlayerRepository {
  abstract findActiveById(id: number): Promise<Player | null>;

  abstract findActive(filter: PlayerFilter): Promise<Player[]>;

  abstract create(player: NewPlayer): Promise<Player>;

  abstract updateProfile(id: number, profile: PlayerProfile): Promise<Player>;

  /** Com `leaveLineup`, o jogador sai da escalação na mesma transação (RN19). */
  abstract updateCondition(id: number, condition: PhysicalCondition, leaveLineup: boolean): Promise<Player>;

  abstract markDeleted(id: number, deletedAt: Date): Promise<void>;
}
