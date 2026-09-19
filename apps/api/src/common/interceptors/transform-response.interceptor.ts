import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: true;
  statusCode: number;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T> | T
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T> | T> {
    const statusCode = context
      .switchToHttp()
      .getResponse<Response>().statusCode;

    // A 204 must not carry a body — leave it untouched instead of wrapping.
    if (statusCode === 204) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => ({
        success: true as const,
        statusCode,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
