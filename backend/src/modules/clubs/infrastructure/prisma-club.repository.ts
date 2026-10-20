import { Injectable } from '@nestjs/common';
import { Club as ClubRow, Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { ClubCreationResult, ClubRepository } from '../application/club.repository';
import { Club, NewClub } from '../domain/club';

const UNIQUE_VIOLATION = 'P2002';

@Injectable()
export class PrismaClubRepository extends ClubRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async exists(id: number): Promise<boolean> {
    return (await this.prisma.club.count({ where: { id } })) > 0;
  }

  async isNameTaken(name: string): Promise<boolean> {
    const [row] = await this.prisma.$queryRaw<{ taken: boolean }[]>`
      SELECT EXISTS (SELECT 1 FROM clubes WHERE lower(nome) = lower(${name})) AS taken`;
    return row?.taken ?? false;
  }

  async isAcronymTaken(acronym: string): Promise<boolean> {
    return (await this.prisma.club.count({ where: { acronym } })) > 0;
  }

  async createWithinLimit(club: NewClub, maxClubs: number): Promise<ClubCreationResult> {
    try {
      return await this.prisma.$transaction(async (transaction) => {
        await transaction.$executeRaw`LOCK TABLE clubes IN SHARE ROW EXCLUSIVE MODE`;
        if ((await transaction.club.count()) >= maxClubs) {
          return { status: 'LEAGUE_FULL' };
        }

        const row = await transaction.club.create({
          data: { name: club.name, acronym: club.acronym, cash: club.cash.toFixed(2) },
        });
        return { status: 'CREATED', club: toClub(row) };
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === UNIQUE_VIOLATION) {
        return { status: 'DUPLICATE' };
      }
      throw error;
    }
  }
}

function toClub(row: ClubRow): Club {
  return { id: row.id, name: row.name, acronym: row.acronym, cash: row.cash.toNumber() };
}
