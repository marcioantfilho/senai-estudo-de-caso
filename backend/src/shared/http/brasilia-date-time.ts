const INPUT_FORMAT = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})-03:00$/;
const BRASILIA_OFFSET_HOURS = 3;
const MILLISECONDS_PER_HOUR = 3_600_000;

/**
 * RN01: lê `AAAA-MM-DDTHH:MM-03:00`. Devolve `null` para outro formato e para
 * data ou hora inexistente (como 30/02 ou 24:00), que nunca é ajustada.
 */
export function parseBrasiliaDateTime(text: string): Date | null {
  const match = INPUT_FORMAT.exec(text);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  if (hour > 23 || minute > 59) {
    return null;
  }

  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  const isRealDate =
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  if (!isRealDate) {
    return null;
  }

  date.setUTCHours(hour + BRASILIA_OFFSET_HOURS, minute, 0, 0);
  return date;
}

/** RN01: escreve o instante como `AAAA-MM-DDTHH:MM:SS-03:00`. */
export function formatBrasiliaDateTime(instant: Date): string {
  const local = new Date(instant.getTime() - BRASILIA_OFFSET_HOURS * MILLISECONDS_PER_HOUR);
  const date = [
    pad(local.getUTCFullYear(), 4),
    pad(local.getUTCMonth() + 1),
    pad(local.getUTCDate()),
  ].join('-');
  const time = [pad(local.getUTCHours()), pad(local.getUTCMinutes()), pad(local.getUTCSeconds())].join(':');
  return `${date}T${time}-03:00`;
}

function pad(value: number, length = 2): string {
  return String(value).padStart(length, '0');
}
