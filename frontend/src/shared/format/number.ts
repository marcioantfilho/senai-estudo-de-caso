const integerFormat = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

/** Inteiro devolvido pela API com separador de milhar (1.089); só formata, não calcula. */
export function formatInteger(value: number): string {
  return integerFormat.format(value)
}

/** Inteiro com sinal ("+2", "0", "-1"), como o saldo de gols; só formata. */
export function formatSignedInteger(value: number): string {
  return value > 0 ? `+${formatInteger(value)}` : formatInteger(value)
}
