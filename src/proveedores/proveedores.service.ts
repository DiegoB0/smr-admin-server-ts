import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProveedorDto, UpdateProveedorDto } from './dto/request.dto';
import { Proveedor } from './entities/proveedor.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundError } from 'rxjs';

@Injectable()
export class ProveedoresService {
  constructor(
    @InjectRepository(Proveedor)
    private readonly proveedoresRepo: Repository<Proveedor>,
  ) {}

  async create(createProveedoreDto: CreateProveedorDto): Promise<Proveedor> {
    const proveedor = this.proveedoresRepo.create(createProveedoreDto);
    return this.proveedoresRepo.save(proveedor);
  }

  findAll(): Promise<Proveedor[]> {
    return this.proveedoresRepo.find();
  }

 async findOne(id: number): Promise<Proveedor> {
    const proveedor = await this.proveedoresRepo.findOneBy({ id });
    if (!proveedor) {
      throw new NotFoundException('Proveedor not found');
    }
    return proveedor;
  }

  async update(id: number, updateProveedoreDto: UpdateProveedorDto): Promise<Proveedor> {
    await this.proveedoresRepo.update(id, updateProveedoreDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.proveedoresRepo.delete(id);
  }
}
