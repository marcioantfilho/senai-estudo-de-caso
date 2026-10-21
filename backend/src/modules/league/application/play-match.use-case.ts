import { Injectable } from '@nestjs/common';
import { BusinessRuleException, ResourceNotFoundException } from '../../../shared/http/api.exception';
import { Club } from '../../clubs/domain/club';
import { isLineupComplete } from '../domain/lineup';
import { PlayedMatch, playMatch, TeamSheet } from '../domain/match';
import { LeagueRepository, LeagueSession } from './league.repository';

export interface MatchOrder {
  homeClubId: number;
  awayClubId: number;
}

export interface RecordedMatch extends PlayedMatch {
  id: number;
  playedAt: Date;
}

/** RN20: joga a partida na hora e grava tudo numa única transação; recusada, nada é gravado. */
@Injectable()
export class PlayMatchUseCase {
  constructor(private readonly league: LeagueRepository) {}

  execute({ homeClubId, awayClubId }: MatchOrder): Promise<RecordedMatch> {
    const playedAt = new Date();
    return this.league.inTransaction(async (session) => {
      const clubs = await session.lockClubsForMatch([homeClubId, awayClubId]);
      const home = findClub(clubs, homeClubId);
      const away = findClub(clubs, awayClubId);

      const match = playMatch(await teamSheet(session, home), await teamSheet(session, away));
      const id = await session.recordMatch(match, playedAt);
      return { id, playedAt, ...match };
    });
  }
}

function findClub(clubs: readonly Club[], id: number): Club {
  const club = clubs.find((candidate) => candidate.id === id);
  if (club === undefined) {
    throw new ResourceNotFoundException('Clube não encontrado.');
  }
  return club;
}

/** RN20: clube sem a escalação completa, com os 5 titulares, não joga. */
async function teamSheet(session: LeagueSession, club: Club): Promise<TeamSheet> {
  const { formation, starters } = await session.findLineup(club.id);
  if (formation === null || !isLineupComplete(starters.length)) {
    throw new BusinessRuleException(`O clube ${club.name} não tem a escalação completa, com os 5 titulares.`);
  }
  return { clubId: club.id, clubName: club.name, formation, starters };
}
