// Thread-local storage for current user context
// Used by Prisma Middleware to auto-inject org_id filter

export interface AuthUser {
  userId: string;
  orgId: string;
  role: string;
}

export class AuthContext {
  private static _current: AuthUser | null = null;

  static set(user: AuthUser): void {
    this._current = user;
  }

  static current(): AuthUser | null {
    return this._current;
  }

  static clear(): void {
    this._current = null;
  }

  static getOrgId(): string | null {
    return this._current?.orgId ?? null;
  }

  static getUserId(): string | null {
    return this._current?.userId ?? null;
  }
}
