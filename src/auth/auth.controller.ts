import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiKeyGuard } from './guards/api-key.guard';
import { ApiHeader, ApiSecurity } from '@nestjs/swagger';
import { LoginDto, RegisterDto } from './dto/request.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from './entities/usuario.entity';
import { GetUser } from './decorators/user.decorator';
import { PermissionsGuard } from './guards/permiso.guard';
import { RequirePermissions } from './decorators/permiso.decorator';
import { CurrentPermissions } from './types/current-permissions';
import { SwaggerAuthHeaders } from './decorators/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @ApiHeader({
    name: 'x-api-key',
    // description: 'api-key example: 94ba3b47-c703-4cbd-a87b-408935d98827',
    description: 'api-key example: 0b347279-68c5-4c77-9f4b-7f31302b7769',
  })
  @Post('login')
  @UseGuards(ApiKeyGuard)
  @ApiSecurity('api-key')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('createApiKey')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.CreateApiKey)
  @ApiSecurity('jwt')
  generateApiKey(@GetUser() user: User) {
    return this.authService.createApiKey(user)
  }

  @Post('register')
  @SwaggerAuthHeaders() // NOTE: This is a custom decorator
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.CreateUser)
  register(
    @Body() dto: RegisterDto,
    @GetUser() user: User
  ) {
    return this.authService.register(dto, user);
  }

  // This will not have any users right now nor any guards
  @Post('admin/register')
  createUser(
    @Body() dto: RegisterDto,
  ) {
    return this.authService.createUser(dto)
  }

}
