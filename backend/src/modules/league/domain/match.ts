import { roundedDivision } from '../../../shared/domain/rounding';
import { PlayerAttributes } from '../../players/domain/overall';
import { PhysicalCondition } from '../../players/domain/physical-condition';
import { Player } from '../../players/domain/player';
import { compareSquadOrder } from '../../players/domain/player-sort';
import { Position } from '../../players/domain/position';
import { Formation } from './lineup';

export const MATCH_RESULTS = ['MANDANTE', 'VISITANTE', 'EMPATE'] as const;

export type MatchResult = (typeof MATCH_RESULTS)[number];

type AttackAttribute = 'shooting' | 'passing' | 'dribbling';
type DefenseAttribute = 'defending';
type OutfieldPosition = Exclude<Position, 'GOL'>;

/** RN20: o atacante usa o atributo da posição dele; o defensor usa sempre a defesa. */
const ATTACK_ATTRIBUTE: Record<OutfieldPosition, AttackAttribute> = {
  ZAG: 'dribbling',
  LAT: 'dribbling',
  MEI: 'passing',
  ATA: 'shooting',
};
const DEFENSE_ATTRIBUTE: DefenseAttribute = 'defending';

/** RN20: titular MAL_CONDICIONADO joga com 15% a menos em cada atributo. */
const UNFIT_PERCENT = 85;

export interface TeamSheet {
  clubId: number;
  clubName: string;
  formation: Formation;
  starters: readonly Player[];
}

export interface DuelSide {
  playerId: number;
  playerName: string;
  position: Position;
  condition: PhysicalCondition;
  attribute: AttackAttribute | DefenseAttribute;
  value: number;
}

export interface Duel {
  order: number;
  attackingClubId: number;
  attacker: DuelSide;
  defender: DuelSide;
  goal: boolean;
}

export interface MatchSide {
  clubId: number;
  clubName: string;
  formation: Formation;
  goals: number;
}

export interface PlayedMatch {
  home: MatchSide;
  away: MatchSide;
  result: MatchResult;
  duels: Duel[];
}

type OutfieldPlayer = Player & { position: OutfieldPosition };

interface ArrangedTeam {
  clubId: number;
  goalkeeper: Player;
  outfield: readonly [OutfieldPlayer, OutfieldPlayer, OutfieldPlayer, OutfieldPlayer];
}

/** RN20: atributo do cadastro; MAL_CONDICIONADO × 0,85, inteiro mais próximo, meio para cima. */
export function matchValue(attribute: number, condition: PhysicalCondition): number {
  return condition === 'MAL_CONDICIONADO' ? roundedDivision(attribute * UNFIT_PERCENT, 100) : attribute;
}

/** RN20: 6 duelos sem sorteio; gol só quando o ataque é maior que a defesa. */
export function playMatch(home: TeamSheet, away: TeamSheet): PlayedMatch {
  const homeTeam = arrange(home);
  const awayTeam = arrange(away);
  const duels = [...attacks(homeTeam, awayTeam, 1), ...attacks(awayTeam, homeTeam, 4)];
  const homeGoals = countGoals(duels, home.clubId);
  const awayGoals = countGoals(duels, away.clubId);
  return {
    home: { clubId: home.clubId, clubName: home.clubName, formation: home.formation, goals: homeGoals },
    away: { clubId: away.clubId, clubName: away.clubName, formation: away.formation, goals: awayGoals },
    result: matchResult(homeGoals, awayGoals),
    duels,
  };
}

/** RN20: o goleiro e os 4 jogadores de linha, numerados pela ordem do elenco. */
function arrange({ clubId, starters }: TeamSheet): ArrangedTeam {
  const [goalkeeper, first, second, third, fourth, ...extra] = [...starters].sort(compareSquadOrder);
  if (
    goalkeeper?.position !== 'GOL' ||
    extra.length > 0 ||
    !isOutfield(first) ||
    !isOutfield(second) ||
    !isOutfield(third) ||
    !isOutfield(fourth)
  ) {
    throw new Error(`Escalação do clube ${clubId} sem 1 goleiro e 4 jogadores de linha.`);
  }
  return { clubId, goalkeeper, outfield: [first, second, third, fourth] };
}

function isOutfield(player: Player | undefined): player is OutfieldPlayer {
  return player !== undefined && player.position !== 'GOL';
}

/** RN20: o 4º enfrenta o goleiro, o 3º enfrenta o 1º e o 2º enfrenta o 2º do adversário. */
function attacks(attacking: ArrangedTeam, defending: ArrangedTeam, firstOrder: number): Duel[] {
  const [, second, third, fourth] = attacking.outfield;
  const [firstDefender, secondDefender] = defending.outfield;
  const pairs: [OutfieldPlayer, Player][] = [
    [fourth, defending.goalkeeper],
    [third, firstDefender],
    [second, secondDefender],
  ];
  return pairs.map(([attacker, defender], index) => duel(firstOrder + index, attacking.clubId, attacker, defender));
}

function duel(order: number, attackingClubId: number, attacker: OutfieldPlayer, defender: Player): Duel {
  const attackSide = side(attacker, ATTACK_ATTRIBUTE[attacker.position]);
  const defenseSide = side(defender, DEFENSE_ATTRIBUTE);
  return { order, attackingClubId, attacker: attackSide, defender: defenseSide, goal: attackSide.value > defenseSide.value };
}

function side(player: Player, attribute: keyof PlayerAttributes & (AttackAttribute | DefenseAttribute)): DuelSide {
  return {
    playerId: player.id,
    playerName: player.name,
    position: player.position,
    condition: player.condition,
    attribute,
    value: matchValue(player.attributes[attribute], player.condition),
  };
}

function countGoals(duels: readonly Duel[], clubId: number): number {
  return duels.filter((duel) => duel.attackingClubId === clubId && duel.goal).length;
}

function matchResult(homeGoals: number, awayGoals: number): MatchResult {
  if (homeGoals > awayGoals) {
    return 'MANDANTE';
  }
  return homeGoals < awayGoals ? 'VISITANTE' : 'EMPATE';
}
