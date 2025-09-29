import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Componente } from 'src/requisiciones/entities/peticion_producto.entity';
import { Fase } from 'src/requisiciones/entities/peticion_producto.entity';
import { COMPONENTE_KEYS, FASE_KEYS } from 'src/requisiciones/types/peticion-types';


@Injectable()
export class LookupSeeder implements OnModuleInit {
  private readonly logger = new Logger(LookupSeeder.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    if (process.env.SEED_LOOKUPS === 'false') return;

    await this.dataSource.transaction(async (m) => {
      const compRepo = m.getRepository(Componente);
      const faseRepo = m.getRepository(Fase);

      await compRepo
        .createQueryBuilder()
        .insert()
        .into(Componente)
        .values(COMPONENTE_KEYS.map((key) => ({ key })))
        .orIgnore() 
        .execute();

      await faseRepo
        .createQueryBuilder()
        .insert()
        .into(Fase)
        .values(FASE_KEYS.map((key) => ({ key })))
        .orIgnore()
        .execute();
    });

    this.logger.log('Lookup seeding completed (componentes, fases)');
  }
}
