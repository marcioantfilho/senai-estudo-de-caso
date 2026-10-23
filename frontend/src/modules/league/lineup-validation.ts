import type { Formation } from './api/lineup-api'

export type LineupDraft = {
  formation: Formation | undefined
  slots: (number | undefined)[]
}

export type LineupErrors = {
  formation?: string
  slots: (string | undefined)[]
}

/** Obrigatórios antes de enviar: a formação e um titular distinto em cada uma das 5 vagas (RN19). */
export function validateLineup({ formation, slots }: LineupDraft): LineupErrors {
  return {
    formation: formation ? undefined : 'Escolha a formação.',
    slots: slots.map((playerId, index) => {
      if (playerId === undefined) {
        return 'Escolha um titular para esta vaga.'
      }
      return slots.indexOf(playerId) < index ? 'Este jogador já está em outra vaga.' : undefined
    }),
  }
}

export function hasLineupErrors(errors: LineupErrors): boolean {
  return Boolean(errors.formation) || errors.slots.some(Boolean)
}
