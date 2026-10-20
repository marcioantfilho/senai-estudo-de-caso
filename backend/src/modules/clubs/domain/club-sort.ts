import { chainComparators, Comparator } from '../../../shared/domain/comparison';
import { compareAlphabetically } from '../../../shared/domain/text-comparison';
import { ClubSummary } from './club';

export const CLUB_SORT_OPTIONS = ['name', 'net_worth_asc', 'net_worth_desc'] as const;

export type ClubSortOption = (typeof CLUB_SORT_OPTIONS)[number];

export const DEFAULT_CLUB_SORT: ClubSortOption = 'name';

const byName: Comparator<ClubSummary> = (left, right) => compareAlphabetically(left.name, right.name);
const byId: Comparator<ClubSummary> = (left, right) => left.id - right.id;

const COMPARATORS: Record<ClubSortOption, Comparator<ClubSummary>> = {
  name: byName,
  net_worth_asc: (left, right) => left.netWorth - right.netWorth,
  net_worth_desc: (left, right) => right.netWorth - left.netWorth,
};

/** RN11: pelo nome ou pelo patrimônio; no empate, o nome e depois o id. */
export function compareClubs(option: ClubSortOption): Comparator<ClubSummary> {
  return chainComparators([COMPARATORS[option], byName, byId]);
}
