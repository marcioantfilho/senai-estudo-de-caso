import { Injectable } from '@nestjs/common';
import { Page, paginate, PageRequest } from '../../../shared/application/pagination';
import { containsIgnoringCaseAndAccents } from '../../../shared/domain/text-comparison';
import { ResourceNotFoundException } from '../../../shared/http/api.exception';
import { ClubRepository } from '../../clubs/application/club.repository';
import { describePlayer, PlayerDetails } from '../domain/player';
import { comparePlayers, PlayerSortOption } from '../domain/player-sort';
import { PlayerFilter, PlayerRepository } from './player.repository';

export interface PlayerListQuery extends PlayerFilter, PageRequest {
  search?: string;
  minValue?: number;
  maxValue?: number;
  sort: readonly PlayerSortOption[];
}

/** RN07: busca, filtra e ordena pelo valor de mercado calculado e só então pagina. */
@Injectable()
export class ListPlayersUseCase {
  constructor(
    private readonly players: PlayerRepository,
    private readonly clubs: ClubRepository,
  ) {}

  async execute(query: PlayerListQuery): Promise<Page<PlayerDetails>> {
    if (query.clubId !== undefined && !(await this.clubs.exists(query.clubId))) {
      throw new ResourceNotFoundException('Clube não encontrado.');
    }

    const players = await this.players.findActive(query);
    const matching = players
      .map(describePlayer)
      .filter((player) => matchesSearch(player, query) && isWithinValueRange(player, query))
      .sort(comparePlayers(query.sort));
    return paginate(matching, query);
  }
}

function matchesSearch(player: PlayerDetails, { search }: PlayerListQuery): boolean {
  return search === undefined || containsIgnoringCaseAndAccents(player.name, search);
}

function isWithinValueRange(player: PlayerDetails, { minValue, maxValue }: PlayerListQuery): boolean {
  return (
    (minValue === undefined || player.marketValue >= minValue) &&
    (maxValue === undefined || player.marketValue <= maxValue)
  );
}
