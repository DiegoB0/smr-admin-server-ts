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
          descripcion: ' FILTRO DE ACEITE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_250,
        },
        {
          name: "3261643",
          equivalente: '',
          descripcion: 'FILTRO SEPARADOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_250,
        },
        {
          name: "1R0749",
          equivalente: '',
          descripcion: 'FILTRO COMBUSTIBLE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_250,
        },
        {
          name: "1327168",
          equivalente: '',
          descripcion: 'FILTRO PRIMARIO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_250,
        },
        {
          name: "15W40",
          equivalente: '',
          descripcion: 'ACEITE 15W40',
          cantidad: 57,
          unidad: 'lts',
          requirement: tractorCatD9_250,
        },

      ]);

      // -> 500 HRS
            await m.save(FiltroItem, [
        {
          numero: '1R1808',
          equivalente: '',
          descripcion: ' FILTRO DE ACEITE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_500,
        },
        {
          name: "3261643",
          equivalente: '',
          descripcion: 'FILTRO SEPARADOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_500,
        },
        {
          name: "1R0749",
          equivalente: '',
          descripcion: 'FILTRO COMBUSTIBLE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_500,
        },
        {
          name: "1327168",
          equivalente: '',
          descripcion: 'FILTRO PRIMARIO de AIRE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_500,
        },
        {
          name: "1063973",
          equivalente: '',
          descripcion: 'FILTRO SECUNDARIO de AIRE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_500,
        },
        {
          name: "4656506",
          equivalente: '',
          descripcion: 'FILTRO HIDRAULICO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_500,
        },
        {
          name: "5715253",
          equivalente: '',
          descripcion: 'FILTRO DE TRANSMICIÓN',
          cantidad: 2,
          unidad: 'pieza',
          requirement: tractorCatD9_500,
        },
        {
          name: "1R0774",
          equivalente: '',
          descripcion: 'FILTRO HIDRAULICO SUMERJIBLE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_500,
        },
        {
          name: "3468243",
          equivalente: '',
          descripcion: 'FILTRO AC INTERIOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_500,
        },
        {
          name: "2310167",
          equivalente: '',
          descripcion: 'FILTRO AC EXTERIOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_500,
        },
        {
          name: "15W40",
          equivalente: '',
          descripcion: 'ACEITE 15W40',
          cantidad: 57,
          unidad: 'lts',
          requirement: tractorCatD9_500,
        },

      ]);

      // -> 1000 HRS
      await m.save(FiltroItem, [
        {
          numero: '1R1808',
          equivalente: '',
          descripcion: ' FILTRO DE ACEITE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_1000,
        },
        {
          name: "3261643",
          equivalente: '',
          descripcion: 'FILTRO SEPARADOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_1000,
        },
        {
          name: "1R0749",
          equivalente: '',
          descripcion: 'FILTRO COMBUSTIBLE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_1000,
        },
        {
          name: "1327168",
          equivalente: '',
          descripcion: 'FILTRO PRIMARIO de AIRE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_1000,
        },
        {
          name: "1063973",
          equivalente: '',
          descripcion: 'FILTRO SECUNDARIO de AIRE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_1000,
        },
        {
          name: "4656506",
          equivalente: '',
          descripcion: 'FILTRO HIDRAULICO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_1000,
        },
        {
          name: "5715253",
          equivalente: '',
          descripcion: 'FILTRO DE TRANSMICIÓN',
          cantidad: 2,
          unidad: 'pieza',
          requirement: tractorCatD9_1000,
        },
        {
          name: "1R0774",
          equivalente: '',
          descripcion: 'FILTRO HIDRAULICO SUMERJIBLE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_1000,
        },
        {
          name: "3468243",
          equivalente: '',
          descripcion: 'FILTRO AC INTERIOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_1000,
        },
        {
          name: "2310167",
          equivalente: '',
          descripcion: 'FILTRO AC EXTERIOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_1000,
        },
        {
          name: "15W40",
          equivalente: '',
          descripcion: 'ACEITE 15W40',
          cantidad: 57,
          unidad: 'lts',
          requirement: tractorCatD9_1000,
        },
        {
          name: "SAE 30",
          equivalente: '',
          descripcion: 'ACEITE SAE 30',
          cantidad: 200,
          unidad: 'lts',
          requirement: tractorCatD9_1000,
        },
      ]);
      // -> 2000 HRS
      await m.save(FiltroItem, [
        {
          numero: '1R1808',
          equivalente: '',
          descripcion: ' FILTRO DE ACEITE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_2000,
        },
        {
          name: "3261643",
          equivalente: '',
          descripcion: 'FILTRO SEPARADOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_2000,
        },
        {
          name: "1R0749",
          equivalente: '',
          descripcion: 'FILTRO COMBUSTIBLE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_2000,
        },
        {
          name: "1327168",
          equivalente: '',
          descripcion: 'FILTRO PRIMARIO de AIRE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_2000,
        },
        {
          name: "1063973",
          equivalente: '',
          descripcion: 'FILTRO SECUNDARIO de AIRE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_2000,
        },
        {
          name: "4656506",
          equivalente: '',
          descripcion: 'FILTRO HIDRAULICO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_2000,
        },
        {
          name: "5715253",
          equivalente: '',
          descripcion: 'FILTRO DE TRANSMICIÓN',
          cantidad: 2,
          unidad: 'pieza',
          requirement: tractorCatD9_2000,
        },
        {
          name: "1R0774",
          equivalente: '',
          descripcion: 'FILTRO HIDRAULICO SUMERJIBLE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_2000,
        },
        {
          name: "3468243",
          equivalente: '',
          descripcion: 'FILTRO AC INTERIOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_2000,
        },
        {
          name: "2310167",
          equivalente: '',
          descripcion: 'FILTRO AC EXTERIOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: tractorCatD9_2000,
        },
        {
          name: "15W40",
          equivalente: '',
          descripcion: 'ACEITE 15W40',
          cantidad: 57,
          unidad: 'lts',
          requirement: tractorCatD9_2000,
        },
        {
          name: "SAE 30",
          equivalente: '',
          descripcion: 'ACEITE SAE 30',
          cantidad: 200,
          unidad: 'lts',
          requirement: tractorCatD9_2000,
        },
        {
          name: "10 W",
          equivalente: '',
          descripcion: 'ACEITE HIDRAULICO 10W',
          cantidad: 200,
          unidad: 'lts',
          requirement: tractorCatD9_2000,
        },
        {
          name: "SAE 50",
          equivalente: '',
          descripcion: 'ACEITE SAE 50 PARA MANDOS',
          cantidad: 50,
          unidad: 'lts',
          requirement: tractorCatD9_2000,
        },
        {
          name: "85W140",
          equivalente: '',
          descripcion: 'ACEITE PARA CAÑON 85W140',
          cantidad: 120,
          unidad: 'lts',
          requirement: tractorCatD9_2000,
        },
      ]);
      
      /* ================= EXCAVADORE CAT 336D ======================= */
      const excavadoraCat336D = await m.save(CategoriaFiltro, {
        nombre: 'Excavadora CAT 336D',
      });

      /* ---> REQUIREMENTS <--- */

      const excavadoraCat336D_250 = await m.save(FiltroRequirement, {
        categoriaId: excavadoraCat336D.id,
        hrs: 250,
        numero: 'Mantenimiento 250 HRS',
      });

      const excavadoraCat336D_500 = await m.save(FiltroRequirement, {
        categoriaId: excavadoraCat336D.id,
        hrs: 500,
        numero: 'Mantenimiento 500 HRS',
      });

      const excavadoraCat336D_1000 = await m.save(FiltroRequirement, {
        categoriaId: excavadoraCat336D.id,
        hrs: 1000,
        numero: 'Mantenimiento 1000 HRS',
      });

      const excavadoraCat336D_2000 = await m.save(FiltroRequirement, {
        categoriaId: excavadoraCat336D.id,
        hrs: 1000,
        numero: 'Mantenimiento 1000 HRS',
      });

      /* ---> FILTERS <--- */

      // -> 250 HRS
      await m.save(FiltroItem, [
        {
          numero: '1R1808',
          equivalente: '',
          descripcion: ' FILTRO DE ACEITE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336D_250,
        },
        {
          name: "3261644",
          equivalente: '',
          descripcion: 'FILTRO SEPARADOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336D_250,
        },
        {
          name: "1R0762",
          equivalente: '',
          descripcion: 'FILTRO COMBUSTIBLE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336D_250,
        },
        {
          name: "1421339",
          equivalente: '',
          descripcion: 'FILTRO PRIMARIO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336D_250,
        },
        {
          name: "15W40",
          equivalente: '',
          descripcion: 'ACEITE 15W40',
          cantidad: 57,
          unidad: 'lts',
          requirement: excavadoraCat336D_250,
        },

      ]);

      // -> 500 HRS

      await m.save(FiltroItem, [
        {
          numero: '1R1808',
          equivalente: '',
          descripcion: ' FILTRO DE ACEITE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336D_500,
        },
        {
          name: "3261644",
          equivalente: '',
          descripcion: 'FILTRO SEPARADOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336D_500,
        },
        {
          name: "1R0762",
          equivalente: '',
          descripcion: 'FILTRO COMBUSTIBLE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336D_500,
        },
        {
          name: "1421339",
          equivalente: '',
          descripcion: 'FILTRO PRIMARIO DE AIRE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336D_500,
        },
        {
          name: "1421404",
          equivalente: '',
          descripcion: 'FILTRO SECUNDARIO DE AIRE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336D_500,
        },
        {
          name: "5I8670",
          equivalente: '',
          descripcion: 'FILTRO HIDRAULICO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336D_500,
        },
        {
          name: "937521",
          equivalente: '',
          descripcion: 'FILTRO HIDRAULICO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336D_500,
        },
        {
          name: "1799806",
          equivalente: '',
          descripcion: 'FILTRO HIDRAULICO SUMERJIBLE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336D_500,
        },
        {
          name: "2931183",
          equivalente: '',
          descripcion: 'FILTRO AC EXTERIOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336D_500,
        },
        {
          name: "5460006",
          equivalente: '',
          descripcion: 'FILTRO AC INTERIOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336D_500,
        },
        {
          name: "15W40",
          equivalente: '',
          descripcion: 'ACEITE 15W40',
          cantidad: 57,
          unidad: 'lts',
          requirement: excavadoraCat336D_500,
        },

      ]);

      // -> 1000 HRS

        await m.save(FiltroItem, [
        {
          numero: '1R1808',
          equivalente: '',
          descripcion: ' FILTRO DE ACEITE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336D_1000,
        },
        {
          name: "3261644",
          equivalente: '',
          descripcion: 'FILTRO SEPARADOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336D_1000,
        },
        {
          name: "1R0762",
          equivalente: '',
          descripcion: 'FILTRO COMBUSTIBLE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336D_1000,
        },
        {
          name: "1421339",
          equivalente: '',
          descripcion: 'FILTRO PRIMARIO DE AIRE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336D_1000,
        },
        {
          name: "1421404",
          equivalente: '',
          descripcion: 'FILTRO SECUNDARIO DE AIRE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336D_1000,
        },
        {
          name: "5I8670",
          equivalente: '',
          descripcion: 'FILTRO HIDRAULICO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336D_1000,
        },
        {
          name: "937521",
          equivalente: '',
          descripcion: 'FILTRO HIDRAULICO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336D_1000,
        },
        {
          name: "1799806",
          equivalente: '',
          descripcion: 'FILTRO HIDRAULICO SUMERJIBLE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336D_1000,
        },
        {
          name: "2931183",
          equivalente: '',
          descripcion: 'FILTRO AC EXTERIOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336D_1000,
        },
        {
          name: "5460006",
          equivalente: '',
          descripcion: 'FILTRO AC INTERIOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336D_1000,
        },
        {
          name: "15W40",
          equivalente: '',
          descripcion: 'ACEITE 15W40',
          cantidad: 57,
          unidad: 'lts',
          requirement: excavadoraCat336D_1000,
        },
        {
          name: "85W140",
          equivalente: '',
          descripcion: 'ACEITE 85W140 SWING Y MANDOS',
          cantidad: 57,
          unidad: 'lts',
          requirement: excavadoraCat336D_1000,
        },

      ]);

      // -> 2000 HRS

      await m.save(FiltroItem, [
        {
          numero: '1R1808',
          equivalente: '',
          descripcion: ' FILTRO DE ACEITE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336D_2000,
        },
        {
          name: "3261644",
          equivalente: '',
          descripcion: 'FILTRO SEPARADOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336D_2000,
        },
        {
          name: "1R0762",
          equivalente: '',
          descripcion: 'FILTRO COMBUSTIBLE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336D_2000,
        },
        {
          name: "1421339",
          equivalente: '',
          descripcion: 'FILTRO PRIMARIO DE AIRE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336D_2000,
        },
        {
          name: "1421404",
          equivalente: '',
          descripcion: 'FILTRO SECUNDARIO DE AIRE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336D_2000,
        },
        {
          name: "5I8670",
          equivalente: '',
          descripcion: 'FILTRO HIDRAULICO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336D_2000,
        },
        {
          name: "937521",
          equivalente: '',
          descripcion: 'FILTRO HIDRAULICO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336D_2000,
        },
        {
          name: "1799806",
          equivalente: '',
          descripcion: 'FILTRO HIDRAULICO SUMERJIBLE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336D_2000,
        },
        {
          name: "2931183",
          equivalente: '',
          descripcion: 'FILTRO AC EXTERIOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336D_2000,
        },
        {
          name: "5460006",
          equivalente: '',
          descripcion: 'FILTRO AC INTERIOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336D_2000,
        },
        {
          name: "15W40",
          equivalente: '',
          descripcion: 'ACEITE 15W40',
          cantidad: 38,
          unidad: 'lts',
          requirement: excavadoraCat336D_2000,
        },
        {
          name: "85W140",
          equivalente: '',
          descripcion: 'ACEITE 85W140 SWING Y MANDOS',
          cantidad: 38,
          unidad: 'lts',
          requirement: excavadoraCat336D_2000,
        },
         {
          name: "10W",
          equivalente: '',
          descripcion: 'ACEITE HIDRAULICO 10W',
          cantidad: 208,
          unidad: 'lts',
          requirement: excavadoraCat336D_2000,
        },

      ]);


      /* ================= EXCAVADORA CAT 320D ======================= */
      const excavadoraCat320D = await m.save(CategoriaFiltro, {
        nombre: 'Excavadora CAT 320D',
      });

      /* ---> REQUIREMENTS <--- */
       const excavadoraCat320D_250 = await m.save(FiltroRequirement, {
        categoriaId: excavadoraCat320D.id,
        hrs: 250,
        numero: 'Mantenimiento 250 HRS',
      });

      const excavadoraCat320D_500 = await m.save(FiltroRequirement, {
        categoriaId: excavadoraCat320D.id,
        hrs: 500,
        numero: 'Mantenimiento 500 HRS',
      });

      const excavadoraCat320D_1000 = await m.save(FiltroRequirement, {
        categoriaId: excavadoraCat320D.id,
        hrs: 1000,
        numero: 'Mantenimiento 1000 HRS',
      });

      const excavadoraCat320D_2000 = await m.save(FiltroRequirement, {
        categoriaId: excavadoraCat320D.id,
        hrs: 1000,
        numero: 'Mantenimiento 1000 HRS',
      });

      

      /* ---> FILTERS <--- */

      // -> 250 HRS
      await m.save(FiltroItem, [
        {
          numero: '1R0739',
          equivalente: '',
          descripcion: ' FILTRO DE ACEITE DE MOTOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat320D_250,
        },
        {
          name: "1318821",
          equivalente: '',
          descripcion: 'FILTRO DE ACEITE SECUNDARIO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat320D_250,
        },
        {
          name: "1R0751",
          equivalente: '',
          descripcion: 'FILTRO DE COMBUSTIBLE',
          cantidad: 2,
          unidad: 'pieza',
          requirement: excavadoraCat320D_250,
        },
        {
          name: "1318822",
          equivalente: '',
          descripcion: 'FILTRO PRIMARIO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat320D_250,
        },
        {
          name: "15W40",
          equivalente: '',
          descripcion: 'ACEITE 15W40',
          cantidad: 38,
          unidad: 'lts',
          requirement: excavadoraCat320D_250,
        },

      ]);

      // -> 500 HRS
      await m.save(FiltroItem, [
        {
          numero: '1R0739',
          equivalente: '',
          descripcion: ' FILTRO DE ACEITE DE MOTOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat320D_500,
        },
        {
          name: "1318821",
          equivalente: '',
          descripcion: 'FILTRO DE ACEITE SECUNDARIO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat320D_500,
        },
        {
          name: "3261644",
          equivalente: '',
          descripcion: 'FILTRO SEPARADOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat320D_500,
        },
        {
          name: "1R0751",
          equivalente: '',
          descripcion: 'FILTRO DE COMBUSTIBLE',
          cantidad: 2,
          unidad: 'pieza',
          requirement: excavadoraCat320D_500,
        },
        {
          name: "1318822",
          equivalente: '',
          descripcion: 'FILTRO PRIMARIO DE AIRE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat320D_500,
        },
        {
          name: "5I8670",
          equivalente: '',
          descripcion: 'FILTRO HIDRAULICO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat320D_500,
        },
        {
          name: "1884142",
          equivalente: '',
          descripcion: 'FILTRO TANQUE HIDRAULICO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat320D_500,
        },
        {
          name: "2166676",
          equivalente: '',
          descripcion: 'FILTRO DEL SISTEMA HIDRAULICO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat320D_500,
        },
        {
          name: "O937521",
          equivalente: '',
          descripcion: 'FILTRO DE ACEITE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat320D_500,
        },
        {
          name: "2458823",
          equivalente: '',
          descripcion: 'FILTRO AC EXTERIOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat320D_500,
        },
        {
          name: "2931137",
          equivalente: '',
          descripcion: 'FILTRO AC INTERIOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat320D_500,
        },
        {
          name: "15W40",
          equivalente: '',
          descripcion: 'ACEITE 15W40',
          cantidad: 38,
          unidad: 'lts',
          requirement: excavadoraCat320D_500,
        },

      ]);

      // -> 1000 HRS
      await m.save(FiltroItem, [
        {
          numero: '1R0739',
          equivalente: '',
          descripcion: ' FILTRO DE ACEITE DE MOTOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat320D_1000,
        },
        {
          name: "1318821",
          equivalente: '',
          descripcion: 'FILTRO DE ACEITE SECUNDARIO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat320D_1000,
        },
        {
          name: "3261644",
          equivalente: '',
          descripcion: 'FILTRO SEPARADOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat320D_1000,
        },
        {
          name: "1R0751",
          equivalente: '',
          descripcion: 'FILTRO DE COMBUSTIBLE',
          cantidad: 2,
          unidad: 'pieza',
          requirement: excavadoraCat320D_1000,
        },
        {
          name: "1318822",
          equivalente: '',
          descripcion: 'FILTRO PRIMARIO DE AIRE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat320D_1000,
        },
        {
          name: "5I8670",
          equivalente: '',
          descripcion: 'FILTRO HIDRAULICO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat320D_1000,
        },
        {
          name: "1884142",
          equivalente: '',
          descripcion: 'FILTRO TANQUE HIDRAULICO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat320D_1000,
        },
        {
          name: "2166676",
          equivalente: '',
          descripcion: 'FILTRO DEL SISTEMA HIDRAULICO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat320D_1000,
        },
        {
          name: "O937521",
          equivalente: '',
          descripcion: 'FILTRO DE ACEITE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat320D_1000,
        },
        {
          name: "2458823",
          equivalente: '',
          descripcion: 'FILTRO AC EXTERIOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat320D_1000,
        },
        {
          name: "2931137",
          equivalente: '',
          descripcion: 'FILTRO AC INTERIOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat320D_1000,
        },
        {
          name: "15W40",
          equivalente: '',
          descripcion: 'ACEITE DE MOTOR 15W40',
          cantidad: 38,
          unidad: 'lts',
          requirement: excavadoraCat320D_1000,
        },
        {
          name: "10W",
          equivalente: '',
          descripcion: 'ACEITE HIDRAULICO 10W',
          cantidad: 208,
          unidad: 'lts',
          requirement: excavadoraCat320D_1000,
        },
        {
          name: "85W140",
          equivalente: '',
          descripcion: 'ACEITE 85W140  PARA MANDOS Y SWING',
          cantidad: 38,
          unidad: 'lts',
          requirement: excavadoraCat320D_1000,
        },

      ]);

      // -> 2000 HRS
      await m.save(FiltroItem, [
        {
          numero: '1R0739',
          equivalente: '',
          descripcion: ' FILTRO DE ACEITE DE MOTOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat320D_2000,
        },
        {
          name: "1318821",
          equivalente: '',
          descripcion: 'FILTRO DE ACEITE SECUNDARIO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat320D_2000,
        },
        {
          name: "3261644",
          equivalente: '',
          descripcion: 'FILTRO SEPARADOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat320D_2000,
        },
        {
          name: "1884142",
          equivalente: '',
          descripcion: 'FILTRO TANQUE HIDRAULICO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat320D_2000,
        },
        {
          name: "2458823",
          equivalente: '',
          descripcion: 'FILTRO AC EXTERIOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat320D_2000,
        },
        {
          name: "2931137",
          equivalente: '',
          descripcion: 'FILTRO AC INTERIOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat320D_2000,
        },
        {
          name: "15W40",
          equivalente: '',
          descripcion: 'ACEITE DE MOTOR 15W40',
          cantidad: 38,
          unidad: 'lts',
          requirement: excavadoraCat320D_2000,
        },
        {
          name: "10W",
          equivalente: '',
          descripcion: 'ACEITE HIDRAULICO 10W',
          cantidad: 200,
          unidad: 'lts',
          requirement: excavadoraCat320D_2000,
        },
        {
          name: "85W140",
          equivalente: '',
          descripcion: 'ACEITE 85W140  PARA MANDOS Y SWING',
          cantidad: 40,
          unidad: 'lts',
          requirement: excavadoraCat320D_2000,
        },
        {
          name: "SAE 50",
          equivalente: '',
          descripcion: 'ACEITE SAE 50 PARA MANDOS',
          cantidad: 57,
          unidad: 'lts',
          requirement: excavadoraCat320D_2000,
        },

      ]);


      /* ================= EXCAVADORA CAT 336B ======================= */
      const excavadoraCat336B = await m.save(CategoriaFiltro, {
        nombre: 'Excavadora CAT 336B'
      })

      /* ---> REQUIREMENTS <--- */
      const excavadoraCat336B_250 = await m.save(FiltroRequirement, {
        categoriaId: excavadoraCat336B.id,
        hrs: 250,
        numero: 'Mantenimiento 250 HRS',
      });

      const excavadoraCat336B_500 = await m.save(FiltroRequirement, {
        categoriaId: excavadoraCat336B.id,
        hrs: 500,
        numero: 'Mantenimiento 500 HRS',
      });

      const excavadoraCat336B_1000 = await m.save(FiltroRequirement, {
        categoriaId: excavadoraCat336B.id,
        hrs: 1000,
        numero: 'Mantenimiento 1000 HRS',
      });

      const excavadoraCat336B_2000 = await m.save(FiltroRequirement, {
        categoriaId: excavadoraCat336B.id,
        hrs: 2000,
        numero: 'Mantenimiento 2000 HRS',
      });

      /* ---> FILTERS <--- */

      // -> 250 HRS

       await m.save(FiltroItem, [
        {
          numero: '322-3155',
          equivalente: '',
          descripcion: ' FILTRO DE ACEITE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336B_250,
        },
        {
          name: "523-4987",
          equivalente: '',
          descripcion: 'FILTRO SEPARADOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336B_250,
        },
        {
          name: "509-5694",
          equivalente: '',
          descripcion: 'FILTRO DE COMBUSTIBLE',
          cantidad: 2,
          unidad: 'pieza',
          requirement: excavadoraCat336B_250,
        },
        {
          name: "496-9845",
          equivalente: '',
          descripcion: 'FILTRO PRIMARIO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat320D_250,
        },
        {
          name: "496-9846",
          equivalente: '',
          descripcion: 'FILTRO SECUNDARIO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336B_250,
        },
        {
          name: "15W40",
          equivalente: '',
          descripcion: 'ACEITE 15W40',
          cantidad: 57,
          unidad: 'lts',
          requirement: excavadoraCat336B_250,
        },

      ]);

      // -> 500 HRS

      await m.save(FiltroItem, [
        {
          numero: '322-3155',
          equivalente: '',
          descripcion: ' FILTRO DE ACEITE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336B_500,
        },
        {
          name: "523-4987",
          equivalente: '',
          descripcion: 'FILTRO SEPARADOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336B_500,
        },
        {
          name: "523-4988",
          equivalente: '',
          descripcion: 'FILTRO DE COMBUSTIBLE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336B_500,
        },
        {
          name: "509-5694",
          equivalente: '',
          descripcion: 'FILTRO DE COMBUSTIBLE SECUNDARIO',
          cantidad: 2,
          unidad: 'pieza',
          requirement: excavadoraCat336B_500,
        },
        {
          name: "496-9845",
          equivalente: '',
          descripcion: 'FILTRO PRIMARIO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat320D_500,
        },
        {
          name: "496-9846",
          equivalente: '',
          descripcion: 'FILTRO SECUNDARIO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336B_500,
        },
        {
          name: "509-9787",
          equivalente: '',
          descripcion: 'FILTRO HIDRAULICO SUMERJIBLE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336B_500,
        },
        {
          name: "522-1451",
          equivalente: '',
          descripcion: 'FILTRO HIDRAULICO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336B_500,
        },
        {
          name: "289-7789",
          equivalente: '',
          descripcion: 'FILTRO HIDRAULICO DE TRANSMICIÓN',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336B_500,
        },
        {
          name: "15W40",
          equivalente: '',
          descripcion: 'ACEITE 15W40',
          cantidad: 57,
          unidad: 'lts',
          requirement: excavadoraCat336B_500,
        },

      ]);

      // -> 1000 HRS
      await m.save(FiltroItem, [
        {
          numero: '322-3155',
          equivalente: '',
          descripcion: ' FILTRO DE ACEITE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336B_1000,
        },
        {
          name: "523-4987",
          equivalente: '',
          descripcion: 'FILTRO SEPARADOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336B_1000,
        },
        {
          name: "523-4988",
          equivalente: '',
          descripcion: 'FILTRO DE COMBUSTIBLE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336B_1000,
        },
        {
          name: "496-9845",
          equivalente: '',
          descripcion: 'FILTRO PRIMARIO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat320D_1000,
        },
        {
          name: "496-9846",
          equivalente: '',
          descripcion: 'FILTRO SECUNDARIO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336B_1000,
        },
        {
          name: "509-9787",
          equivalente: '',
          descripcion: 'FILTRO HIDRAULICO SUMERJIBLE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336B_1000,
        },
        {
          name: "522-1451",
          equivalente: '',
          descripcion: 'FILTRO HIDRAULICO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336B_1000,
        },
        {
          name: "289-7789",
          equivalente: '',
          descripcion: 'FILTRO HIDRAULICO DE TRANSMICIÓN',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336B_1000,
        },
        {
          name: "15W40",
          equivalente: '',
          descripcion: 'ACEITE 15W40',
          cantidad: 57,
          unidad: 'lts',
          requirement: excavadoraCat336B_1000,
        },
        {
          name: "85W-140",
          equivalente: '',
          descripcion: 'ACEITE 85W-140 SWING Y MANDOS',
          cantidad: 38,
          unidad: 'lts',
          requirement: excavadoraCat336B_1000,
        },

      ]);


      // -> 2000 HRS
       await m.save(FiltroItem, [
        {
          numero: '322-3155',
          equivalente: '',
          descripcion: ' FILTRO DE ACEITE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336B_2000,
        },
        {
          name: "523-4987",
          equivalente: '',
          descripcion: 'FILTRO SEPARADOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336B_2000,
        },
        {
          name: "523-4988",
          equivalente: '',
          descripcion: 'FILTRO DE COMBUSTIBLE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336B_2000,
        },
        {
          name: "509-5694",
          equivalente: '',
          descripcion: 'FILTRO DE COMBUSTIBLE SECUNDARIO',
          cantidad: 2,
          unidad: 'pieza',
          requirement: excavadoraCat336B_2000,
        },
        {
          name: "496-9845",
          equivalente: '',
          descripcion: 'FILTRO PRIMARIO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat320D_2000,
        },
        {
          name: "496-9846",
          equivalente: '',
          descripcion: 'FILTRO SECUNDARIO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336B_2000,
        },
        {
          name: "509-9787",
          equivalente: '',
          descripcion: 'FILTRO HIDRAULICO SUMERJIBLE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336B_2000,
        },
        {
          name: "522-1451",
          equivalente: '',
          descripcion: 'FILTRO HIDRAULICO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336B_2000,
        },
        {
          name: "289-7789",
          equivalente: '',
          descripcion: 'FILTRO HIDRAULICO DE TRANSMICIÓN',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336B_2000,
        },
        {
          name: "500-0957",
          equivalente: '',
          descripcion: 'FILTRO AC EXTERIOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat320D_2000,
        },
        {
          name: "480-5439",
          equivalente: '',
          descripcion: 'FILTRO AC INTERIOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadoraCat336B_2000,
        },
        {
          name: "15W40",
          equivalente: '',
          descripcion: 'ACEITE 15W40',
          cantidad: 57,
          unidad: 'lts',
          requirement: excavadoraCat336B_2000,
        },
        {
          name: "10W",
          equivalente: '',
          descripcion: 'ACEITE HIDRAULICO 10W',
          cantidad: 218,
          unidad: 'lts',
          requirement: excavadoraCat336B_2000,
        },
        {
          name: "85W-40",
          equivalente: '',
          descripcion: 'ACEITE',
          cantidad: 19,
          unidad: 'lts',
          requirement: excavadoraCat336B_2000,
        },
        {
          name: "SAE 50",
          equivalente: '',
          descripcion: 'ACEITE SAE 50 PARA MANDOS',
          cantidad: 57,
          unidad: 'lts',
          requirement: excavadoraCat336B_2000,
        },

      ]);

      /* ================= EXCAVADORA 350G700 ======================= */

      const excavadora350G700 = await m.save(CategoriaFiltro, {
        nombre: 'Excavadora 350G 700'
      })

      /* ---> REQUIREMENTS <--- */
       const excavadora350G700_250 = await m.save(FiltroRequirement, {
        categoriaId: excavadora350G700.id,
        hrs: 250,
        numero: 'Mantenimiento 250 HRS',
      });

      const excavadora350G700_500 = await m.save(FiltroRequirement, {
        categoriaId: excavadora350G700.id,
        hrs: 500,
        numero: 'Mantenimiento 500 HRS',
      });

      const excavadora350G700_1000 = await m.save(FiltroRequirement, {
        categoriaId: excavadora350G700.id,
        hrs: 1000,
        numero: 'Mantenimiento 1000 HRS',
      });

      const excavadora350G700_2000 = await m.save(FiltroRequirement, {
        categoriaId: excavadora350G700.id,
        hrs: 2000,
        numero: 'Mantenimiento 2000 HRS',
      });


      /* ---> FILTERS <--- */

      // -> 250 HRS
      await m.save(FiltroItem, [
        {
          numero: 'RE521420',
          equivalente: '',
          descripcion: ' FILTRO DE ACEITE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadora350G700_250,
        },
        {
          name: "AT365869",
          equivalente: '5134490 CAT',
          descripcion: 'FILTRO SEPARADOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadora350G700_250,
        },
        {
          name: "RE525523",
          equivalente: '',
          descripcion: 'FILTRO DE COMBUSTIBLE',
          cantidad: 2,
          unidad: 'pieza',
          requirement: excavadora350G700_250,
        },
        {
          name: "AT330978",
          equivalente: '',
          descripcion: 'FILTRO PRIMARIO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadora350G700_250,
        },
        {
          name: "AT330980",
          equivalente: '',
          descripcion: 'FILTRO SECUNDARIO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadora350G700_250,
        },
        {
          name: "15W40",
          equivalente: '',
          descripcion: 'ACEITE 15W40',
          cantidad: 38,
          unidad: 'lts',
          requirement: excavadora350G700_250,
        },

      ]);

      // -> 500 HRS

       await m.save(FiltroItem, [
        {
          numero: 'RE521420',
          equivalente: '',
          descripcion: ' FILTRO DE ACEITE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadora350G700_500,
        },
        {
          name: "AT365869",
          equivalente: '5134490 CAT',
          descripcion: 'FILTRO SEPARADOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadora350G700_500,
        },
        {
          name: "RE525523",
          equivalente: '',
          descripcion: 'FILTRO DE COMBUSTIBLE',
          cantidad: 2,
          unidad: 'pieza',
          requirement: excavadora350G700_500,
        },
        {
          name: "AT330978",
          equivalente: '',
          descripcion: 'FILTRO PRIMARIO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadora350G700_500,
        },
        {
          name: "4630525",
          equivalente: '',
          descripcion: 'FILTRO PILOTO HIDRAULICO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadora350G700_500,
        },
         {
          name: "FYA00033065",
          equivalente: '',
          descripcion: 'FILTRO HIDRAULICO SUMERJIBLE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadora350G700_500,
        },
         {
          name: "FYA00001490R",
          equivalente: '',
          descripcion: 'FILTRO AC EXTERIOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadora350G700_500,
        },
         {
          name: "4S00686R",
          equivalente: '',
          descripcion: 'FILTRO AC INTERIOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadora350G700_500,
        },
         {
          name: "FYA00016054",
          equivalente: '',
          descripcion: 'FILTRO HIDRAULICO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadora350G700_500,
        },
        {
          name: "15W40",
          equivalente: '',
          descripcion: 'ACEITE 15W40',
          cantidad: 38,
          unidad: 'lts',
          requirement: excavadora350G700_500,
        },

      ]);


      // -> 1000 HRS

      await m.save(FiltroItem, [
        {
          numero: 'RE521420',
          equivalente: '',
          descripcion: ' FILTRO DE ACEITE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadora350G700_1000,
        },
        {
          name: "AT365869",
          equivalente: '5134490 CAT',
          descripcion: 'FILTRO SEPARADOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadora350G700_1000,
        },
        {
          name: "RE525523",
          equivalente: '',
          descripcion: 'FILTRO DE COMBUSTIBLE',
          cantidad: 2,
          unidad: 'pieza',
          requirement: excavadora350G700_1000,
        },
        {
          name: "AT330978",
          equivalente: '',
          descripcion: 'FILTRO PRIMARIO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadora350G700_1000,
        },
        {
          name: "4630525",
          equivalente: '',
          descripcion: 'FILTRO PILOTO HIDRAULICO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadora350G700_1000,
        },
         {
          name: "FYA00033065",
          equivalente: '',
          descripcion: 'FILTRO HIDRAULICO SUMERJIBLE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadora350G700_1000,
        },
         {
          name: "FYA00001490R",
          equivalente: '',
          descripcion: 'FILTRO AC EXTERIOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadora350G700_1000,
        },
         {
          name: "4S00686R",
          equivalente: '',
          descripcion: 'FILTRO AC INTERIOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadora350G700_1000,
        },
         {
          name: "FYA00016054",
          equivalente: '',
          descripcion: 'FILTRO HIDRAULICO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadora350G700_1000,
        },
        {
          name: "15W40",
          equivalente: '',
          descripcion: 'ACEITE 15W40',
          cantidad: 38,
          unidad: 'lts',
          requirement: excavadora350G700_1000,
        },
        {
          name: "10W",
          equivalente: '',
          descripcion: 'ACEITE 10W',
          cantidad: 200,
          unidad: 'lts',
          requirement: excavadora350G700_1000,
        },

      ]);


      // -> 2000 HRS
       await m.save(FiltroItem, [
        {
          numero: 'RE521420',
          equivalente: '',
          descripcion: ' FILTRO DE ACEITE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadora350G700_2000,
        },
        {
          name: "AT365869",
          equivalente: '5134490 CAT',
          descripcion: 'FILTRO SEPARADOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadora350G700_2000,
        },
        {
          name: "RE525523",
          equivalente: '',
          descripcion: 'FILTRO DE COMBUSTIBLE',
          cantidad: 2,
          unidad: 'pieza',
          requirement: excavadora350G700_2000,
        },
        {
          name: "AT330978",
          equivalente: '',
          descripcion: 'FILTRO PRIMARIO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadora350G700_2000,
        },
        {
          name: "AT330980",
          equivalente: '',
          descripcion: 'FILTRO SECUNDARIO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadora350G700_2000,
        },
        {
          name: "4630525",
          equivalente: '',
          descripcion: 'FILTRO PILOTO HIDRAULICO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadora350G700_2000,
        },
         {
          name: "FYA00033065",
          equivalente: '',
          descripcion: 'FILTRO HIDRAULICO SUMERJIBLE',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadora350G700_2000,
        },
         {
          name: "FYA00001490R",
          equivalente: '',
          descripcion: 'FILTRO AC EXTERIOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadora350G700_2000,
        },
         {
          name: "4S00686R",
          equivalente: '',
          descripcion: 'FILTRO AC INTERIOR',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadora350G700_2000,
        },
         {
          name: "FYA00016054",
          equivalente: '',
          descripcion: 'FILTRO HIDRAULICO',
          cantidad: 1,
          unidad: 'pieza',
          requirement: excavadora350G700_2000,
        },
        {
          name: "15W40",
          equivalente: '',
          descripcion: 'ACEITE 15W40',
          cantidad: 38,
          unidad: 'lts',
          requirement: excavadora350G700_2000,
        },
        {
          name: "10W",
          equivalente: '',
          descripcion: 'ACEITE 10W',
          cantidad: 200,
          unidad: 'lts',
          requirement: excavadora350G700_2000,
        },
        {
          name: "85W-140",
          equivalente: '',
          descripcion: 'ACEITE 85W-140',
          cantidad: 200,
          unidad: 'lts',
          requirement: excavadora350G700_2000,
        },
         {
          name: "SAE 50",
          equivalente: '',
          descripcion: 'ACEITE SAE 50 PARA MANDOS',
          cantidad: 36,
          unidad: 'lts',
          requirement: excavadora350G700_2000,
        },

      ]);
/* ================= RETRO 416 CAT 0352 ======================= */
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
