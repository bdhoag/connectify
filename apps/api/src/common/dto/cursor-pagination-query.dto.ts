import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsISO8601, IsOptional, Max, Min } from 'class-validator';

// Cursor is the ISO timestamp of the oldest item already seen by the client;
// the next page returns items strictly older than it.
export class CursorPaginationQueryDto {
  @ApiPropertyOptional({ example: '2026-09-19T13:26:29.220Z' })
  @IsOptional()
  @IsISO8601()
  cursor?: string;

  @ApiPropertyOptional({ example: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
