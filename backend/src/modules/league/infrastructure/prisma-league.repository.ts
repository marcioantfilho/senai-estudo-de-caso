import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { TransactionClient, TransactionRunner } from '../../../infrastructure/database/transaction-runner';
import { Club } from '../../clubs/domain/club';
import { toClub } from '../../clubs/infrastructure/club-row.mapper';
import { Player } from '../../players/domain/player';
import { toPlayer } from '../../players/infrastructure/player-row.mapper';
import { LeagueRepository, LeagueSession, StoredLineup } from '../application/league.repository';
import { Formation } from '../domain/lineup';
import { Duel, MatchSummary, PlayedMatch, RecordedMatch } from '../domain/match';
import { MatchScore } from '../domain/standings';
import { MATCH_CLUBS, MATCH_WITH_DUELS, toMatchSummary, toRecordedMatch } from './match-row.mapper';

type LineupReader = Pick<TransactionClient, 'club' | 'lineupSlot'>;

@Injectable()
export class PrismaLeagueRepository extends LeagueRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactions: TransactionRunner,
  ) {
    super();
  }

  inTransaction<T>(work: (session: LeagueSession) => Promise<T>): Promise<T> {
    return this.transactions.run((client) => work(new PrismaLeagueSession(client)));
  }

  findLineup(clubId: number): Promise<StoredLineup | null> {
    return loadLineup(this.prisma, clubId);
  }

  async findMatches(clubId?: number): Promise<MatchSummary[]> {
    const rows = await this.prisma.match.findMany({
      where: clubId === undefined ? undefined : { OR: [{ homeClubId: clubId }, { awayClubId: clubId }] },
      include: MATCH_CLUBS,
      orderBy: [{ playedAt: 'desc' }, { id: 'desc' }],
    });
    return rows.map(toMatchSummary);
  }

  async findMatch(id: number): Promise<RecordedMatch | null> {
    const row = await this.prisma.match.findUnique({ where: { id }, include: MATCH_WITH_DUELS });
    return row === null ? null : toRecordedMatch(row);
  }

  findMatchScores(): Promise<MatchScore[]> {
    return this.prisma.match.findMany({
      select: { homeClubId: true, awayClubId: true, homeGoals: true, awayGoals: true },
    });
  }
}

class PrismaLeagueSession implements LeagueSession {
  constructor(private readonly client: TransactionClient) {}

  async lockActivePlayers(ids: readonly number[]): Promise<Player[]> {
    await this.client.$queryRaw`SELECT id FROM jogadores WHERE id = ANY(${[...ids]}) ORDER BY id FOR UPDATE`;
    const rows = await this.client.player.findMany({ where: { id: { in: [...ids] }, deletedAt: null } });
    return rows.map(toPlayer);
  }

  async lockClub(id: number): Promise<Club | null> {
    await this.client.$queryRaw`SELECT id FROM clubes WHERE id = ${id} FOR UPDATE`;
    const row = await this.client.club.findUnique({ where: { id } });
    return row === null ? null : toClub(row);
  }

  async replaceLineup(clubId: number, formation: Formation, playerIds: readonly number[]): Promise<StoredLineup> {
    await this.client.lineupSlot.deleteMany({ where: { clubId } });
    await this.client.lineupSlot.createMany({ data: playerIds.map((playerId) => ({ clubId, playerId })) });
    await this.client.club.update({ where: { id: clubId }, data: { formation } });
    return this.findLineup(clubId);
  }

  async lockClubsForMatch(ids: readonly number[]): Promise<Club[]> {
    await this.client.$queryRaw`SELECT id FROM clubes WHERE id = ANY(${[...ids]}) ORDER BY id FOR SHARE`;
    const rows = await this.client.club.findMany({ where: { id: { in: [...ids] } } });
    return rows.map(toClub);
  }

  async findLineup(clubId: number): Promise<StoredLineup> {
    const lineup = await loadLineup(this.client, clubId);
    if (lineup === null) {
      throw new Error(`Clube ${clubId} não encontrado dentro da transação.`);
    }
    return lineup;
  }

  async recordMatch({ home, away, duels }: PlayedMatch, playedAt: Date): Promise<number> {
    const row = await this.client.match.create({
      data: {
        homeClubId: home.clubId,
        awayClubId: away.clubId,
        homeGoals: home.goals,
        awayGoals: away.goals,
        homeFormation: home.formation,
        awayFormation: away.formation,
        playedAt,
        duels: { create: duels.map(toDuelRow) },
      },
    });
    return row.id;
  }
}

function toDuelRow({ order, attackingClubId, attacker, defender, goal }: Duel) {
  return {
    order,
    attackingClubId,
    attackerId: attacker.playerId,
    defenderId: defender.playerId,
    attackerName: attacker.playerName,
    defenderName: defender.playerName,
    attackerPosition: attacker.position,
    defenderPosition: defender.position,
    attackerCondition: attacker.condition,
    defenderCondition: defender.condition,
    attackAttribute: attacker.attribute,
    defenseAttribute: defender.attribute,
    attackValue: attacker.value,
    defenseValue: defender.value,
    goal,
  };
}

async function loadLineup(client: LineupReader, clubId: number): Promise<StoredLineup | null> {
  const club = await client.club.findUnique({ where: { id: clubId } });
  if (club === null) {
    return null;
  }
  const slots = await client.lineupSlot.findMany({ where: { clubId }, include: { player: true } });
  return {
    clubId,
    formation: club.formation as Formation | null,
    starters: slots.map(({ player }) => toPlayer(player)),
  };
}
