import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  DataSource,
  EntityManager,
  In,
} from 'typeorm';
import { CategoriaFiltro } from 'src/filtros/entities/filtro-category.entity';
import { FiltroRequirement } from 'src/filtros/entities/filtro-requirements.entity';
import { FiltroItem } from 'src/filtros/entities/filtro-item.entity';

const EXPECTED_CATEGORIES = [
  'Tractores Komatsu',
  'Tractores CAT D9',
  'Excavadora CAT 366D',
  'Excavadora CAT 320D',
  'Excavadora CAT 336B',
  'Excavadora 350G 700',
  'Retro 416 CAT 0352',
  'Retro 416 T CAT 214',
  'MOTO 140K CAT 656',
  'MOTO JD 770G 3659',
  'MOTO JD 670P',
  'VIBRO CAT 457',
  'VIBRO XCMG 0298 (140)',
] as const;

@Injectable()
export class LookupSeeder implements OnModuleInit {
  private readonly logger = new Logger(LookupSeeder.name);

  constructor(private readonly dataSource: DataSource) { }

  async onModuleInit() {
    if (process.env.SEED_LOOKUPS === 'false') return;

    await this.dataSource.transaction(async (m) => {
      const allPresent = await this.allCategoriesPresent(m, EXPECTED_CATEGORIES);
      if (allPresent) {
        this.logger.log(
          'All lookup categories already present. Skipping seed.'
        );
        return;
      }

      await this.seedAll(m);

      this.logger.log(
        'Filtro categories, requirements, and items seeded successfully'
      );

    });

    this.logger.log('Lookup seeding completed');
  }

  private async allCategoriesPresent(
    m: EntityManager,
    expected: readonly string[]
  ): Promise<boolean> {
    const rows = await m.getRepository(CategoriaFiltro).find({
      select: { nombre: true },
      where: { nombre: In(expected as string[]) },
    });

    const found = new Set(rows.map((r) => r.nombre));
    for (const name of expected) {
      if (!found.has(name)) return false;
    }
    return true;
  }

  private async seedAll(m: EntityManager) {
    // helpers
    const upsertCategoria = async (nombre: string) => {
      const existing = await m.findOne(CategoriaFiltro, { where: { nombre } });
      return existing ?? (await m.save(CategoriaFiltro, { nombre }));
    };

    const upsertRequirement = async (
      categoriaId: number,
      hrs: number,
      nombre: string
    ) => {
      const existing = await m.findOne(FiltroRequirement, {
        where: { categoriaId, hrs },
      });
      if (existing) {
        if (existing.nombre !== nombre) {
          existing.nombre = nombre;
          return m.save(FiltroRequirement, existing);
        }
        return existing;
      }
      return m.save(FiltroRequirement, { categoriaId, hrs, nombre });
    };

    const upsertItem = async (
      req: FiltroRequirement,
      item: Pick<
        FiltroItem,
        'numero' | 'equivalente' | 'descripcion' | 'cantidad' | 'unidad'
      >
    ) => {
      const existing = await m.findOne(FiltroItem, {
        where: {
          requirement: { categoriaId: req.categoriaId, hrs: req.hrs },
          numero: item.numero,
        },
        relations: ['requirement'],
      });

      if (existing) {
        // keep DB in sync with seed (optional)
        existing.equivalente =
          item.equivalente ?? existing.equivalente ?? null;
        existing.descripcion =
          item.descripcion ?? existing.descripcion ?? null;
        existing.cantidad = item.cantidad;
        existing.unidad = item.unidad;
        return m.save(FiltroItem, existing);
      }

      return m.save(FiltroItem, { ...item, requirement: req });
    };

    // ============== TRACTORES KOMATSU ==============
    const tractorKomatsu = await upsertCategoria('Tractores Komatsu');

    const kom250 = await upsertRequirement(
      tractorKomatsu.id,
      250,
      'Mantenimiento 250 HRS'
    );
    const kom500 = await upsertRequirement(
      tractorKomatsu.id,
      500,
      'Mantenimiento 500 HRS'
    );
    const kom1000 = await upsertRequirement(
      tractorKomatsu.id,
      1000,
      'Mantenimiento 1000 HRS'
    );
    const kom2000 = await upsertRequirement(
      tractorKomatsu.id,
      2000,
      'Mantenimiento 2000 HRS'
    );

    await Promise.all([
      upsertItem(kom250, {
        numero: 'P559000',
        equivalente: '6002111340',
        descripcion: 'FILTRO DE ACEITE',
        cantidad: 2,
        unidad: 'pieza',
      }),
      upsertItem(kom250, {
        numero: 'P550937',
        equivalente: '6003114510',
        descripcion: 'FILTRO DE SEPARADOR',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(kom250, {
        numero: 'P502480',
        equivalente: '6003193841',
        descripcion: 'FILTRO DE COMBUSTIBLE',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(kom250, {
        numero: 'P777868',
        equivalente: '6001856100',
        descripcion: 'FILTRO PRIMARIO',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(kom250, {
        numero: '15W40',
        equivalente: '',
        descripcion: 'ACEITE 15W40',
        cantidad: 57,
        unidad: 'lts',
      }),
    ]);

    await Promise.all([
      upsertItem(kom500, {
        numero: 'P559000',
        equivalente: '6002111340',
        descripcion: 'FILTRO DE ACEITE',
        cantidad: 2,
        unidad: 'pieza',
      }),
      upsertItem(kom500, {
        numero: 'P550937',
        equivalente: '6003114510',
        descripcion: 'FILTRO DE SEPARADOR',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(kom500, {
        numero: 'P502480',
        equivalente: '6003193841',
        descripcion: 'FILTRO DE COMBUSTIBLE',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(kom500, {
        numero: 'P777868',
        equivalente: '6001856100',
        descripcion: 'FILTRO PRIMARIO',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(kom500, {
        numero: 'P777869',
        equivalente: '',
        descripcion: 'FILTRO SECUNDARIO',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(kom500, {
        numero: 'P557380',
        equivalente: '',
        descripcion: 'SUMERGIBLE TRANSMISIÓN',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(kom500, {
        numero: 'P551054',
        equivalente: '',
        descripcion: 'SUMERGIBLE HIDRAULICO',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(kom500, {
        numero: 'P550787',
        equivalente: '',
        descripcion: 'SUMERGIBLE HIDRAULICO',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(kom500, {
        numero: 'P500138',
        equivalente: '',
        descripcion: 'FILTRO A/C EXTERIOR',
        cantidad: 2,
        unidad: 'pieza',
      }),
      upsertItem(kom500, {
        numero: 'PA30156',
        equivalente: '',
        descripcion: 'FILTRO A/C CABINA ',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(kom500, {
        numero: '15W40',
        equivalente: '',
        descripcion: 'ACEITE 15W40',
        cantidad: 57,
        unidad: 'lts',
      }),
    ]);

    await Promise.all([
      upsertItem(kom1000, {
        numero: 'P559000',
        equivalente: '6002111340',
        descripcion: 'FILTRO DE ACEITE',
        cantidad: 2,
        unidad: 'pieza',
      }),
      upsertItem(kom1000, {
        numero: 'P550937',
        equivalente: '6003114510',
        descripcion: 'FILTRO DE SEPARADOR',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(kom1000, {
        numero: 'P502480',
        equivalente: '6003193841',
        descripcion: 'FILTRO DE COMBUSTIBLE',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(kom1000, {
        numero: 'P777868',
        equivalente: '6001856100',
        descripcion: 'FILTRO PRIMARIO',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(kom1000, {
        numero: 'P777869',
        equivalente: '',
        descripcion: 'FILTRO SECUNDARIO',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(kom1000, {
        numero: 'P557380',
        equivalente: '',
        descripcion: 'SUMERGIBLE TRANSMISIÓN',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(kom1000, {
        numero: 'P551054',
        equivalente: '',
        descripcion: 'SUMERGIBLE HIDRAULICO',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(kom1000, {
        numero: 'P550787',
        equivalente: '',
        descripcion: 'SUMERGIBLE HIDRAULICO',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(kom1000, {
        numero: 'P500138',
        equivalente: '',
        descripcion: 'FILTRO A/C EXTERIOR',
        cantidad: 2,
        unidad: 'pieza',
      }),
      upsertItem(kom1000, {
        numero: 'PA30156',
        equivalente: '',
        descripcion: 'FILTRO A/C CABINA ',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(kom1000, {
        numero: '15W40',
        equivalente: '',
        descripcion: 'ACEITE 15W40',
        cantidad: 57,
        unidad: 'lts',
      }),
      upsertItem(kom1000, {
        numero: 'SAE 85w140',
        equivalente: '',
        descripcion: 'SAE  85w140  MANDOS',
        cantidad: 160,
        unidad: 'lts',
      }),
    ]);

    await Promise.all([
      upsertItem(kom2000, {
        numero: 'P559000',
        equivalente: '6002111340',
        descripcion: 'FILTRO DE ACEITE',
        cantidad: 2,
        unidad: 'pieza',
      }),
      upsertItem(kom2000, {
        numero: 'P550937',
        equivalente: '6003114510',
        descripcion: 'FILTRO DE SEPARADOR',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(kom2000, {
        numero: 'P502480',
        equivalente: '6003193841',
        descripcion: 'FILTRO DE COMBUSTIBLE',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(kom2000, {
        numero: 'P777868',
        equivalente: '6001856100',
        descripcion: 'FILTRO PRIMARIO',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(kom2000, {
        numero: 'P777869',
        equivalente: '',
        descripcion: 'FILTRO SECUNDARIO',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(kom2000, {
        numero: 'P557380',
        equivalente: '',
        descripcion: 'SUMERGIBLE TRANSMISIÓN',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(kom2000, {
        numero: 'P551054',
        equivalente: '',
        descripcion: 'SUMERGIBLE HIDRAULICO',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(kom2000, {
        numero: 'P550787',
        equivalente: '',
        descripcion: 'SUMERGIBLE HIDRAULICO',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(kom2000, {
        numero: 'P500138',
        equivalente: '',
        descripcion: 'FILTRO A/C EXTERIOR',
        cantidad: 2,
        unidad: 'pieza',
      }),
      upsertItem(kom2000, {
        numero: 'PA30156',
        equivalente: '',
        descripcion: 'FILTRO A/C CABINA ',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(kom2000, {
        numero: '569-15-51721',
        equivalente: '',
        descripcion: 'FILTER ASSEMBLY',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(kom2000, {
        numero: '15W40',
        equivalente: '',
        descripcion: 'ACEITE 15W40',
        cantidad: 57,
        unidad: 'lts',
      }),
      upsertItem(kom2000, {
        numero: 'SAE 30',
        equivalente: '',
        descripcion: 'ACEITE DE TRANSMISION SAE 30 ',
        cantidad: 160,
        unidad: 'lts',
      }),
      upsertItem(kom2000, {
        numero: 'SAE 85w140',
        equivalente: '',
        descripcion: 'SAE  85w140  MANDOS',
        cantidad: 140,
        unidad: 'lts',
      }),
      upsertItem(kom2000, {
        numero: '10 W',
        equivalente: '',
        descripcion: 'ACEITE HIDRAULICO 10W',
        cantidad: 208,
        unidad: 'lts',
      }),
    ]);

    // ============== TRACTORES CAT D9 ==============
    const tractorCatD9 = await upsertCategoria('Tractores CAT D9');

    const d9_250 = await upsertRequirement(
      tractorCatD9.id,
      250,
      'Mantenimiento 250 HRS'
    );
    const d9_500 = await upsertRequirement(
      tractorCatD9.id,
      500,
      'Mantenimiento 500 HRS'
    );
    const d9_1000 = await upsertRequirement(
      tractorCatD9.id,
      1000,
      'Mantenimiento 1000 HRS'
    );
    const d9_2000 = await upsertRequirement(
      tractorCatD9.id,
      2000,
      'Mantenimiento 2000 HRS'
    );

    await Promise.all([
      upsertItem(d9_250, {
        numero: '1R1808',
        equivalente: '',
        descripcion: ' FILTRO DE ACEITE',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(d9_250, {
        numero: "3261643",
        equivalente: '',
        descripcion: 'FILTRO SEPARADOR',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(d9_250, {
        numero: "1R0749",
        equivalente: '',
        descripcion: 'FILTRO COMBUSTIBLE',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(d9_250, {
        numero: "1327168",
        equivalente: '',
        descripcion: 'FILTRO PRIMARIO',
        cantidad: 1,
        unidad: 'pieza',

      }),
      upsertItem(d9_250, {
        numero: "15W40",
        equivalente: '',
        descripcion: 'ACEITE 15W40',
        cantidad: 57,
        unidad: 'lts',
      }),
    ]);

    await Promise.all([
      upsertItem(d9_500, {
        numero: '1R1808',
        equivalente: '',
        descripcion: ' FILTRO DE ACEITE',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(d9_500, {
        numero: "3261643",
        equivalente: '',
        descripcion: 'FILTRO SEPARADOR',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(d9_500, {
        numero: "1R0749",
        equivalente: '',
        descripcion: 'FILTRO COMBUSTIBLE',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(d9_500, {
        numero: "1327168",
        equivalente: '',
        descripcion: 'FILTRO PRIMARIO de AIRE',
        cantidad: 1,
        unidad: 'pieza',

      }),

      upsertItem(d9_500, {
        numero: "1063973",
        equivalente: '',
        descripcion: 'FILTRO SECUNDARIO de AIRE',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(d9_500, {
        numero: "4656506",
        equivalente: '',
        descripcion: 'FILTRO HIDRAULICO',
        cantidad: 1,
        unidad: 'pieza',

      }),


      upsertItem(d9_500, {
        numero: "5715253",
        equivalente: '',
        descripcion: 'FILTRO DE TRANSMICIÓN',
        cantidad: 2,
        unidad: 'pieza',
      }),


      upsertItem(d9_500, {
        numero: "1R0774",
        equivalente: '',
        descripcion: 'FILTRO HIDRAULICO SUMERJIBLE',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(d9_500, {
        numero: "3468243",
        equivalente: '',
        descripcion: 'FILTRO AC INTERIOR',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(d9_500, {
        numero: "2310167",
        equivalente: '',
        descripcion: 'FILTRO AC EXTERIOR',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(d9_500, {
        numero: "15W40",
        equivalente: '',
        descripcion: 'ACEITE 15W40',
        cantidad: 57,
        unidad: 'lts',
      }),
    ]);


    await Promise.all([
      upsertItem(d9_1000, {
        numero: '1R1808',
        equivalente: '',
        descripcion: ' FILTRO DE ACEITE',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(d9_1000, {
        numero: "3261643",
        equivalente: '',
        descripcion: 'FILTRO SEPARADOR',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(d9_1000, {
        numero: "1R0749",
        equivalente: '',
        descripcion: 'FILTRO COMBUSTIBLE',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(d9_1000, {
        numero: "1327168",
        equivalente: '',
        descripcion: 'FILTRO PRIMARIO de AIRE',
        cantidad: 1,
        unidad: 'pieza',

      }),

      upsertItem(d9_1000, {
        numero: "1063973",
        equivalente: '',
        descripcion: 'FILTRO SECUNDARIO de AIRE',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(d9_1000, {
        numero: "4656506",
        equivalente: '',
        descripcion: 'FILTRO HIDRAULICO',
        cantidad: 1,
        unidad: 'pieza',

      }),

      upsertItem(d9_1000, {
        numero: "5715253",
        equivalente: '',
        descripcion: 'FILTRO DE TRANSMICIÓN',
        cantidad: 2,
        unidad: 'pieza',
      }),


      upsertItem(d9_1000, {
        numero: "1R0774",
        equivalente: '',
        descripcion: 'FILTRO HIDRAULICO SUMERJIBLE',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(d9_1000, {
        numero: "3468243",
        equivalente: '',
        descripcion: 'FILTRO AC INTERIOR',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(d9_1000, {
        numero: "2310167",
        equivalente: '',
        descripcion: 'FILTRO AC EXTERIOR',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(d9_1000, {
        numero: "15W40",
        equivalente: '',
        descripcion: 'ACEITE 15W40',
        cantidad: 57,
        unidad: 'lts',
      }),

      upsertItem(d9_1000, {
        numero: "SAE 30",
        equivalente: '',
        descripcion: 'ACEITE SAE 30',
        cantidad: 200,
        unidad: 'lts',
      })
    ]);


    await Promise.all([
      upsertItem(d9_2000, {
        numero: '1R1808',
        equivalente: '',
        descripcion: ' FILTRO DE ACEITE',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(d9_2000, {
        numero: "3261643",
        equivalente: '',
        descripcion: 'FILTRO SEPARADOR',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(d9_2000, {
        numero: "1R0749",
        equivalente: '',
        descripcion: 'FILTRO COMBUSTIBLE',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(d9_2000, {
        numero: "1327168",
        equivalente: '',
        descripcion: 'FILTRO PRIMARIO de AIRE',
        cantidad: 1,
        unidad: 'pieza',

      }),

      upsertItem(d9_2000, {
        numero: "1063973",
        equivalente: '',
        descripcion: 'FILTRO SECUNDARIO de AIRE',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(d9_2000, {
        numero: "4656506",
        equivalente: '',
        descripcion: 'FILTRO HIDRAULICO',
        cantidad: 1,
        unidad: 'pieza',

      }),

      upsertItem(d9_2000, {
        numero: "5715253",
        equivalente: '',
        descripcion: 'FILTRO DE TRANSMICIÓN',
        cantidad: 2,
        unidad: 'pieza',
      }),


      upsertItem(d9_2000, {
        numero: "1R0774",
        equivalente: '',
        descripcion: 'FILTRO HIDRAULICO SUMERJIBLE',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(d9_2000, {
        numero: "3468243",
        equivalente: '',
        descripcion: 'FILTRO AC INTERIOR',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(d9_2000, {
        numero: "2310167",
        equivalente: '',
        descripcion: 'FILTRO AC EXTERIOR',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(d9_2000, {
        numero: "15W40",
        equivalente: '',
        descripcion: 'ACEITE 15W40',
        cantidad: 57,
        unidad: 'lts',
      }),

      upsertItem(d9_2000, {
        numero: "SAE 30",
        equivalente: '',
        descripcion: 'ACEITE SAE 30',
        cantidad: 200,
        unidad: 'lts',
      }),

      upsertItem(d9_2000, {
        numero: "10 W",
        equivalente: '',
        descripcion: 'ACEITE HIDRAULICO 10W',
        cantidad: 200,
        unidad: 'lts',
      }),

      upsertItem(d9_2000, {
        numero: "SAE 50",
        equivalente: '',
        descripcion: 'ACEITE SAE 50 PARA MANDOS',
        cantidad: 50,
        unidad: 'lts',
      }),

      upsertItem(d9_2000, {
        numero: "85W140",
        equivalente: '',
        descripcion: 'ACEITE PARA CAÑON 85W140',
        cantidad: 120,
        unidad: 'lts',
      })


    ]);

    // Excavadora CAT 336D
    const excavadoraCat336D = await upsertCategoria('Excavadora CAT 336D');

    const ex336D_250 = await upsertRequirement(
      excavadoraCat336D.id,
      250,
      'Mantenimiento 250 HRS'
    );
    const ex336D_500 = await upsertRequirement(
      excavadoraCat336D.id,
      500,
      'Mantenimiento 500 HRS'
    );
    const ex336D_1000 = await upsertRequirement(
      excavadoraCat336D.id,
      1000,
      'Mantenimiento 1000 HRS'
    );

    const ex336D_2000 = await upsertRequirement(
      excavadoraCat336D.id,
      2000,
      'Mantenimiento 2000 HRS'
    );

    await Promise.all([
      upsertItem(ex336D_250, {
        numero: '1R1808',
        equivalente: '',
        descripcion: ' FILTRO DE ACEITE',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(ex336D_250, {
        numero: "3261644",
        equivalente: '',
        descripcion: 'FILTRO SEPARADOR',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(ex336D_250, {
        numero: "1R0762",
        equivalente: '',
        descripcion: 'FILTRO COMBUSTIBLE',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex336D_250, {
        numero: "1421339",
        equivalente: '',
        descripcion: 'FILTRO PRIMARIO',
        cantidad: 1,
        unidad: 'pieza',

      }),
      upsertItem(ex336D_250, {
        numero: "15W40",
        equivalente: '',
        descripcion: 'ACEITE 15W40',
        cantidad: 57,
        unidad: 'lts',
      }),
    ]);

    await Promise.all([
      upsertItem(ex336D_500, {
        numero: '1R1808',
        equivalente: '',
        descripcion: ' FILTRO DE ACEITE',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(ex336D_500, {
        numero: "3261644",
        equivalente: '',
        descripcion: 'FILTRO SEPARADOR',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(ex336D_500, {
        numero: "1R0762",
        equivalente: '',
        descripcion: 'FILTRO COMBUSTIBLE',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex336D_500, {
        numero: "1421339",
        equivalente: '',
        descripcion: 'FILTRO PRIMARIO',
        cantidad: 1,
        unidad: 'pieza',

      }),

      upsertItem(ex336D_500, {
        numero: "1421404",
        equivalente: '',
        descripcion: 'FILTRO SECUNDARIO DE AIRE',
        cantidad: 1,
        unidad: 'pieza',

      }),

      upsertItem(ex336D_500, {
        numero: "5I8670",
        equivalente: '',
        descripcion: 'FILTRO HIDRAULICO',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex336D_500, {
        numero: "937521",
        equivalente: '',
        descripcion: 'FILTRO HIDRAULICO',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex336D_500, {
        numero: "1799806",
        equivalente: '',
        descripcion: 'FILTRO HIDRAULICO SUMERJIBLE',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex336D_500, {
        numero: "2931183",
        equivalente: '',
        descripcion: 'FILTRO AC EXTERIOR',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex336D_500, {
        numero: "5460006",
        equivalente: '',
        descripcion: 'FILTRO AC INTERIOR',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex336D_500, {
        numero: "15W40",
        equivalente: '',
        descripcion: 'ACEITE 15W40',
        cantidad: 57,
        unidad: 'lts',
      }),
    ]);


    await Promise.all([
      upsertItem(ex336D_1000, {
        numero: '1R1808',
        equivalente: '',
        descripcion: ' FILTRO DE ACEITE',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(ex336D_1000, {
        numero: "3261644",
        equivalente: '',
        descripcion: 'FILTRO SEPARADOR',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(ex336D_1000, {
        numero: "1R0762",
        equivalente: '',
        descripcion: 'FILTRO COMBUSTIBLE',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex336D_1000, {
        numero: "1421339",
        equivalente: '',
        descripcion: 'FILTRO PRIMARIO',
        cantidad: 1,
        unidad: 'pieza',

      }),

      upsertItem(ex336D_1000, {
        numero: "1421404",
        equivalente: '',
        descripcion: 'FILTRO SECUNDARIO DE AIRE',
        cantidad: 1,
        unidad: 'pieza',

      }),

      upsertItem(ex336D_1000, {
        numero: "5I8670",
        equivalente: '',
        descripcion: 'FILTRO HIDRAULICO',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex336D_1000, {
        numero: "937521",
        equivalente: '',
        descripcion: 'FILTRO HIDRAULICO',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex336D_1000, {
        numero: "1799806",
        equivalente: '',
        descripcion: 'FILTRO HIDRAULICO SUMERJIBLE',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex336D_1000, {
        numero: "2931183",
        equivalente: '',
        descripcion: 'FILTRO AC EXTERIOR',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex336D_1000, {
        numero: "5460006",
        equivalente: '',
        descripcion: 'FILTRO AC INTERIOR',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex336D_1000, {
        numero: "15W40",
        equivalente: '',
        descripcion: 'ACEITE 15W40',
        cantidad: 57,
        unidad: 'lts',
      }),

      upsertItem(ex336D_1000, {
        numero: "85W140",
        equivalente: '',
        descripcion: 'ACEITE 85W140 SWING Y MANDOS',
        cantidad: 57,
        unidad: 'lts',
      }),
    ]);


    await Promise.all([
      upsertItem(ex336D_2000, {
        numero: '1R1808',
        equivalente: '',
        descripcion: ' FILTRO DE ACEITE',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(ex336D_2000, {
        numero: "3261644",
        equivalente: '',
        descripcion: 'FILTRO SEPARADOR',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(ex336D_2000, {
        numero: "1R0762",
        equivalente: '',
        descripcion: 'FILTRO COMBUSTIBLE',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex336D_2000, {
        numero: "1421339",
        equivalente: '',
        descripcion: 'FILTRO PRIMARIO',
        cantidad: 1,
        unidad: 'pieza',

      }),

      upsertItem(ex336D_2000, {
        numero: "1421404",
        equivalente: '',
        descripcion: 'FILTRO SECUNDARIO DE AIRE',
        cantidad: 1,
        unidad: 'pieza',

      }),

      upsertItem(ex336D_2000, {
        numero: "5I8670",
        equivalente: '',
        descripcion: 'FILTRO HIDRAULICO',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex336D_2000, {
        numero: "937521",
        equivalente: '',
        descripcion: 'FILTRO HIDRAULICO',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex336D_2000, {
        numero: "1799806",
        equivalente: '',
        descripcion: 'FILTRO HIDRAULICO SUMERJIBLE',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex336D_2000, {
        numero: "2931183",
        equivalente: '',
        descripcion: 'FILTRO AC EXTERIOR',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex336D_2000, {
        numero: "5460006",
        equivalente: '',
        descripcion: 'FILTRO AC INTERIOR',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex336D_2000, {
        numero: "15W40",
        equivalente: '',
        descripcion: 'ACEITE 15W40',
        cantidad: 57,
        unidad: 'lts',
      }),

      upsertItem(ex336D_2000, {
        numero: "85W140",
        equivalente: '',
        descripcion: 'ACEITE 85W140 SWING Y MANDOS',
        cantidad: 57,
        unidad: 'lts',
      }),

      upsertItem(ex336D_2000, {
        numero: "10W",
        equivalente: '',
        descripcion: 'ACEITE HIDRAULICO 10W',
        cantidad: 208,
        unidad: 'lts',
      }),
    ]);

    // Excavadora CAT 320D
    const excavadoraCat32D = await upsertCategoria('Excavadora CAT 320D');

    const exCat32D_250 = await upsertRequirement(
      excavadoraCat32D.id,
      250,
      'Mantenimiento 250 HRS'
    );
    const exCat32D_500 = await upsertRequirement(
      excavadoraCat32D.id,
      500,
      'Mantenimiento 500 HRS'
    );
    const exCat32D_1000 = await upsertRequirement(
      excavadoraCat32D.id,
      1000,
      'Mantenimiento 1000 HRS'
    );
    const exCat32D_2000 = await upsertRequirement(
      excavadoraCat32D.id,
      2000,
      'Mantenimiento 2000 HRS'
    );


    // 250
    await Promise.all([
      upsertItem(exCat32D_250, {
        numero: '1R0739',
        equivalente: '',
        descripcion: ' FILTRO DE ACEITE DE MOTOR',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(exCat32D_250, {
        numero: "1318821",
        equivalente: '',
        descripcion: 'FILTRO DE ACEITE SECUNDARIO',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(exCat32D_250, {
        numero: "1R0751",
        equivalente: '',
        descripcion: 'FILTRO DE COMBUSTIBLE',
        cantidad: 2,
        unidad: 'pieza',
      }),

      upsertItem(exCat32D_250, {
        numero: "1318822",
        equivalente: '',
        descripcion: 'FILTRO PRIMARIO',
        cantidad: 1,
        unidad: 'pieza',

      }),
      upsertItem(exCat32D_250, {
        numero: "15W40",
        equivalente: '',
        descripcion: 'ACEITE 15W40',
        cantidad: 38,
        unidad: 'lts',
      }),
    ]);



    // 500
    await Promise.all([
      upsertItem(exCat32D_500, {
        numero: '1R0739',
        equivalente: '',
        descripcion: ' FILTRO DE ACEITE DE MOTOR',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(exCat32D_500, {
        numero: "1318821",
        equivalente: '',
        descripcion: 'FILTRO DE ACEITE SECUNDARIO',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(exCat32D_500, {
        numero: "3261644",
        equivalente: '',
        descripcion: 'FILTRO SEPARADOR',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(exCat32D_500, {
        numero: "1R0751",
        equivalente: '',
        descripcion: 'FILTRO DE COMBUSTIBLE',
        cantidad: 2,
        unidad: 'pieza',
      }),

      upsertItem(exCat32D_500, {
        numero: "1318822",
        equivalente: '',
        descripcion: 'FILTRO PRIMARIO',
        cantidad: 1,
        unidad: 'pieza',

      }),

      upsertItem(exCat32D_500, {
        numero: "5I8670",
        equivalente: '',
        descripcion: 'FILTRO HIDRAULICO',
        cantidad: 1,
        unidad: 'pieza',

      }),

      upsertItem(exCat32D_500, {
        numero: "1884142",
        equivalente: '',
        descripcion: 'FILTRO TANQUE HIDRAULICO',
        cantidad: 1,
        unidad: 'pieza',

      }),

      upsertItem(exCat32D_500, {
        numero: "2166676",
        equivalente: '',
        descripcion: 'FILTRO DEL SISTEMA HIDRAULICO',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(exCat32D_500, {
        numero: "O937521",
        equivalente: '',
        descripcion: 'FILTRO DE ACEITE',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(exCat32D_500, {
        numero: "2458823",
        equivalente: '',
        descripcion: 'FILTRO AC EXTERIOR',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(exCat32D_500, {
        numero: "2931137",
        equivalente: '',
        descripcion: 'FILTRO AC INTERIOR',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(exCat32D_500, {
        numero: "15W40",
        equivalente: '',
        descripcion: 'ACEITE 15W40',
        cantidad: 38,
        unidad: 'lts',
      }),
    ]);


    // 1000
    await Promise.all([
      upsertItem(exCat32D_1000, {
        numero: '1R0739',
        equivalente: '',
        descripcion: ' FILTRO DE ACEITE DE MOTOR',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(exCat32D_1000, {
        numero: "1318821",
        equivalente: '',
        descripcion: 'FILTRO DE ACEITE SECUNDARIO',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(exCat32D_1000, {
        numero: "3261644",
        equivalente: '',
        descripcion: 'FILTRO SEPARADOR',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(exCat32D_1000, {
        numero: "1R0751",
        equivalente: '',
        descripcion: 'FILTRO DE COMBUSTIBLE',
        cantidad: 2,
        unidad: 'pieza',
      }),

      upsertItem(exCat32D_1000, {
        numero: "1318822",
        equivalente: '',
        descripcion: 'FILTRO PRIMARIO',
        cantidad: 1,
        unidad: 'pieza',

      }),

      upsertItem(exCat32D_1000, {
        numero: "5I8670",
        equivalente: '',
        descripcion: 'FILTRO HIDRAULICO',
        cantidad: 1,
        unidad: 'pieza',

      }),

      upsertItem(exCat32D_1000, {
        numero: "1884142",
        equivalente: '',
        descripcion: 'FILTRO TANQUE HIDRAULICO',
        cantidad: 1,
        unidad: 'pieza',

      }),

      upsertItem(exCat32D_1000, {
        numero: "2166676",
        equivalente: '',
        descripcion: 'FILTRO DEL SISTEMA HIDRAULICO',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(exCat32D_1000, {
        numero: "O937521",
        equivalente: '',
        descripcion: 'FILTRO DE ACEITE',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(exCat32D_1000, {
        numero: "2458823",
        equivalente: '',
        descripcion: 'FILTRO AC EXTERIOR',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(exCat32D_1000, {
        numero: "2931137",
        equivalente: '',
        descripcion: 'FILTRO AC INTERIOR',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(exCat32D_1000, {
        numero: "15W40",
        equivalente: '',
        descripcion: 'ACEITE 15W40',
        cantidad: 38,
        unidad: 'lts',
      }),

      upsertItem(exCat32D_1000, {
        numero: "10W",
        equivalente: '',
        descripcion: 'ACEITE HIDRAULICO 10W',
        cantidad: 208,
        unidad: 'lts',
      }),

      upsertItem(exCat32D_1000, {
        numero: "85W140",
        equivalente: '',
        descripcion: 'ACEITE 85W140  PARA MANDOS Y SWING',
        cantidad: 38,
        unidad: 'lts',
      }),
    ]);


    // 2000
    await Promise.all([
      upsertItem(exCat32D_2000, {
        numero: '1R0739',
        equivalente: '',
        descripcion: ' FILTRO DE ACEITE DE MOTOR',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(exCat32D_2000, {
        numero: "1318821",
        equivalente: '',
        descripcion: 'FILTRO DE ACEITE SECUNDARIO',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(exCat32D_2000, {
        numero: "3261644",
        equivalente: '',
        descripcion: 'FILTRO SEPARADOR',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(exCat32D_2000, {
        numero: "1884142",
        equivalente: '',
        descripcion: 'FILTRO TANQUE HIDRAULICO',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(exCat32D_2000, {
        numero: "2458823",
        equivalente: '',
        descripcion: 'FILTRO AC EXTERIOR',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(exCat32D_2000, {
        numero: "2931137",
        equivalente: '',
        descripcion: 'FILTRO AC INTERIOR',
        cantidad: 1,
        unidad: 'pieza',
      }),


      upsertItem(exCat32D_2000, {
        numero: "15W40",
        equivalente: '',
        descripcion: 'ACEITE 15W40',
        cantidad: 38,
        unidad: 'lts',
      }),

      upsertItem(exCat32D_2000, {
        numero: "10W",
        equivalente: '',
        descripcion: 'ACEITE HIDRAULICO 10W',
        cantidad: 200,
        unidad: 'lts',
      }),

      upsertItem(exCat32D_2000, {
        numero: "85W140",
        equivalente: '',
        descripcion: 'ACEITE 85W140  PARA MANDOS Y SWING',
        cantidad: 40,
        unidad: 'lts',
      }),

      upsertItem(exCat32D_2000, {
        numero: "SAE 50",
        equivalente: '',
        descripcion: 'ACEITE SAE 50 PARA MANDOS',
        cantidad: 57,
        unidad: 'lts',
      }),

    ]);

    // Excavadora CAT 336B
    const excavadoraCat336B = await upsertCategoria('Excavadora CAT 336B');

    const exCat336B_250 = await upsertRequirement(
      excavadoraCat336B.id,
      250,
      'Mantenimiento 250 HRS'
    );
    const exCat336B_500 = await upsertRequirement(
      excavadoraCat336B.id,
      500,
      'Mantenimiento 500 HRS'
    );
    const exCat336B_1000 = await upsertRequirement(
      excavadoraCat336B.id,
      1000,
      'Mantenimiento 1000 HRS'
    );
    const exCat336B_2000 = await upsertRequirement(
      excavadoraCat336B.id,
      2000,
      'Mantenimiento 2000 HRS'
    );

    // 250
    await Promise.all([
      upsertItem(exCat336B_250, {
        numero: '322-3155',
        equivalente: '',
        descripcion: ' FILTRO DE ACEITE',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(exCat336B_250, {
        numero: "523-4987",
        equivalente: '',
        descripcion: 'FILTRO SEPARADOR',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(exCat336B_250, {
        numero: "509-5694",
        equivalente: '',
        descripcion: 'FILTRO DE COMBUSTIBLE',
        cantidad: 2,
        unidad: 'pieza',
      }),

      upsertItem(exCat336B_250, {
        numero: "496-9845",
        equivalente: '',
        descripcion: 'FILTRO PRIMARIO',
        cantidad: 1,
        unidad: 'pieza',

      }),
      upsertItem(exCat336B_250, {
        numero: "496-9846",
        equivalente: '',
        descripcion: 'FILTRO SECUNDARIO',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(exCat336B_250, {
        numero: "15W40",
        equivalente: '',
        descripcion: 'ACEITE 15W40',
        cantidad: 57,
        unidad: 'lts',
      }),
    ]);


    // 500
    await Promise.all([
      upsertItem(exCat336B_500, {
        numero: '322-3155',
        equivalente: '',
        descripcion: ' FILTRO DE ACEITE',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(exCat336B_500, {
        numero: "523-4987",
        equivalente: '',
        descripcion: 'FILTRO SEPARADOR',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(exCat336B_500, {
        numero: "523-4988",
        equivalente: '',
        descripcion: 'FILTRO DE COMBUSTIBLE',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(exCat336B_500, {
        numero: "509-5694",
        equivalente: '',
        descripcion: 'FILTRO DE COMBUSTIBLE',
        cantidad: 2,
        unidad: 'pieza',
      }),

      upsertItem(exCat336B_500, {
        numero: "496-9845",
        equivalente: '',
        descripcion: 'FILTRO PRIMARIO',
        cantidad: 1,
        unidad: 'pieza',

      }),
      upsertItem(exCat336B_500, {
        numero: "496-9846",
        equivalente: '',
        descripcion: 'FILTRO SECUNDARIO',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(exCat336B_500, {
        numero: "509-9787",
        equivalente: '',
        descripcion: 'FILTRO HIDRAULICO SUMERJIBLE',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(exCat336B_500, {
        numero: "522-1451",
        equivalente: '',
        descripcion: 'FILTRO HIDRAULICO',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(exCat336B_500, {
        numero: "289-7789",
        equivalente: '',
        descripcion: 'FILTRO HIDRAULICO DE TRANSMICIÓN',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(exCat336B_500, {
        numero: "15W40",
        equivalente: '',
        descripcion: 'ACEITE 15W40',
        cantidad: 57,
        unidad: 'lts',
      }),
    ]);

    // 1000
    await Promise.all([
      upsertItem(exCat336B_1000, {
        numero: '322-3155',
        equivalente: '',
        descripcion: ' FILTRO DE ACEITE',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(exCat336B_1000, {
        numero: "523-4987",
        equivalente: '',
        descripcion: 'FILTRO SEPARADOR',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(exCat336B_1000, {
        numero: "523-4988",
        equivalente: '',
        descripcion: 'FILTRO DE COMBUSTIBLE',
        cantidad: 1,
        unidad: 'pieza',
      }),


      upsertItem(exCat336B_1000, {
        numero: "496-9845",
        equivalente: '',
        descripcion: 'FILTRO PRIMARIO',
        cantidad: 1,
        unidad: 'pieza',
      }),


      upsertItem(exCat336B_1000, {
        numero: "496-9846",
        equivalente: '',
        descripcion: 'FILTRO SECUNDARIO',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(exCat336B_1000, {
        numero: "509-9787",
        equivalente: '',
        descripcion: 'FILTRO HIDRAULICO SUMERJIBLE',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(exCat336B_1000, {
        numero: "522-1451",
        equivalente: '',
        descripcion: 'FILTRO HIDRAULICO',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(exCat336B_1000, {
        numero: "289-7789",
        equivalente: '',
        descripcion: 'FILTRO HIDRAULICO DE TRANSMICIÓN',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(exCat336B_1000, {
        numero: "15W40",
        equivalente: '',
        descripcion: 'ACEITE 15W40',
        cantidad: 57,
        unidad: 'lts',
      }),

      upsertItem(exCat336B_1000, {
        numero: "85W-140",
        equivalente: '',
        descripcion: 'ACEITE 85W-140 SWING Y MANDOS',
        cantidad: 38,
        unidad: 'lts',
      }),
    ]);

    // 2000
    await Promise.all([
      upsertItem(exCat336B_2000, {
        numero: '322-3155',
        equivalente: '',
        descripcion: ' FILTRO DE ACEITE',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(exCat336B_2000, {
        numero: "523-4987",
        equivalente: '',
        descripcion: 'FILTRO SEPARADOR',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(exCat336B_2000, {
        numero: "523-4988",
        equivalente: '',
        descripcion: 'FILTRO DE COMBUSTIBLE',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(exCat336B_2000, {
        numero: "509-5694",
        equivalente: '',
        descripcion: 'FILTRO DE COMBUSTIBLE SECUNDARIO',
        cantidad: 2,
        unidad: 'pieza',
      }),


      upsertItem(exCat336B_2000, {
        numero: "496-9845",
        equivalente: '',
        descripcion: 'FILTRO PRIMARIO',
        cantidad: 1,
        unidad: 'pieza',
      }),


      upsertItem(exCat336B_2000, {
        numero: "496-9846",
        equivalente: '',
        descripcion: 'FILTRO SECUNDARIO',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(exCat336B_2000, {
        numero: "509-9787",
        equivalente: '',
        descripcion: 'FILTRO HIDRAULICO SUMERJIBLE',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(exCat336B_2000, {
        numero: "522-1451",
        equivalente: '',
        descripcion: 'FILTRO HIDRAULICO',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(exCat336B_2000, {
        numero: "289-7789",
        equivalente: '',
        descripcion: 'FILTRO HIDRAULICO DE TRANSMICIÓN',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(exCat336B_2000, {
        numero: "500-0957",
        equivalente: '',
        descripcion: 'FILTRO AC EXTERIOR',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(exCat336B_2000, {
        numero: "480-5439",
        equivalente: '',
        descripcion: 'FILTRO AC INTERIOR',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(exCat336B_2000, {
        numero: "15W40",
        equivalente: '',
        descripcion: 'ACEITE 15W40',
        cantidad: 57,
        unidad: 'lts',
      }),

      upsertItem(exCat336B_2000, {
        numero: "10W",
        equivalente: '',
        descripcion: 'ACEITE HIDRAULICO 10W',
        cantidad: 218,
        unidad: 'lts',
      }),

      upsertItem(exCat336B_2000, {
        numero: "85W-40",
        equivalente: '',
        descripcion: 'ACEITE',
        cantidad: 19,
        unidad: 'lts',
      }),

      upsertItem(exCat336B_2000, {
        numero: "SAE 50",
        equivalente: '',
        descripcion: 'ACEITE SAE 50 PARA MANDOS',
        cantidad: 57,
        unidad: 'lts',
      }),

    ]);


    // Excavadora CAT 350G
    const excavadora350G = await upsertCategoria('Excavadora 350G 700'); // <----- Alo left in here I guess

    const ex350G_250 = await upsertRequirement(
      excavadora350G.id,
      250,
      'Mantenimiento 250 HRS'
    );
    const ex350G_500 = await upsertRequirement(
      excavadora350G.id,
      500,
      'Mantenimiento 500 HRS'
    );
    const ex350G_1000 = await upsertRequirement(
      excavadora350G.id,
      1000,
      'Mantenimiento 1000 HRS'
    );
    const ex350G_2000 = await upsertRequirement(
      excavadora350G.id,
      2000,
      'Mantenimiento 2000 HRS'
    );


    await Promise.all([
      upsertItem(ex350G_250, {
        numero: 'RE521420',
        equivalente: '',
        descripcion: ' FILTRO DE ACEITE',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(ex350G_250, {
        numero: "AT365869",
        equivalente: '5134490 CAT',
        descripcion: 'FILTRO SEPARADOR',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(ex350G_250, {
        numero: "RE525523",
        equivalente: '',
        descripcion: 'FILTRO DE COMBUSTIBLE',
        cantidad: 2,
        unidad: 'pieza',
      }),

      upsertItem(ex350G_250, {
        numero: "AT330978",
        equivalente: '',
        descripcion: 'FILTRO PRIMARIO',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(ex350G_250, {
        numero: "AT330980",
        equivalente: '',
        descripcion: 'FILTRO SECUNDARIO',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex350G_250, {
        numero: "15W40",
        equivalente: '',
        descripcion: 'ACEITE 15W40',
        cantidad: 38,
        unidad: 'lts',
      }),
    ]);

    // 500
    await Promise.all([
      upsertItem(ex350G_500, {
        numero: 'RE521420',
        equivalente: '',
        descripcion: ' FILTRO DE ACEITE',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(ex350G_500, {
        numero: "AT365869",
        equivalente: '5134490 CAT',
        descripcion: 'FILTRO SEPARADOR',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(ex350G_500, {
        numero: "RE525523",
        equivalente: '',
        descripcion: 'FILTRO DE COMBUSTIBLE',
        cantidad: 2,
        unidad: 'pieza',
      }),

      upsertItem(ex350G_500, {
        numero: "AT330978",
        equivalente: '',
        descripcion: 'FILTRO PRIMARIO',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex350G_500, {
        numero: "4630525",
        equivalente: '',
        descripcion: 'FILTRO PILOTO HIDRAULICO',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex350G_500, {
        numero: "FYA00033065",
        equivalente: '',
        descripcion: 'FILTRO HIDRAULICO SUMERJIBLE',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex350G_500, {
        numero: "FYA00001490R",
        equivalente: '',
        descripcion: 'FILTRO AC EXTERIOR',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex350G_500, {
        numero: "4S00686R",
        equivalente: '',
        descripcion: 'FILTRO AC INTERIOR',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex350G_500, {
        numero: "FYA00016054",
        equivalente: '',
        descripcion: 'FILTRO HIDRAULICO',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex350G_500, {
        numero: "15W40",
        equivalente: '',
        descripcion: 'ACEITE 15W40',
        cantidad: 38,
        unidad: 'lts',
      }),
    ]);


    // 1000
    await Promise.all([
      upsertItem(ex350G_1000, {
        numero: 'RE521420',
        equivalente: '',
        descripcion: ' FILTRO DE ACEITE',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(ex350G_1000, {
        numero: "AT365869",
        equivalente: '5134490 CAT',
        descripcion: 'FILTRO SEPARADOR',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(ex350G_1000, {
        numero: "RE525523",
        equivalente: '',
        descripcion: 'FILTRO DE COMBUSTIBLE',
        cantidad: 2,
        unidad: 'pieza',
      }),

      upsertItem(ex350G_1000, {
        numero: "AT330978",
        equivalente: '',
        descripcion: 'FILTRO PRIMARIO',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex350G_1000, {
        numero: "4630525",
        equivalente: '',
        descripcion: 'FILTRO PILOTO HIDRAULICO',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex350G_1000, {
        numero: "FYA00033065",
        equivalente: '',
        descripcion: 'FILTRO HIDRAULICO SUMERJIBLE',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex350G_1000, {
        numero: "FYA00001490R",
        equivalente: '',
        descripcion: 'FILTRO AC EXTERIOR',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex350G_1000, {
        numero: "4S00686R",
        equivalente: '',
        descripcion: 'FILTRO AC INTERIOR',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex350G_1000, {
        numero: "FYA00016054",
        equivalente: '',
        descripcion: 'FILTRO HIDRAULICO',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex350G_1000, {
        numero: "15W40",
        equivalente: '',
        descripcion: 'ACEITE 15W40',
        cantidad: 38,
        unidad: 'lts',
      }),


      upsertItem(ex350G_1000, {
        numero: "10W",
        equivalente: '',
        descripcion: 'ACEITE 10W',
        cantidad: 200,
        unidad: 'lts',
      }),
    ]);



    await Promise.all([
      upsertItem(ex350G_2000, {
        numero: 'RE521420',
        equivalente: '',
        descripcion: ' FILTRO DE ACEITE',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(ex350G_2000, {
        numero: "AT365869",
        equivalente: '5134490 CAT',
        descripcion: 'FILTRO SEPARADOR',
        cantidad: 1,
        unidad: 'pieza',
      }),
      upsertItem(ex350G_2000, {
        numero: "RE525523",
        equivalente: '',
        descripcion: 'FILTRO DE COMBUSTIBLE',
        cantidad: 2,
        unidad: 'pieza',
      }),

      upsertItem(ex350G_2000, {
        numero: "AT330978",
        equivalente: '',
        descripcion: 'FILTRO PRIMARIO',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex350G_2000, {
        numero: "AT330980",
        equivalente: '',
        descripcion: 'FILTRO SECUNDARIO',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex350G_2000, {
        numero: "4630525",
        equivalente: '',
        descripcion: 'FILTRO PILOTO HIDRAULICO',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex350G_2000, {
        numero: "FYA00033065",
        equivalente: '',
        descripcion: 'FILTRO HIDRAULICO SUMERJIBLE',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex350G_2000, {
        numero: "FYA00001490R",
        equivalente: '',
        descripcion: 'FILTRO AC EXTERIOR',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex350G_2000, {
        numero: "4S00686R",
        equivalente: '',
        descripcion: 'FILTRO AC INTERIOR',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex350G_2000, {
        numero: "FYA00016054",
        equivalente: '',
        descripcion: 'FILTRO HIDRAULICO',
        cantidad: 1,
        unidad: 'pieza',
      }),

      upsertItem(ex350G_2000, {
        numero: "15W40",
        equivalente: '',
        descripcion: 'ACEITE 15W40',
        cantidad: 38,
        unidad: 'lts',
      }),


      upsertItem(ex350G_2000, {
        numero: "10W",
        equivalente: '',
        descripcion: 'ACEITE 10W',
        cantidad: 200,
        unidad: 'lts',
      }),

      upsertItem(ex350G_2000, {
        numero: "85W-140",
        equivalente: '',
        descripcion: 'ACEITE 85W-140',
        cantidad: 200,
        unidad: 'lts',
      }),

      upsertItem(ex350G_2000, {
        numero: "SAE 50",
        equivalente: '',
        descripcion: 'ACEITE SAE 50 PARA MANDOS',
        cantidad: 36,
        unidad: 'lts',
      }),

    ]);



    // TODO: Here is what's left
    const retro416 = await upsertCategoria('Retro 416 CAT 0352');
    const retro416T = await upsertCategoria('Retro 416 T CAT 214');
    const moto140k = await upsertCategoria('MOTO 140K CAT 656');
    const motoJd77 = await upsertCategoria('MOTO JD 770G 3659');
    const motoJd67 = await upsertCategoria('MOTO JD 670P');
    const vibroCat457 = await upsertCategoria('VIBRO CAT 457');
    const vibroXcmg = await upsertCategoria('VIBRO XCMG 0298 (140)');
  }
}
