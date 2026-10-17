import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { ClubRepository } from '../application/club.repository';

@Injectable()
export class PrismaClubRepository extends ClubRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async exists(id: number): Promise<boolean> {
    return (await this.prisma.club.count({ where: { id } })) > 0;
  }
}
