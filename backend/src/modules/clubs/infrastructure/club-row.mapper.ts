import { Club as ClubRow } from '@prisma/client';
import { Club } from '../domain/club';

export function toClub(row: ClubRow): Club {
  return { id: row.id, name: row.name, acronym: row.acronym, cash: row.cash.toNumber() };
}
