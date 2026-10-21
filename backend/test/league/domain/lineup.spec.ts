import { describe, expect, it } from 'vitest';
import { canBeStarter, fitsFormation, Formation, isLineupComplete } from '../../../src/modules/league/domain/lineup';
import { Position } from '../../../src/modules/players/domain/position';

describe('fitsFormation (RN19)', () => {
  it.each<[Formation, Position[]]>([
    ['3-1', ['GOL', 'ZAG', 'LAT', 'LAT', 'ATA']],
    ['3-1', ['GOL', 'ZAG', 'ZAG', 'ZAG', 'ATA']],
    ['2-2', ['GOL', 'ZAG', 'LAT', 'ATA', 'ATA']],
    ['2-1-1', ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA']],
    ['2-1-1', ['ATA', 'MEI', 'LAT', 'GOL', 'ZAG']],
    ['1-2-1', ['GOL', 'ZAG', 'MEI', 'MEI', 'ATA']],
    ['1-2-1', ['GOL', 'LAT', 'MEI', 'MEI', 'ATA']],
  ])('%s aceita %j', (formation, positions) => {
    expect(fitsFormation(positions, formation)).toBe(true);
  });

  it.each<[Formation, Position[], string]>([
    ['2-1-1', ['GOL', 'ZAG', 'LAT', 'ATA', 'ATA'], 'sem MEI'],
    ['3-1', ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA'], 'MEI não é defesa'],
    ['2-2', ['GOL', 'ZAG', 'LAT', 'LAT', 'ATA'], 'defesa demais'],
    ['1-2-1', ['GOL', 'ZAG', 'MEI', 'ATA', 'ATA'], 'meio de menos'],
    ['2-1-1', ['GOL', 'GOL', 'LAT', 'MEI', 'ATA'], 'dois goleiros'],
    ['2-1-1', ['ZAG', 'ZAG', 'LAT', 'MEI', 'ATA'], 'sem goleiro'],
  ])('%s recusa %j (%s)', (formation, positions) => {
    expect(fitsFormation(positions, formation)).toBe(false);
  });
});

describe('canBeStarter e isLineupComplete (RN19)', () => {
  it('APTO e MAL_CONDICIONADO podem ser titulares; DOENTE não', () => {
    expect(canBeStarter('APTO')).toBe(true);
    expect(canBeStarter('MAL_CONDICIONADO')).toBe(true);
    expect(canBeStarter('DOENTE')).toBe(false);
  });

  it('completa só com 5 titulares', () => {
    expect(isLineupComplete(5)).toBe(true);
    expect(isLineupComplete(4)).toBe(false);
    expect(isLineupComplete(0)).toBe(false);
  });
});
