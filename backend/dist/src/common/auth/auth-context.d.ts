export interface AuthUser {
    userId: string;
    orgId: string;
    role: string;
}
export declare class AuthContext {
    private static _current;
    static set(user: AuthUser): void;
    static current(): AuthUser | null;
    static clear(): void;
    static getOrgId(): string | null;
    static getUserId(): string | null;
}
