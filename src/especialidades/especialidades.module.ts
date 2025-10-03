import { Module } from '@nestjs/common';
import { EspecialidadesService } from './especialidades.service';
import { EspecialidadesController } from './especialidades.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Especialidad } from './entities/especialidad.entity';

@Module({
  controllers: [EspecialidadesController],
  providers: [EspecialidadesService],
  imports: [
    TypeOrmModule.forFeature([
      Especialidad
    ])
  ]
})
export class EspecialidadesModule { }
