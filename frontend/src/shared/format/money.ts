const moneyFormat = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** Valor devolvido pela API com 2 casas e vírgula decimal; só formata, não calcula. */
export function formatMoney(value: number): string {
  return moneyFormat.format(value)
}

/** Valor com sinal ("+" para entrada e "-" para saída), como `cash_change` e `profit`; só formata. */
export function formatSignedMoney(value: number): string {
  return value > 0 ? `+${formatMoney(value)}` : formatMoney(value)
}
