import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Requisicion } from './entities/requisicion.entity';
import { LogsService } from 'src/logs/logs.service';
import { Repository } from 'typeorm';
import { RequisicionItem } from './entities/requisicion_item.entity';

@Injectable()
export class RequisicionesService {
  constructor(
    @InjectRepository(Requisicion)
    private requisicionRepo: Repository<Requisicion>,

    @InjectRepository(Requisicion)
    private requisicionItemRepo: Repository<RequisicionItem>,

    private readonly logService: LogsService
  ) {}
  // TODO: REPORTES LOGIC

  // TODO: Create Requisiciones
  async createRequisicion () {

  }

  async getRequisiciones () {

  }


  async acceptRequisicion () {

  }


  async deleteRequisicion () {

  }

  async updateRequisicion () {

  }
}
