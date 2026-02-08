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
import { EscalaNoc } from './entities/escala.entity';
import { NivelEscala } from './entities/nivel-escala.entity';

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
      IntervencionNic,
      EscalaNoc,
      NivelEscala
    ])
  ]
})
export class NocsModule { }
