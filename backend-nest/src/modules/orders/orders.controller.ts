import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '../../common/enums/permission.enum';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /** Customer — place an order. */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(Permission.ORDER_CREATE)
  create() {
    return {
      message: 'Order created successfully',
      data: { id: null },
    };
  }
}
