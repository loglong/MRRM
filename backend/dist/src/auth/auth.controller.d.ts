import { Response, Request as ExpressRequest } from 'express';
import { AuthService, AuthResponse } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto, res: Response): Promise<AuthResponse>;
    login(dto: LoginDto, res: Response): Promise<AuthResponse>;
    logout(res: Response): Promise<{
        success: boolean;
    }>;
    refresh(req: ExpressRequest): Promise<{
        accessToken: any;
    }>;
    getProfile(req: any): Promise<any>;
    getAuthingSSOUrl(): Promise<{
        url: string;
    }>;
    authingCallback(code: string, res: Response): Promise<AuthResponse>;
}
