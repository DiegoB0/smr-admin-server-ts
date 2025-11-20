import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CategoriaFiltro } from 'src/filtros/entities/filtro-category.entity';
import { FiltroItem } from 'src/filtros/entities/filtro-item.entity';
import { FiltroRequirement } from 'src/filtros/entities/filtro-requirements.entity';
import { DataSource } from 'typeorm';


@Injectable()
export class LookupSeeder implements OnModuleInit {
  private readonly logger = new Logger(LookupSeeder.name);

  constructor(private readonly dataSource: DataSource) { }

  async onModuleInit() {
    if (process.env.SEED_LOOKUPS === 'false') return;

    await this.dataSource.transaction(async (m) => {

      /* ================= TRACTOR KOMATSU ======================= */
      const tractorKomatsu = await m.save(CategoriaFiltro, {
        nombre: 'Tractores Komatsu',
      });

      /* ---> REQUIREMENTS <--- */
      const tractorKomatsu250 = await m.save(FiltroRequirement, {
        categoriaId: tractorKomatsu.id,
        hrs: 250,
        nombre: 'Mantenimiento 250 HRS',
      });

      const tractorKomatsu500 = await m.save(FiltroRequirement, {
        categoriaId: tractorKomatsu.id,
        hrs: 500,
        nombre: 'Mantenimiento 500 HRS',
      });

      const tractorKomatsu1000 = await m.save(FiltroRequirement, {
        categoriaId: tractorKomatsu.id,
        hrs: 1000,
        nombre: 'Mantenimiento 1000 HRS',
      });

      const tractorKomatsu2000 = await m.save(FiltroRequirement, {
        categoriaId: tractorKomatsu.id,
        hrs: 2000,
        nombre: 'Mantenimiento 2000 HRS',
      });

      /* ---> FILTERS <--- */
      // -> 250 HRS
      await m.save(FiltroItem, [
        {
          numero: 'P559000',
          equivalente: '6002111340',
          descripcion: 'FILTRO DE ACEITE',
          cantidad: 2,
          unidad: 'pieza',
          requirement: tractorKomatsu250,
        },
        {
          numero: 'P550937',
          equivalente: '6003114510',
          descripcion: 'FILTRO DE SEPARADOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorKomatsu250,
        },
        {
          numero: 'P502480',
          equivalente: '6003193841',
          descripcion: 'FILTRO DE COMBUSTIBLE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorKomatsu250,
        },
        {
          numero: 'P777868',
          equivalente: '6001856100',
          descripcion: 'FILTRO PRIMARIO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorKomatsu250,
        },
        {
          numero: '15W40',
          equivalente: '',
          descripcion: 'ACEITE 15W40',
          cantidad: 57,
          unidad: 'lts',
          requirement: tractorKomatsu250,
        },
      ]);

      // -> 500 HRS
      await m.save(FiltroItem, [
        {
          numero: 'P559000',
          equivalente: '6002111340',
          descripcion: 'FILTRO DE ACEITE',
          cantidad: 2,
          unidad: 'pieza',
          requirement: tractorKomatsu500,
        },
        {
          numero: 'P550937',
          equivalente: '6003114510',
          descripcion: 'FILTRO DE SEPARADOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorKomatsu500,
        },
        {
          numero: 'P502480',
          equivalente: '6003193841',
          descripcion: 'FILTRO DE COMBUSTIBLE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorKomatsu500,
        },
        {
          numero: 'P777868',
          equivalente: '6001856100',
          descripcion: 'FILTRO PRIMARIO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorKomatsu500,
        },
        {
          numero: 'P777869',
          equivalente: '',
          descripcion: 'FILTRO SECUNDARIO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorKomatsu500,
        },
        {
          numero: 'P557380',
          equivalente: '',
          descripcion: 'SUMERGIBLE TRANSMISIÓN',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorKomatsu500,
        },
        {
          numero: 'P551054',
          equivalente: '',
          descripcion: 'SUMERGIBLE HIDRAULICO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorKomatsu500,
        },
        {
          numero: 'P550787',
          equivalente: '',
          descripcion: 'SUMERGIBLE HIDRAULICO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorKomatsu500,
        },
        {
          numero: 'P500138',
          equivalente: '',
          descripcion: 'FILTRO A/C EXTERIOR',
          cantidad: 2,
          unidad: 'pieza',
          requirement: tractorKomatsu500,
        },
        {
          numero: 'PA30156',
          equivalente: '',
          descripcion: 'FILTRO A/C CABINA ',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorKomatsu500,
        },
        {
          numero: '15W40',
          equivalente: '',
          descripcion: 'ACEITE 15W40',
          cantidad: 57,
          unidad: 'lts',
          requirement: tractorKomatsu500,
        },

      ]);


      // -> 1000 HRS
      await m.save(FiltroItem, [
        {
          numero: 'P559000',
          equivalente: '6002111340',
          descripcion: 'FILTRO DE ACEITE',
          cantidad: 2,
          unidad: 'pieza',
          requirement: tractorKomatsu1000,
        },
        {
          numero: 'P550937',
          equivalente: '6003114510',
          descripcion: 'FILTRO DE SEPARADOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorKomatsu1000,
        },
        {
          numero: 'P502480',
          equivalente: '6003193841',
          descripcion: 'FILTRO DE COMBUSTIBLE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorKomatsu1000,
        },
        {
          numero: 'P777868',
          equivalente: '6001856100',
          descripcion: 'FILTRO PRIMARIO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorKomatsu1000,
        },
        {
          numero: 'P777869',
          equivalente: '',
          descripcion: 'FILTRO SECUNDARIO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorKomatsu1000,
        },
        {
          numero: 'P557380',
          equivalente: '',
          descripcion: 'SUMERGIBLE TRANSMISIÓN',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorKomatsu1000,
        },
        {
          numero: 'P551054',
          equivalente: '',
          descripcion: 'SUMERGIBLE HIDRAULICO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorKomatsu1000,
        },
        {
          numero: 'P550787',
          equivalente: '',
          descripcion: 'SUMERGIBLE HIDRAULICO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorKomatsu1000,
        },
        {
          numero: 'P500138',
          equivalente: '',
          descripcion: 'FILTRO A/C EXTERIOR',
          cantidad: 2,
          unidad: 'pieza',
          requirement: tractorKomatsu1000,
        },
        {
          numero: 'PA30156',
          equivalente: '',
          descripcion: 'FILTRO A/C CABINA ',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorKomatsu1000,
        },
        {
          numero: '15W40',
          equivalente: '',
          descripcion: 'ACEITE 15W40',
          cantidad: 57,
          unidad: 'lts',
          requirement: tractorKomatsu1000,
        },
        {
          numero: 'SAE 85w140',
          equivalente: '',
          descripcion: 'SAE  85w140  MANDOS',
          cantidad: 160,
          unidad: 'lts',
          requirement: tractorKomatsu1000,
        },
      ]);


      // -> 2000 HRS
      await m.save(FiltroItem, [
        {
          numero: 'P559000',
          equivalente: '6002111340',
          descripcion: 'FILTRO DE ACEITE',
          cantidad: 2,
          unidad: 'pieza',
          requirement: tractorKomatsu2000,
        },
        {
          numero: 'P550937',
          equivalente: '6003114510',
          descripcion: 'FILTRO DE SEPARADOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorKomatsu2000,
        },
        {
          numero: 'P502480',
          equivalente: '6003193841',
          descripcion: 'FILTRO DE COMBUSTIBLE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorKomatsu2000,
        },
        {
          numero: 'P777868',
          equivalente: '6001856100',
          descripcion: 'FILTRO PRIMARIO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorKomatsu2000,
        },
        {
          numero: 'P777869',
          equivalente: '',
          descripcion: 'FILTRO SECUNDARIO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorKomatsu2000,
        },
        {
          numero: 'P557380',
          equivalente: '',
          descripcion: 'SUMERGIBLE TRANSMISIÓN',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorKomatsu2000,
        },
        {
          numero: 'P551054',
          equivalente: '',
          descripcion: 'SUMERGIBLE HIDRAULICO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorKomatsu2000,
        },
        {
          numero: 'P550787',
          equivalente: '',
          descripcion: 'SUMERGIBLE HIDRAULICO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorKomatsu2000,
        },
        {
          numero: 'P500138',
          equivalente: '',
          descripcion: 'FILTRO A/C EXTERIOR',
          cantidad: 2,
          unidad: 'pieza',
          requirement: tractorKomatsu2000,
        },
        {
          numero: 'PA30156',
          equivalente: '',
          descripcion: 'FILTRO A/C CABINA ',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorKomatsu2000,
        },
        {
          numero: '569-15-51721',
          equivalente: '',
          descripcion: 'FILTER ASSEMBLY',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorKomatsu2000,
        },
        {
          numero: '15W40',
          equivalente: '',
          descripcion: 'ACEITE 15W40',
          cantidad: 57,
          unidad: 'lts',
          requirement: tractorKomatsu2000,
        },
        {
          numero: 'SAE 30',
          equivalente: '',
          descripcion: 'ACEITE DE TRANSMISION SAE 30 ',
          cantidad: 160,
          unidad: 'lts',
          requirement: tractorKomatsu2000,
        },
        {
          numero: 'SAE 85w140',
          equivalente: '',
          descripcion: 'SAE  85w140  MANDOS',
          cantidad: 140,
          unidad: 'lts',
          requirement: tractorKomatsu2000,
        },
        {
          numero: '10 W',
          equivalente: '',
          descripcion: 'ACEITE HIDRAULICO 10W',
          cantidad: 208,
          unidad: 'lts',
          requirement: tractorKomatsu2000,
        },
      ]);


      /* ================= TRACTOR CAT D9 ======================= */

      const tractorCatD9 = await m.save(CategoriaFiltro, {
        nombre: 'Tractores CAT D9',
      });

      /* ---> REQUIREMENTS <--- */
      const tractorCatD9_250 = await m.save(FiltroRequirement, {
        categoriaId: tractorCatD9.id,
        hrs: 250,
        numero: 'Mantenimiento 250 HRS',
      });

      const tractorCatD9_500 = await m.save(FiltroRequirement, {
        categoriaId: tractorCatD9.id,
        hrs: 500,
        numero: 'Mantenimiento 500 HRS',
      });

      const tractorCatD9_1000 = await m.save(FiltroRequirement, {
        categoriaId: tractorCatD9.id,
        hrs: 1000,
        numero: 'Mantenimiento 1000 HRS',
      });

      const tractorCatD9_2000 = await m.save(FiltroRequirement, {
        categoriaId: tractorCatD9.id,
        hrs: 2000,
        numero: 'Mantenimiento 2000 HRS',
      });

      /* ---> FILTERS <--- */

      // -> 250 HRS
      await m.save(FiltroItem, [
        {
          numero: '1R1808',
          equivalente: '',
          descripcion: '',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_250,
        },
        {
          name: "3261643",
          equivalente: '',
          descripcion: '',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_250,
        },
        {
          name: "1R0749",
          equivalente: '',
          descripcion: '',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_250,
        },
        {
          name: "1327168",
          equivalente: '',
          descripcion: '',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_250,
        },
        {
          name: "15W40",
          equivalente: '',
          descripcion: '',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_250,
        },

      ]);

      // -> 500 HRS

      // -> 1000 HRS

      // -> 2000 HRS



      /* ================= TRACTOR CAT 366D ======================= */
      const excavadoraCat366D = await m.save(CategoriaFiltro, {
        nombre: 'Excavadora CAT 366D',
      });

      /* ---> REQUIREMENTS <--- */

      /* ---> FILTERS <--- */

      // -> 250 HRS

      // -> 500 HRS

      // -> 1000 HRS

      // -> 2000 HRS


      /* ================= TRACTOR CAT 320D ======================= */
      const excavadoraCat320D = await m.save(CategoriaFiltro, {
        nombre: 'Excavadora CAT 320D',
      });

      /* ---> REQUIREMENTS <--- */

      /* ---> FILTERS <--- */

      // -> 250 HRS

      // -> 500 HRS

      // -> 1000 HRS

      // -> 2000 HRS


      /* ================= TRACTOR CAT 320D ======================= */
      const excavadoraCat336B = await m.save(CategoriaFiltro, {
        nombre: 'Excavadora CAT 336B'
      })

      /* ---> REQUIREMENTS <--- */

      /* ---> FILTERS <--- */

      // -> 250 HRS

      // -> 500 HRS

      // -> 1000 HRS

      // -> 2000 HRS


      const excavadora350G700 = await m.save(CategoriaFiltro, {
        nombre: 'Excavadora 350G 700'
      })

      /* ---> REQUIREMENTS <--- */

      /* ---> FILTERS <--- */

      // -> 250 HRS

      // -> 500 HRS

      // -> 1000 HRS

      // -> 2000 HRS

      const retro416Cat0352 = await m.save(CategoriaFiltro, {
        nombre: 'Retro 416 CAT 0352'
      })

      /* ---> REQUIREMENTS <--- */

      /* ---> FILTERS <--- */

      // -> 250 HRS

      // -> 500 HRS

      // -> 1000 HRS

      // -> 2000 HRS



      const retro416Cat214 = await m.save(CategoriaFiltro, {
        nombre: 'Retro 416 T CAT 214'
      })

      /* ---> REQUIREMENTS <--- */

      /* ---> FILTERS <--- */

      // -> 250 HRS

      // -> 500 HRS

      // -> 1000 HRS

      // -> 2000 HRS


      const moto140KCAT656 = await m.save(CategoriaFiltro, {
        nombre: 'MOTO 140K CAT 656'
      })

      /* ---> REQUIREMENTS <--- */

      /* ---> FILTERS <--- */

      // -> 250 HRS

      // -> 500 HRS

      // -> 1000 HRS

      // -> 2000 HRS


      const motoJD770G3659 = await m.save(CategoriaFiltro, {
        nombre: 'MOTO JD 770G 3659'
      })

      /* ---> REQUIREMENTS <--- */

      /* ---> FILTERS <--- */

      // -> 250 HRS

      // -> 500 HRS

      // -> 1000 HRS

      // -> 2000 HRS


      const motoJD670P = await m.save(CategoriaFiltro, {
        nombre: 'MOTO JD 670P'
      })

      /* ---> REQUIREMENTS <--- */

      /* ---> FILTERS <--- */

      // -> 250 HRS

      // -> 500 HRS

      // -> 1000 HRS

      // -> 2000 HRS


      const vibroCAT457 = await m.save(CategoriaFiltro, {
        nombre: 'VIBRO CAT 457'
      })

      /* ---> REQUIREMENTS <--- */

      /* ---> FILTERS <--- */

      // -> 250 HRS

      // -> 500 HRS

      // -> 1000 HRS

      // -> 2000 HRS


      const vibroXCMG0298 = await m.save(CategoriaFiltro, {
        nombre: 'VIBRO XCMG 0298 (140)'
      })

      /* ---> REQUIREMENTS <--- */

      /* ---> FILTERS <--- */

      // -> 250 HRS

      // -> 500 HRS

      // -> 1000 HRS

      // -> 2000 HRS




      this.logger.log('Filtro categories, requirements, and items seeded successfully');
    });

    this.logger.log('Lookup seeding completed');
  }
}
