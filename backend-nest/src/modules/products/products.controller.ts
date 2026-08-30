import { Controller, Get, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '../../common/enums/permission.enum';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /** Customer (and roles with product:view) — list catalog. */
  @Get()
  @RequirePermissions(Permission.PRODUCT_VIEW)
  list() {
    return {
      message: 'Products listed successfully',
      data: [],
    };
  }

  /** Vendor — create product. */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(Permission.PRODUCT_CREATE)
  create() {
    return {
      message: 'Product created successfully',
      data: { id: null },
    };
  }
}
