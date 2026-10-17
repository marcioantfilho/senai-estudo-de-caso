import { describe, expect, it } from 'vitest';
import { paginate } from '../../../src/shared/application/pagination';

const items = (count: number): number[] => Array.from({ length: count }, (_, index) => index + 1);

describe('paginate (RN07)', () => {
  it.each([
    [23, 10, 1, [1, 10], 3],
    [23, 10, 3, [21, 23], 3],
    [23, 10, 4, null, 3],
    [23, 50, 1, [1, 23], 1],
    [0, 10, 1, null, 0],
  ])('%d itens, limit %d, page %d', (total, limit, page, range, totalPages) => {
    const result = paginate(items(total), { page, limit });
    const expected = range === null ? [] : items(range[1]).slice(range[0] - 1);
    expect(result.data).toEqual(expected);
    expect(result.meta).toEqual({ page, limit, totalItems: total, totalPages });
  });
});
