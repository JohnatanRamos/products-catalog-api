import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Products } from '../entities/product.entity';
import { IFilters } from '../interfaces/IFilters.interface';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Products.name) private readonly productModel: Model<Products>,
  ) {}

  async createProduct(createProductDto: CreateProductDto): Promise<Products> {
    const { sku } = createProductDto;

    // Verificar si el SKU ya existen en la base de datos
    const existingProduct = await this.productModel.findOne({ sku }).exec();

    if (existingProduct) {
      if (existingProduct.sku === sku) {
        throw new BadRequestException('El SKU ya existe');
      }
    }

    const createdProduct = new this.productModel({
      ...createProductDto,
      historialPrecio: [
        {
          fecha: new Date(),
          precioNuevo: createProductDto.precio,
        },
      ],
      historialStock: [
        {
          fecha: new Date(),
          stockNuevo: createProductDto.stock,
        },
      ],
    });
    return createdProduct.save();
  }

  async editProduct(
    productId: string,
    editProductDto: UpdateProductDto,
  ): Promise<Products> {
    const { sku } = editProductDto;

    // Verificar si el producto a editar existe
    const existingProduct = await this.productModel.findById(productId).exec();

    if (!existingProduct) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Verificar si el nuevo SKU nuevo ya existen en otros productos
    if (sku && sku !== existingProduct.sku) {
      const conflictProduct = await this.productModel
        .findOne({ sku, _id: { $ne: productId } })
        .exec();

      if (conflictProduct) {
        throw new BadRequestException(
          'El nuevo SKU ya existe en otro producto',
        );
      }
    }

    this.validateChanges(existingProduct, editProductDto);

    // Aplicar las actualizaciones al producto
    Object.assign(existingProduct, editProductDto);

    return existingProduct.save();
  }

  /**
   * Valida si se cambio el stock o el precio.
   */
  validateChanges(existingProduct: Products, newProduct: UpdateProductDto) {
    if (existingProduct.stock !== newProduct.stock) {
      existingProduct.historialStock.push({
        stockAnterior: existingProduct.stock,
        stockNuevo: newProduct.stock,
        fecha: new Date(),
      });
    }

    if (existingProduct.precio !== newProduct.precio) {
      existingProduct.historialPrecio.push({
        precioAnterior: existingProduct.precio,
        precioNuevo: newProduct.precio,
        fecha: new Date(),
      });
    }
  }

  async findAll(
    skip: number,
    limit: number,
  ): Promise<{ products: Products[]; totalRecords: number }> {
    const products = await this.productModel.find().skip(skip).limit(limit);
    const totalRecords = await this.productModel.count();
    return {
      products,
      totalRecords,
    };
  }

  async deleteProduct(productId: string): Promise<void> {
    // Verificar si el producto existe
    const existingProduct = await this.productModel.findById(productId).exec();

    if (!existingProduct) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Eliminar el producto
    await this.productModel.findByIdAndRemove(productId).exec();
  }

  /**
   * Pagina y filtra por sku, nombre y precio a la misma vez.
   * @param filter Valores necesarios para la consulta.
   */
  async filterByPriceAndWord(
    filter: IFilters,
  ): Promise<{ products: Products[]; totalRecords: number }> {
    const { minValue, maxValue, skip, limit, valueToFilter } = filter;

    const query = {
      $or: [
        { sku: { $regex: valueToFilter, $options: 'i' } },
        { nombre: { $regex: valueToFilter, $options: 'i' } },
      ],
      $and: [{ precio: { $gte: minValue, $lte: maxValue } }],
    };
    if (!maxValue || maxValue === 0) {
      delete query.$and[0].precio.$lte;
    }

    const response = await this.productModel
      .find(query)
      .skip(skip)
      .limit(limit);
    return {
      products: response,
      totalRecords: await this.productModel.find(query).count(),
    };
  }

  /**
   * Pagina y filtra por sku y nombre.
   * @param filter Valores necesarios para la consulta.
   */
  async filterByWord(
    filter: IFilters,
  ): Promise<{ products: Products[]; totalRecords: number }> {
    const { skip, limit, valueToFilter } = filter;

    const query = {
      $or: [
        { sku: { $regex: valueToFilter, $options: 'i' } },
        { nombre: { $regex: valueToFilter, $options: 'i' } },
      ],
    };
    const response = this.productModel.find(query);
    response.skip(skip).limit(limit);

    return {
      products: await response,
      totalRecords: await this.productModel.find(query).count(),
    };
  }

  /**
   * Pagina y filtra por un rango de precio.
   * @param filter Valores necesarios para la consulta.
   */
  async filterByPrice(
    filter: IFilters,
  ): Promise<{ products: Products[]; totalRecords: number }> {
    const { minValue, maxValue, skip, limit } = filter;

    const query = { precio: { $gte: minValue, $lte: maxValue } };
    if (!maxValue || maxValue === 0) {
      delete query.precio.$lte;
    }

    const response = await this.productModel
      .find(query)
      .skip(skip)
      .limit(limit);

    return {
      products: response,
      totalRecords: await this.productModel.find(query).count(),
    };
  }
}
