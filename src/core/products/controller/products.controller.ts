import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ProductsService } from '../service/products.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Products } from '../entities/product.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async createProduct(
    @Body() createProductDto: CreateProductDto,
  ): Promise<Products> {
    return this.productsService.createProduct(createProductDto);
  }

  @Patch(':id')
  async editProduct(
    @Param('id') productId: string,
    @Body() editProductDto: UpdateProductDto,
  ): Promise<Products> {
    return this.productsService.editProduct(productId, editProductDto);
  }

  @Delete(':id')
  async deleteProduct(@Param('id') productId: string): Promise<void> {
    return this.productsService.deleteProduct(productId);
  }

  @Get('filters')
  find(
    @Query('page', ParseIntPipe) page = 0,
    @Query('limit', ParseIntPipe) limit = 4,
    @Query('minValue', new DefaultValuePipe(0), ParseIntPipe) minValue,
    @Query('maxValue', new DefaultValuePipe(0), ParseIntPipe) maxValue,
    @Query('valueToFilter') valueToFilter = '',
  ) {
    const skip = page * limit;
    const data = { skip, limit, minValue, maxValue, valueToFilter };

    if (data.minValue > 0 && data.valueToFilter !== '') {
      return this.productsService.filterByPriceAndWord(data);
    }

    if (data.minValue > 0) {
      return this.productsService.filterByPrice(data);
    }

    if (data.valueToFilter !== '') {
      return this.productsService.filterByWord(data);
    }

    return this.productsService.findAll(skip, limit);
  }
}
