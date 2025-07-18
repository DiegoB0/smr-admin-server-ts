import { applyDecorators } from '@nestjs/common';
import { ApiSecurity, ApiHeader } from '@nestjs/swagger';

// Use this to check both JWT and also API-KEY
export function SwaggerAuthHeaders() {
  return applyDecorators(
    ApiHeader({
      name: 'x-api-key',
      description: 'api-key example: 94ba3b47-c703-4cbd-a87b-408935d98827',
    }),
    ApiSecurity('jwt'),
    ApiSecurity('api-key'),
  );
}
