import { Prop } from '@nestjs/mongoose';

export class StockHistory {
  @Prop({ required: true })
  stockAnterior: number;

  @Prop({ required: true })
  stockNuevo: number;

  @Prop({ default: Date.now })
  fecha: Date;
}
