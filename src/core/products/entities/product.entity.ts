import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
}

export const ProductsSchema = SchemaFactory.createForClass(Products);