const moneyFormat = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** Valor devolvido pela API com 2 casas e vírgula decimal; só formata, não calcula. */
export function formatMoney(value: number): string {
  return moneyFormat.format(value)
}
