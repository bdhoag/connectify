import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../auth/presentation/guards/jwt-auth.guard';
import { CreatePostDto } from '../../application/dto/create-post.dto';
import { QueryPostDto } from '../../application/dto/query-post.dto';
import { UpdatePostDto } from '../../application/dto/update-post.dto';
import { CreatePostUseCase } from '../../application/use-cases/create-post.use-case';
import { DeletePostUseCase } from '../../application/use-cases/delete-post.use-case';
import { FindPostByIdUseCase } from '../../application/use-cases/find-post-by-id.use-case';
import { FindPostsUseCase } from '../../application/use-cases/find-posts.use-case';
import { UpdatePostUseCase } from '../../application/use-cases/update-post.use-case';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly createPostUseCase: CreatePostUseCase,
    private readonly findPostByIdUseCase: FindPostByIdUseCase,
    private readonly findPostsUseCase: FindPostsUseCase,
    private readonly updatePostUseCase: UpdatePostUseCase,
    private readonly deletePostUseCase: DeletePostUseCase,
  ) {}

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreatePostDto) {
    return this.createPostUseCase.execute(user.id, dto);
  }

  @Get()
  findMany(@Query() query: QueryPostDto) {
    return this.findPostsUseCase.execute(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.findPostByIdUseCase.execute(id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.updatePostUseCase.execute(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.deletePostUseCase.execute(user.id, id);
  }
}
