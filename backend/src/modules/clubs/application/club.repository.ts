export abstract class ClubRepository {
  abstract exists(id: number): Promise<boolean>;
}
