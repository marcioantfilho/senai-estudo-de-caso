import { Module } from '@nestjs/common';
import { ClubRepository } from './application/club.repository';
import { PrismaClubRepository } from './infrastructure/prisma-club.repository';

@Module({
  providers: [{ provide: ClubRepository, useClass: PrismaClubRepository }],
  exports: [ClubRepository],
})
export class ClubsModule {}
