import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Auth0Client } from './auth0.client';
import { LoginDto, RegisterDto } from './dto';
export { LoginDto, RegisterDto };
export interface AuthResponse {
    accessToken: string;
    user: {
        id: string;
        email: string;
        name: string;
        orgId: string;
    };
}
export declare class AuthService {
    private usersService;
    private jwtService;
    private auth0Client;
    private logger;
    constructor(usersService: UsersService, jwtService: JwtService, auth0Client: Auth0Client);
    validateUser(email: string, password: string, orgId?: string): Promise<any>;
    login(dto: LoginDto): Promise<AuthResponse>;
    register(dto: RegisterDto): Promise<AuthResponse>;
    ssoLogin(authingToken: string): Promise<AuthResponse>;
    getProfile(userId: string): Promise<any>;
}
