import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { AlmacenesService } from 'src/almacenes/almacenes.service';


@Injectable()
@Processor('excel-queue')
export class ExcelProcessor {
  constructor(private almacenesService: AlmacenesService) {}

  @Process('process-excel')
  async processExcel(job: Job) {
    const { items, almacenId, userId } = job.data;
    const BATCH_SIZE = 50;

    const results: any[] = [];
    const errors: any[] = [];

    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = items.slice(i, i + BATCH_SIZE);

      // Process batch in parallel
      const batchResults = await Promise.allSettled(
        batch.map((item) =>
          this.almacenesService.addStockWithEntrada(
            almacenId,
            {
              almacenId,
              customId: item.codigo,
              productName: item.articulo,
              unidad: item.unidad,
              cantidad: item.cantidad,
              createEntrada: false,
            },
            { id: userId } as any
          )
        )
      );

      // Collect results
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          errors.push({
            row: batch[index].rowIndex,
            codigo: batch[index].codigo,
            articulo: batch[index].articulo,
            reason: result.reason?.message || 'Unknown error',
          });
        }
      });

      // Update job progress
      const progress = Math.round(((i + BATCH_SIZE) / items.length) * 100);
      job.progress(Math.min(progress, 100));

      // Small delay between batches
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return {
      message: 'Excel imported successfully',
      imported: results.length,
      skipped: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}
