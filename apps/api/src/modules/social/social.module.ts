import { Module } from '@nestjs/common';
import { SocialRepository } from './social.repository';

// No controller/service yet — follow/unfollow and block/unblock endpoints are TODO.
@Module({
  providers: [SocialRepository],
  exports: [SocialRepository],
})
export class SocialModule {}
