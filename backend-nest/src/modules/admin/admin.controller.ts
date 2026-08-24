import { Controller, Get, Put, HttpCode, HttpStatus } from '@nestjs/common';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '../../common/enums/permission.enum';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /** Admin (SUPER_ADMIN) — approve a vendor/business. */
  @Put('vendors/approve')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permission.VENDOR_APPROVE)
  approveVendor() {
    return {
      message: 'Vendor approved successfully',
      data: { approved: true },
    };
  }

  /** Admin (SUPER_ADMIN) — list/manage users. */
  @Get('users')
  @RequirePermissions(Permission.USER_MANAGE)
  listUsers() {
    return {
      message: 'Users retrieved successfully',
      data: [],
    };
  }
}
