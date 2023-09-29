import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { StockHistory } from './stockHistory.entity';
import { PriceHistory } from './priceHistory.entity';

@Schema()
export class Products extends Document {
  @Prop({ required: true })
  nombre: string;

  @Prop()
  descripcion: string;

  @Prop({ required: true, unique: true })
  sku: string;

  @Prop()
  imagen: string;

  @Prop({ type: [String] })
  etiquetas: string[];

  @Prop({ required: true })
  precio: number;

  @Prop({ required: true })
  stock: number;

  @Prop({ type: Array<StockHistory> })
  historialStock: Array<StockHistory>;

  @Prop({ type: Array<PriceHistory> })
  historialPrecio: Array<PriceHistory>;
}

export const ProductsSchema = SchemaFactory.createForClass(Products);