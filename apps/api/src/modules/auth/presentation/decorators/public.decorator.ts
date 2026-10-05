import { applyDecorators, SetMetadata } from '@nestjs/common';
import { DECORATORS } from '@nestjs/swagger';

export const IS_PUBLIC_KEY = 'isPublic';

// Removes the global Bearer requirement from this route in Swagger. Written
// to the metadata directly (merged with any existing @ApiOperation) because
// ApiOperation() always resets `summary` to '' and would wipe a summary
// declared below @Public().
const NoSwaggerSecurity: MethodDecorator = (_target, _key, descriptor) => {
  const handler = descriptor.value as object;
  const previous = Reflect.getMetadata(DECORATORS.API_OPERATION, handler) as
    | Record<string, unknown>
    | undefined;
  Reflect.defineMetadata(
    DECORATORS.API_OPERATION,
    { ...previous, security: [] },
    handler,
  );
};

// Opts a route out of the global JwtAuthGuard. Every route is authenticated
// by default, so a forgotten guard can never leave an endpoint open.
export const Public = () =>
  applyDecorators(SetMetadata(IS_PUBLIC_KEY, true), NoSwaggerSecurity);
