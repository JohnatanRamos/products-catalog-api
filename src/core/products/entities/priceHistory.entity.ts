import { Prop } from '@nestjs/mongoose';

export class PriceHistory {
  @Prop({ required: true })
  precioAnterior: number;

  @Prop({ required: true })
  precioNuevo: number;

  @Prop()
  fecha: Date;
}
