// Rules for data that belongs to a single user: their profile, notification
// inbox and preferences, block list. Only that user may manage it; there is no
// admin override yet. Reading public profiles needs no rule here.
export class UserPolicy {
  static canManage(userId: string, targetUserId: string): boolean {
    return userId === targetUserId;
  }
}
