"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    const adminEmail = process.env.ADMIN_DEFAULT_EMAIL ?? 'admin@example.com';
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD ?? 'password123';
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: { passwordHash },
        create: {
            email: adminEmail,
            passwordHash,
            role: client_1.UserRole.ADMIN,
        },
    });
    const developer = await prisma.user.upsert({
        where: { email: 'dev@example.com' },
        update: {},
        create: {
            email: 'dev@example.com',
            passwordHash: await bcrypt.hash('devpass', 10),
            role: client_1.UserRole.DEVELOPER,
        },
    });
    const user = await prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: {},
        create: {
            email: 'user@example.com',
            passwordHash: await bcrypt.hash('userpass', 10),
            role: client_1.UserRole.USER,
            steamId: 'STEAM_USER_1',
        },
    });
    const dota2 = await prisma.game.upsert({
        where: { steamAppId: 570 },
        update: {},
        create: {
            steamAppId: 570,
            title: 'Dota 2',
            description: 'Multiplayer online battle arena.',
        },
    });
    await prisma.game.upsert({
        where: { steamAppId: 730 },
        update: {},
        create: {
            steamAppId: 730,
            title: 'Counter-Strike 2',
            description: 'Tactical FPS for competitive play.',
        },
    });
    await prisma.developerGame.upsert({
        where: {
            developerId_gameId: {
                developerId: developer.id,
                gameId: dota2.id,
            },
        },
        update: {},
        create: {
            developerId: developer.id,
            gameId: dota2.id,
        },
    });
    await prisma.userGame.upsert({
        where: {
            userId_gameId: {
                userId: user.id,
                gameId: dota2.id,
            },
        },
        update: { lastSyncedAt: new Date() },
        create: {
            userId: user.id,
            gameId: dota2.id,
            lastSyncedAt: new Date(),
        },
    });
    const existingThread = await prisma.thread.findFirst({
        where: {
            gameId: dota2.id,
            title: 'Первое впечатление от патча',
        },
    });
    const thread = existingThread ??
        (await prisma.thread.create({
            data: {
                gameId: dota2.id,
                authorId: user.id,
                title: 'Первое впечатление от патча',
            },
        }));
    const existingPosts = await prisma.post.count({ where: { threadId: thread.id } });
    if (existingPosts === 0) {
        await prisma.post.createMany({
            data: [
                {
                    threadId: thread.id,
                    authorId: user.id,
                    content: 'Очень понравились изменения.',
                },
                {
                    threadId: thread.id,
                    authorId: developer.id,
                    content: 'Спасибо за отзыв! Мы продолжаем работу.',
                },
            ],
        });
    }
    const existingBugReport = await prisma.bugReport.findFirst({
        where: {
            gameId: dota2.id,
            title: 'Вылет при старте матча',
        },
    });
    const bugReport = existingBugReport ??
        (await prisma.bugReport.create({
            data: {
                gameId: dota2.id,
                authorId: user.id,
                title: 'Вылет при старте матча',
                description: 'После нажатия "Start" игра вылетает на рабочий стол.',
                status: client_1.BugReportStatus.VISIBLE_TO_DEV,
            },
        }));
    const statusLogExists = await prisma.bugReportStatusChange.findFirst({
        where: {
            bugReportId: bugReport.id,
            newStatus: client_1.BugReportStatus.VISIBLE_TO_DEV,
        },
    });
    if (!statusLogExists) {
        await prisma.bugReportStatusChange.create({
            data: {
                bugReportId: bugReport.id,
                changedById: admin.id,
                oldStatus: client_1.BugReportStatus.PENDING_ADMIN,
                newStatus: client_1.BugReportStatus.VISIBLE_TO_DEV,
            },
        });
    }
    if (!existingBugReport) {
        await prisma.bugReportComment.create({
            data: {
                bugReportId: bugReport.id,
                authorId: developer.id,
                content: 'Команда изучает проблему и сообщит детали позже.',
            },
        });
    }
    console.log('Seed completed');
}
main()
    .catch((error) => {
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map