import { Injectable } from '@nestjs/common';
import { BusinessRuleException } from '../../../shared/http/api.exception';
import { ClubRegistration, ClubSummary, createClub, MAX_CLUBS, summarizeClub } from '../domain/club';
import { ClubRepository } from './club.repository';

@Injectable()
export class CreateClubUseCase {
  constructor(private readonly clubs: ClubRepository) {}

  async execute(registration: ClubRegistration): Promise<ClubSummary> {
    if (await this.clubs.isNameTaken(registration.name)) {
      throw new BusinessRuleException('Já existe um clube com esse nome.');
    }
    if (await this.clubs.isAcronymTaken(registration.acronym)) {
      throw new BusinessRuleException('Já existe um clube com essa sigla.');
    }

    const result = await this.clubs.createWithinLimit(createClub(registration), MAX_CLUBS);
    switch (result.status) {
      case 'LEAGUE_FULL':
        throw new BusinessRuleException(`A liga já tem o máximo de ${MAX_CLUBS} clubes.`);
      case 'DUPLICATE':
        throw new BusinessRuleException('Já existe um clube com esse nome ou essa sigla.');
      case 'CREATED':
        return summarizeClub(result.club, []);
    }
  }
}
