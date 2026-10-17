import { PhysicalCondition } from '../domain/physical-condition';
import { NewPlayer, Player, PlayerProfile } from '../domain/player';

/** Acesso aos jogadores; os excluídos (RN09) nunca são devolvidos. */
export abstract class PlayerRepository {
  abstract findActiveById(id: number): Promise<Player | null>;

  abstract create(player: NewPlayer): Promise<Player>;

  abstract updateProfile(id: number, profile: PlayerProfile): Promise<Player>;

  abstract updateCondition(id: number, condition: PhysicalCondition): Promise<Player>;

  abstract markDeleted(id: number, deletedAt: Date): Promise<void>;
}
