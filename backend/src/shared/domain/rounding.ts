/** Divisão de inteiros arredondada para o inteiro mais próximo, com o meio para longe do zero. */
export function roundedDivision(numerator: number, denominator: number): number {
  const sign = Math.sign(numerator) * Math.sign(denominator);
  const dividend = Math.abs(numerator);
  const divisor = Math.abs(denominator);
  const quotient = Math.floor(dividend / divisor);
  const remainder = dividend - quotient * divisor;
  const roundsAway = remainder * 2 >= divisor;
  return sign * (roundsAway ? quotient + 1 : quotient);
}
