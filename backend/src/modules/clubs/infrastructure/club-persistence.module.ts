import { Module } from '@nestjs/common';
import { ClubRepository } from '../application/club.repository';
import { PrismaClubRepository } from './prisma-club.repository';

/** Repositório de clubes, compartilhado com os módulos que dependem dos clubes. */
@Module({
  providers: [{ provide: ClubRepository, useClass: PrismaClubRepository }],
  exports: [ClubRepository],
})
export class ClubPersistenceModule {}
