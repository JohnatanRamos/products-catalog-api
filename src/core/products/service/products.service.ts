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
    const { sku, nombre } = createProductDto;

    // Verificar si el SKU o el nombre ya existen en la base de datos
    const existingProduct = await this.productModel
      .findOne({ $or: [{ sku }, { nombre }] })
      .exec();

    if (existingProduct) {
      if (existingProduct.sku === sku) {
        throw new BadRequestException('El SKU ya existe');
      } else {
        throw new BadRequestException('El nombre ya existe');
      }
    }

    const createdProduct = new this.productModel(createProductDto);
    return createdProduct.save();
  }

  async editProduct(
    productId: string,
    editProductDto: UpdateProductDto,
  ): Promise<Products> {
    const { sku, nombre } = editProductDto;

    // Verificar si el producto a editar existe
    const existingProduct = await this.productModel.findById(productId).exec();

    if (!existingProduct) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Verificar si el nuevo SKU o el nuevo nombre ya existen en otros productos
    if (
      (sku && sku !== existingProduct.sku) ||
      (nombre && nombre !== existingProduct.nombre)
    ) {
      const conflictProduct = await this.productModel
        .findOne({ $or: [{ sku }, { nombre }] })
        .exec();
      if (conflictProduct) {
        if (conflictProduct.sku === sku) {
          throw new BadRequestException(
            'El nuevo SKU ya existe en otro producto',
          );
        } else {
          throw new BadRequestException(
            'El nuevo nombre ya existe en otro producto',
          );
        }
      }
    }

    // Aplicar las actualizaciones al producto
    Object.assign(existingProduct, editProductDto);

    return existingProduct.save();
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
