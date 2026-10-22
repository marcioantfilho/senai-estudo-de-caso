import { MatchDuel as DuelRow, Prisma } from '@prisma/client';
import { PhysicalCondition } from '../../players/domain/physical-condition';
import { Position } from '../../players/domain/position';
import { Formation } from '../domain/lineup';
import { Duel, DuelSide, matchResult, MatchSummary, RecordedMatch } from '../domain/match';

export const MATCH_CLUBS = {
  homeClub: { select: { name: true } },
  awayClub: { select: { name: true } },
} satisfies Prisma.MatchInclude;

export const MATCH_WITH_DUELS = {
  ...MATCH_CLUBS,
  duels: { orderBy: { order: 'asc' } },
} satisfies Prisma.MatchInclude;

type MatchRow = Prisma.MatchGetPayload<{ include: typeof MATCH_CLUBS }>;
type MatchWithDuelsRow = Prisma.MatchGetPayload<{ include: typeof MATCH_WITH_DUELS }>;

/** Partida como foi gravada; `result` sai dos gols gravados. */
export function toMatchSummary(row: MatchRow): MatchSummary {
  return {
    id: row.id,
    playedAt: row.playedAt,
    home: {
      clubId: row.homeClubId,
      clubName: row.homeClub.name,
      formation: row.homeFormation as Formation,
      goals: row.homeGoals,
    },
    away: {
      clubId: row.awayClubId,
      clubName: row.awayClub.name,
      formation: row.awayFormation as Formation,
      goals: row.awayGoals,
    },
    result: matchResult(row.homeGoals, row.awayGoals),
  };
}

export function toRecordedMatch(row: MatchWithDuelsRow): RecordedMatch {
  return { ...toMatchSummary(row), duels: row.duels.map(toDuel) };
}

function toDuel(row: DuelRow): Duel {
  return {
    order: row.order,
    attackingClubId: row.attackingClubId,
    attacker: {
      playerId: row.attackerId,
      playerName: row.attackerName,
      position: row.attackerPosition as Position,
      condition: row.attackerCondition as PhysicalCondition,
      attribute: row.attackAttribute as DuelSide['attribute'],
      value: row.attackValue,
    },
    defender: {
      playerId: row.defenderId,
      playerName: row.defenderName,
      position: row.defenderPosition as Position,
      condition: row.defenderCondition as PhysicalCondition,
      attribute: row.defenseAttribute as DuelSide['attribute'],
      value: row.defenseValue,
    },
    goal: row.goal,
  };
}
