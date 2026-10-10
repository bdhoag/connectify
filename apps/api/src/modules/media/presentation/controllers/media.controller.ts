import { Body, Controller, Post } from '@nestjs/common';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../auth/presentation/guards/jwt-auth.guard';
import { CreateUploadSignatureDto } from '../../application/dto/create-upload-signature.dto';
import { CreateUploadSignatureUseCase } from '../../application/use-cases/create-upload-signature.use-case';

@Controller('media')
export class MediaController {
  constructor(
    private readonly createUploadSignatureUseCase: CreateUploadSignatureUseCase,
  ) {}

  @Post('signature')
  createSignature(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateUploadSignatureDto,
  ) {
    return this.createUploadSignatureUseCase.execute(user.id, dto);
  }
}
