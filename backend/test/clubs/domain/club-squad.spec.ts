import { describe, expect, it } from 'vitest';
import { buildSquad } from '../../../src/modules/clubs/domain/club-squad';
import { PlayerDetails } from '../../../src/modules/players/domain/player';
import { Position } from '../../../src/modules/players/domain/position';

const player = (id: number, name: string, position: Position): PlayerDetails =>
  ({ id, name, position }) as PlayerDetails;

const at = new Date('2026-11-02T13:15:00.000Z');
const loyaltyUntil = new Date('2026-12-02T13:15:00.000Z');

describe('buildSquad (RN11)', () => {
  const players = [
    player(1, 'Zé Ataque', 'ATA'),
    player(2, 'Ivo Meio', 'MEI'),
    player(3, 'Ana Meio', 'MEI'),
    player(4, 'Rui Goleiro', 'GOL'),
    player(5, 'Lino Lateral', 'LAT'),
    player(6, 'Téo Zaga', 'ZAG'),
    player(7, 'Ana Meio', 'MEI'),
  ];
  const contracts = players.map(({ id }) => ({ playerId: id, purchaseValue: 10, loyaltyUntil }));

  it('ordena por posição GOL, ZAG, LAT, MEI, ATA, depois nome e id', () => {
    expect(buildSquad(players, contracts, at).map(({ id }) => id)).toEqual([4, 6, 5, 3, 7, 2, 1]);
  });

  it('traz o contrato calculado no instante da consulta', () => {
    const [first] = buildSquad(players, contracts, at);
    expect(first?.contract).toEqual({ purchaseValue: 10, loyaltyUntil, remainingDays: 30, penaltyRate: 5 });
  });
});
