import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponseBody {
  success: false;
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const statusCode = exception.getStatus();

    const exceptionResponse = exception.getResponse();
    const { message, error } = this.normalize(exceptionResponse, exception);

    const body: ErrorResponseBody = {
      success: false,
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(statusCode).json(body);
  }

  private normalize(
    exceptionResponse: string | object,
    exception: HttpException,
  ): { message: string | string[]; error: string } {
    if (typeof exceptionResponse === 'string') {
      return { message: exceptionResponse, error: exception.name };
    }

    const { message, error } = exceptionResponse as {
      message?: string | string[];
      error?: string;
    };

    return {
      message: message ?? exception.message,
      error: error ?? exception.name,
    };
  }
}
