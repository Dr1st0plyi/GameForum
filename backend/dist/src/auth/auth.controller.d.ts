import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    steamLogin(): Promise<void>;
    steamCallback(req: Request, res: Response): Promise<void>;
    login(_dto: LoginDto, req: Request): Promise<{
        accessToken: string;
        user: import("./interfaces/authenticated-user.interface").AuthenticatedUser;
    }>;
    logout(): Promise<{
        success: boolean;
    }>;
}
