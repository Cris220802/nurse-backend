import { Module } from '@nestjs/common';
import { NocsService } from './nocs.service';
import { NocsController } from './nocs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResultadoNoc } from './entities/resultado.entity';
import { ClaseNoc } from './entities/clase.entity';
import { DominioNoc } from './entities/dominio.entity';
import { IndicadorNoc } from './entities/indicador.entity';
import { PatronNoc } from './entities/patron.entity';
import { Especialidad } from 'src/especialidades/entities/especialidad.entity';
import { DiagnosticoNanda } from 'src/nandas/entities/diagnostico.entity';
import { IntervencionNic } from 'src/nics/entities/intervencion.entity';

@Module({
  controllers: [NocsController],
  providers: [NocsService],
  imports: [
    TypeOrmModule.forFeature([
      Especialidad,
      ResultadoNoc,
      ClaseNoc,
      DominioNoc,
      IndicadorNoc,
      PatronNoc,
      DiagnosticoNanda,
      IntervencionNic
    ])
  ]
})
export class NocsModule { }
