import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../decorators';
import { CustomerService } from './customer.service';
import { Pager } from '../../interface';
import { JwtGuard } from '../../guards';
import { getSkip } from '../../utils';
import {
  SearchDto,
  CustomerAllSearchDto,
  CustomerListResult,
  CustomerCreateDto,
  CustomerUpdateDto,
  CustomerDeleteDto,
  CustomerIdResult,
  CustomerDataResult,
} from './customer.dto';
import { CustomerEntity } from './customer.entity';

@ApiBearerAuth()
@ApiTags('用户')
@Controller('customer')
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  /** 用户列表 */
  @UseGuards(JwtGuard)
  @Get('/list')
  @ApiOkResponse({
    type: CustomerListResult,
  })
  async find(@Query() query: SearchDto): Promise<Pager<CustomerEntity>> {
    const { current, pageSize } = query;
    const [list, total] = await this.customerService.find(
      getSkip(current, pageSize),
      pageSize,
      query,
    );
    return {
      list: list,
      total: total,
    };
  }

  /** 全量用户列表 */
  @UseGuards(JwtGuard)
  @Get('/all')
  @ApiOkResponse({
    type: CustomerDataResult,
  })
  async findAll(
    @Query() query: CustomerAllSearchDto,
  ): Promise<CustomerEntity[]> {
    const { customerType } = query;
    const list = await this.customerService.findAll(customerType);
    return list;
  }

  /** 更新 */
  @UseGuards(JwtGuard)
  @Post('/add')
  @ApiOkResponse({
    type: CustomerIdResult,
  })
  async insert(
    @Body() body: CustomerCreateDto,
    @CurrentUser() currentUser,
  ): Promise<number> {
    return this.customerService.insert({
      ...body,
      creatorId: currentUser.id,
    });
  }

  /** 更新 */
  @UseGuards(JwtGuard)
  @Post('/update')
  @ApiOkResponse({
    type: CustomerIdResult,
  })
  async update(@Body() body: CustomerUpdateDto): Promise<number> {
    return this.customerService.update(body.id, body);
  }

  /**
   * 删除
   */
  @UseGuards(JwtGuard)
  @Post('/delete')
  @ApiOkResponse({
    type: CustomerIdResult,
  })
  async delete(@Body() { ids }: CustomerDeleteDto) {
    return this.customerService.delete(ids);
  }
}
