import { Module } from '@nestjs/common';
import { ClubRepository } from './application/club.repository';
import { CreateClubUseCase } from './application/create-club.use-case';
import { ClubsController } from './http/clubs.controller';
import { PrismaClubRepository } from './infrastructure/prisma-club.repository';

@Module({
  controllers: [ClubsController],
  providers: [{ provide: ClubRepository, useClass: PrismaClubRepository }, CreateClubUseCase],
  exports: [ClubRepository],
})
export class ClubsModule {}
