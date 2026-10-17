import { compareAlphabetically } from '../../../shared/domain/text-comparison';
import { PlayerDetails } from './player';
import { POSITIONS } from './position';

export const PLAYER_SORT_OPTIONS = ['name', 'value_asc', 'value_desc', 'age_asc', 'age_desc', 'position'] as const;

export type PlayerSortOption = (typeof PLAYER_SORT_OPTIONS)[number];

export const DEFAULT_PLAYER_SORT: readonly PlayerSortOption[] = ['name'];
export const MAX_PLAYER_SORT_CRITERIA = 2;

type PlayerComparator = (left: PlayerDetails, right: PlayerDetails) => number;

const byName: PlayerComparator = (left, right) => compareAlphabetically(left.name, right.name);
const byId: PlayerComparator = (left, right) => left.id - right.id;

/** RN07: valor é o de mercado; posição na ordem GOL, ZAG, LAT, MEI, ATA. */
const COMPARATORS: Record<PlayerSortOption, PlayerComparator> = {
  name: byName,
  value_asc: (left, right) => left.marketValue - right.marketValue,
  value_desc: (left, right) => right.marketValue - left.marketValue,
  age_asc: (left, right) => left.age - right.age,
  age_desc: (left, right) => right.age - left.age,
  position: (left, right) => POSITIONS.indexOf(left.position) - POSITIONS.indexOf(right.position),
};

/** Campo ordenado por cada opção; o mesmo campo não pode aparecer duas vezes no `sort`. */
export function sortField(option: PlayerSortOption): string {
  return option.split('_')[0] ?? option;
}

/** RN07: os critérios na ordem pedida e, no empate, o nome e depois o id. */
export function comparePlayers(criteria: readonly PlayerSortOption[]): PlayerComparator {
  const comparators = [...criteria.map((option) => COMPARATORS[option]), byName, byId];
  return (left, right) => {
    for (const compare of comparators) {
      const result = compare(left, right);
      if (result !== 0) {
        return result;
      }
    }
    return 0;
  };
}
