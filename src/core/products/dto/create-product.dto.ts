import { IsNotEmpty, IsString, IsNumber, IsArray } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsString()
  descripcion: string;

  @IsNotEmpty()
  @IsString()
  sku: string;

  @IsString()
  imagen: string;

  @IsArray()
  etiquetas: string[];

  @IsNotEmpty()
  @IsNumber()
  precio: number;

  @IsNotEmpty()
  @IsNumber()
  stock: number;
}
