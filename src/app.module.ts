import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { LogsModule } from './logs/logs.module';
import { RequisicionesModule } from './requisiciones/requisiciones.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AlmacenesModule } from './almacenes/almacenes.module';
import { ProductosModule } from './productos/productos.module';
import { EntradasModule } from './entradas/entradas.module';
import { SalidasModule } from './salidas/salidas.module';
import { EquiposModule } from './equipos/equipos.module';
import { ObrasModule } from './obras/obras.module';
import { ProveedoresModule } from './proveedores/proveedores.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => ({
        type: 'postgres',
        host: cs.get<string>('DB_HOST'),
        port: cs.get<number>('DB_PORT'),
        username: cs.get<string>('DB_USERNAME'),
        password: cs.get<string>('DB_PASSWORD'),
        database: cs.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),
    AuthModule,
    LogsModule,
    RequisicionesModule,
    UsuariosModule,
    AlmacenesModule,
    ProductosModule,
    EntradasModule,
    SalidasModule,
    EquiposModule,
    ObrasModule,
    ProveedoresModule,

  ],
})
export class AppModule { }
