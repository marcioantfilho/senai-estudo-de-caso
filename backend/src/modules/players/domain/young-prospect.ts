const YOUNG_PROSPECT_MAX_AGE = 21;

/** Jovem promessa: até 21 anos (RN04 pela idade atual; RN06 pela idade do cadastro). */
export function isYoungProspect(age: number): boolean {
  return age <= YOUNG_PROSPECT_MAX_AGE;
}
