import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { TransactionClient, TransactionRunner } from '../../../infrastructure/database/transaction-runner';
import { Club } from '../../clubs/domain/club';
import { toClub } from '../../clubs/infrastructure/club-row.mapper';
import { Player } from '../../players/domain/player';
import { toPlayer } from '../../players/infrastructure/player-row.mapper';
import { LeagueRepository, LeagueSession, StoredLineup } from '../application/league.repository';
import { Formation } from '../domain/lineup';

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
    const lineup = await loadLineup(this.client, clubId);
    if (lineup === null) {
      throw new Error(`Clube ${clubId} sumiu durante a escalação.`);
    }
    return lineup;
  }
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
