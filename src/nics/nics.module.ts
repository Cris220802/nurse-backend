import { Module } from '@nestjs/common';
import { NicsService } from './nics.service';
import { NicsController } from './nics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Especialidad } from 'src/especialidades/entities/especialidad.entity';
import { IntervencionNic } from './entities/intervencion.entity';
import { ClaseNic } from './entities/clase.entity';
import { CampoNic } from './entities/campo.entity';
import { ActividadNic } from './entities/actividad.entity';
import { DiagnosticoNanda } from 'src/nandas/entities/diagnostico.entity';
import { ResultadoNoc } from 'src/nocs/entities/resultado.entity';

@Module({
  controllers: [NicsController],
  providers: [NicsService],
  imports: [
      TypeOrmModule.forFeature([
        Especialidad,
        IntervencionNic,
        ClaseNic,
        CampoNic,
        ActividadNic,
        DiagnosticoNanda,
        ResultadoNoc
      ])
    ]
})
export class NicsModule {}
