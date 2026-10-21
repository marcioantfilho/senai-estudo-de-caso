import { Injectable } from '@nestjs/common';
import { BusinessRuleException, ResourceNotFoundException } from '../../../shared/http/api.exception';
import { canBeStarter, fitsFormation, Formation } from '../domain/lineup';
import { LeagueRepository } from './league.repository';
import { describeLineup, LineupDetails } from './lineup-details';

export interface LineupOrder {
  formation: Formation;
  playerIds: number[];
}

/** RN19: substitui a escalação inteira numa única transação; recusada, nada muda. */
@Injectable()
export class SetLineupUseCase {
  constructor(private readonly league: LeagueRepository) {}

  execute(clubId: number, { formation, playerIds }: LineupOrder): Promise<LineupDetails> {
    return this.league.inTransaction(async (session) => {
      const players = await session.lockActivePlayers(playerIds);
      const club = await session.lockClub(clubId);
      if (club === null) {
        throw new ResourceNotFoundException('Clube não encontrado.');
      }
      if (players.length !== playerIds.length) {
        throw new ResourceNotFoundException('Jogador não encontrado.');
      }

      if (players.some((player) => player.clubId !== clubId)) {
        throw new BusinessRuleException('Todos os titulares precisam ser do elenco do clube.');
      }
      if (players.some((player) => !canBeStarter(player.condition))) {
        throw new BusinessRuleException('Jogador DOENTE não pode ser escalado.');
      }
      if (!fitsFormation(players.map(({ position }) => position), formation)) {
        throw new BusinessRuleException(
          `As posições dos titulares não fecham a formação ${formation}: 1 GOL e os jogadores de linha de cada setor.`,
        );
      }

      return describeLineup(await session.replaceLineup(clubId, formation, playerIds));
    });
  }
}
