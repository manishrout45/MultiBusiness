import { Controller, Get, Put, HttpCode, HttpStatus } from '@nestjs/common';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '../../common/enums/permission.enum';
import { VendorsService } from './vendors.service';

@Controller('vendor')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  /** Vendor — view orders for their business. */
  @Get('orders')
  @RequirePermissions(Permission.ORDER_VIEW_VENDOR)
  listOrders() {
    return {
      message: 'Vendor orders retrieved successfully',
      data: [],
    };
  }

  /** Vendor — update business profile. */
  @Put('business')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permission.BUSINESS_MANAGE)
  updateBusiness() {
    return {
      message: 'Business updated successfully',
      data: { id: null },
    };
  }
}
