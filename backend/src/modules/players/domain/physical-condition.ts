export const PHYSICAL_CONDITIONS = ['APTO', 'MAL_CONDICIONADO', 'DOENTE'] as const;

export type PhysicalCondition = (typeof PHYSICAL_CONDITIONS)[number];
