import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { TransactionRunner } from '../../../infrastructure/database/transaction-runner';
import { removeStarter } from '../../league/infrastructure/lineup-slots';
import { PlayerFilter, PlayerRepository } from '../application/player.repository';
import { PhysicalCondition } from '../domain/physical-condition';
import { NewPlayer, Player, PlayerProfile } from '../domain/player';
import { toPlayer } from './player-row.mapper';

@Injectable()
export class PrismaPlayerRepository extends PlayerRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactions: TransactionRunner,
  ) {
    super();
  }

  async findActiveById(id: number): Promise<Player | null> {
    const row = await this.prisma.player.findFirst({ where: { id, deletedAt: null } });
    return row === null ? null : toPlayer(row);
  }

  async findActive({ position, condition, free, clubId, minAge, maxAge }: PlayerFilter): Promise<Player[]> {
    const rows = await this.prisma.player.findMany({
      where: {
        deletedAt: null,
        position,
        condition,
        clubId: clubId ?? clubPresenceFilter(free),
        age: { gte: minAge, lte: maxAge },
      },
    });
    return rows.map(toPlayer);
  }

  async create(player: NewPlayer): Promise<Player> {
    const { attributes, baseValue, ...fields } = player;
    const row = await this.prisma.player.create({
      data: { ...fields, ...attributes, baseValue: baseValue.toFixed(2) },
    });
    return toPlayer(row);
  }

  async updateProfile(id: number, profile: PlayerProfile): Promise<Player> {
    const { name, position, agility, age } = profile;
    const row = await this.prisma.player.update({ where: { id }, data: { name, position, agility, age } });
    return toPlayer(row);
  }

  updateCondition(id: number, condition: PhysicalCondition, leaveLineup: boolean): Promise<Player> {
    return this.transactions.run(async (client) => {
      const row = await client.player.update({ where: { id }, data: { condition } });
      if (leaveLineup) {
        await removeStarter(client, id);
      }
      return toPlayer(row);
    });
  }

  async markDeleted(id: number, deletedAt: Date): Promise<void> {
    await this.prisma.player.update({ where: { id }, data: { deletedAt } });
  }
}

/** `free=true`: sem clube; `free=false`: com clube; ausente: não filtra. */
function clubPresenceFilter(free: boolean | undefined): null | { not: null } | undefined {
  if (free === undefined) {
    return undefined;
  }
  return free ? null : { not: null };
}
