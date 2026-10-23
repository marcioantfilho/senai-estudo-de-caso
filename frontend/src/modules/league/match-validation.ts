export type MatchDraft = {
  homeClubId: string
  awayClubId: string
}

export type MatchErrors = Partial<Record<keyof MatchDraft, string>>

/** Obrigatórios antes de enviar: o mandante e um visitante diferente; a escalação completa fica com a API. */
export function validateMatch({ homeClubId, awayClubId }: MatchDraft): MatchErrors {
  return {
    homeClubId: homeClubId ? undefined : 'Escolha o mandante.',
    awayClubId: !awayClubId
      ? 'Escolha o visitante.'
      : awayClubId === homeClubId ? 'Escolha um clube diferente do mandante.' : undefined,
  }
}
