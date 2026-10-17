import { Injectable } from '@nestjs/common';
import { Player as PlayerRow } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { PlayerFilter, PlayerRepository } from '../application/player.repository';
import { PhysicalCondition } from '../domain/physical-condition';
import { NewPlayer, Player, PlayerProfile } from '../domain/player';
import { Position } from '../domain/position';

@Injectable()
export class PrismaPlayerRepository extends PlayerRepository {
  constructor(private readonly prisma: PrismaService) {
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

  async updateCondition(id: number, condition: PhysicalCondition): Promise<Player> {
    const row = await this.prisma.player.update({ where: { id }, data: { condition } });
    return toPlayer(row);
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

function toPlayer(row: PlayerRow): Player {
  return {
    id: row.id,
    name: row.name,
    position: row.position as Position,
    agility: row.agility,
    age: row.age,
    baseValue: row.baseValue.toNumber(),
    condition: row.condition as PhysicalCondition,
    clubId: row.clubId,
    attributes: {
      pace: row.pace,
      shooting: row.shooting,
      passing: row.passing,
      dribbling: row.dribbling,
      defending: row.defending,
      physical: row.physical,
    },
    potential: row.potential,
  };
}
