import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { GamesService } from './games.service';
export declare class GamesController {
    private readonly gamesService;
    constructor(gamesService: GamesService);
    listGames(user: AuthenticatedUser | null): Promise<{
        hasInLibrary: boolean;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        steamAppId: number;
        title: string;
        description: string | null;
    }[]>;
    createGame(dto: CreateGameDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        steamAppId: number;
        title: string;
        description: string | null;
    }>;
    updateGame(id: number, dto: UpdateGameDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        steamAppId: number;
        title: string;
        description: string | null;
    }>;
    deleteGame(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        steamAppId: number;
        title: string;
        description: string | null;
    }>;
}
