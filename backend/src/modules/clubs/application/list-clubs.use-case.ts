import { Injectable } from '@nestjs/common';
import { PlayerRepository } from '../../players/application/player.repository';
import { describePlayer, PlayerDetails } from '../../players/domain/player';
import { ClubSummary, summarizeClub } from '../domain/club';
import { ClubSortOption, compareClubs } from '../domain/club-sort';
import { ClubRepository } from './club.repository';

@Injectable()
export class ListClubsUseCase {
  constructor(
    private readonly clubs: ClubRepository,
    private readonly players: PlayerRepository,
  ) {}

  async execute(sort: ClubSortOption): Promise<ClubSummary[]> {
    const [clubs, players] = await Promise.all([this.clubs.findAll(), this.players.findActive({ free: false })]);
    const squads = groupByClub(players.map(describePlayer));
    return clubs.map((club) => summarizeClub(club, squads.get(club.id) ?? [])).sort(compareClubs(sort));
  }
}

function groupByClub(players: readonly PlayerDetails[]): Map<number, PlayerDetails[]> {
  const squads = new Map<number, PlayerDetails[]>();
  for (const player of players) {
    if (player.clubId !== null) {
      squads.set(player.clubId, [...(squads.get(player.clubId) ?? []), player]);
    }
  }
  return squads;
}
