const integerFormat = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

/** Inteiro devolvido pela API com separador de milhar (1.089); só formata, não calcula. */
export function formatInteger(value: number): string {
  return integerFormat.format(value)
}
