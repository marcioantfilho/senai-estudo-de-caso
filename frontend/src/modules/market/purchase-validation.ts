/** Campos do formulário de compra, como digitados na tela (data e hora de Brasília). */
export type PurchaseDraft = {
  clubId: string
  loyaltyDate: string
  loyaltyTime: string
}

export type PurchaseErrors = Partial<Record<keyof PurchaseDraft, string>>

const BRASILIA_OFFSET = '-03:00'
const HOUR_AND_MINUTE_LENGTH = 5

/** Só os campos obrigatórios; o fim da fidelidade em relação ao momento da compra fica com a API. */
export function validatePurchase(draft: PurchaseDraft): PurchaseErrors {
  return {
    clubId: draft.clubId ? undefined : 'Escolha o clube comprador.',
    loyaltyDate: draft.loyaltyDate ? undefined : 'Informe a data do fim da fidelidade.',
    loyaltyTime: draft.loyaltyTime ? undefined : 'Informe a hora do fim da fidelidade.',
  }
}

/** RN01: a data e a hora digitadas são de Brasília e vão no formato `AAAA-MM-DDTHH:MM-03:00`. */
export function toLoyaltyUntil(date: string, time: string): string {
  return `${date}T${time.slice(0, HOUR_AND_MINUTE_LENGTH)}${BRASILIA_OFFSET}`
}
