import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';


@Injectable()
export class LookupSeeder implements OnModuleInit {
  private readonly logger = new Logger(LookupSeeder.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    if (process.env.SEED_LOOKUPS === 'false') return;

    await this.dataSource.transaction(async (m) => {
      // TODO: Create filtros and categories for filtros



    });

    this.logger.log('Lookup seeding completed (componentes, fases)');
  }
}
