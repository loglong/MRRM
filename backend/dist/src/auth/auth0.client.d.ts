interface AuthingUser {
    id: string;
    email: string;
    name?: string;
    orgId?: string;
    phone?: string;
}
export declare class Auth0Client {
    private logger;
    private baseUrl;
    private appId;
    private appSecret;
    constructor();
    verifyToken(token: string): Promise<AuthingUser>;
    private decodeJWT;
    getUserInfo(accessToken: string): Promise<AuthingUser>;
}
export {};
