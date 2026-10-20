import { Club, NewClub } from '../domain/club';

/** `DUPLICATE` cobre nome ou sigla gravados por outro pedido entre a conferência e a gravação. */
export type ClubCreationResult =
  | { status: 'CREATED'; club: Club }
  | { status: 'LEAGUE_FULL' }
  | { status: 'DUPLICATE' };

export abstract class ClubRepository {
  abstract exists(id: number): Promise<boolean>;

  abstract findById(id: number): Promise<Club | null>;

  abstract findAll(): Promise<Club[]>;

  /** RN10: mesma comparação do índice único do banco (maiúsculas e minúsculas iguais, acentos diferentes). */
  abstract isNameTaken(name: string): Promise<boolean>;

  abstract isAcronymTaken(acronym: string): Promise<boolean>;

  /** Grava o clube só se a liga tiver menos de `maxClubs`, numa única transação. */
  abstract createWithinLimit(club: NewClub, maxClubs: number): Promise<ClubCreationResult>;
}
