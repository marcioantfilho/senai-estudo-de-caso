export type Comparator<T> = (left: T, right: T) => number;

/** Aplica os critérios em ordem: cada um só desempata o anterior. */
export function chainComparators<T>(comparators: readonly Comparator<T>[]): Comparator<T> {
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
