export const API_PREFIX = 'api/v1';

export function resourceLocation(...segments: Array<string | number>): string {
  return `/${API_PREFIX}/${segments.join('/')}`;
}
