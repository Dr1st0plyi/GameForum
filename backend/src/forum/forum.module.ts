import { Module } from '@nestjs/common';
import { PostsController } from './posts/posts.controller';
import { PostsService } from './posts/posts.service';
import { ThreadsController } from './threads/threads.controller';
import { ThreadsService } from './threads/threads.service';

@Module({
  controllers: [ThreadsController, PostsController],
  providers: [ThreadsService, PostsService],
})
export class ForumModule {}
