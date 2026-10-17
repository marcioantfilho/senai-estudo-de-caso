/** De trás para frente: a ordem do elenco, da listagem por posição e da escalação. */
export const POSITIONS = ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA'] as const;

export type Position = (typeof POSITIONS)[number];
