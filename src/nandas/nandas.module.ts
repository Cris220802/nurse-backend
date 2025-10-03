import { Module } from '@nestjs/common';
import { NandasService } from './nandas.service';
import { NandasController } from './nandas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClaseNanda } from './entities/clase.entity';
import { DominioNanda } from './entities/dominio.entity';
import { DiagnosticoNanda } from './entities/diagnostico.entity';
import { NecesidadNanda } from './entities/necesidad.entity';
import { PatronNanda } from './entities/patron.entity';
import { ResultadoNoc } from 'src/nocs/entities/resultado.entity';
import { IntervencionNic } from 'src/nics/entities/intervencion.entity';

@Module({
  controllers: [NandasController],
  providers: [NandasService],
  imports: [
    TypeOrmModule.forFeature([
      DiagnosticoNanda,
      ClaseNanda, 
      DominioNanda,
      NecesidadNanda,
      PatronNanda,
      ResultadoNoc,
      IntervencionNic
    ])
  ]
})
export class NandasModule { }
