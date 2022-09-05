import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../decorators';
import { ProductService } from './product.service';
import { Pager } from '../../interface';
import { JwtGuard } from '../../guards';
import { getSkip } from '../../utils';
import {
  SearchDto,
  ProductListResult,
  ProductCreateDto,
  ProductUpdateDto,
  ProductDeleteDto,
  ProductIdResult,
  ProductDataResult,
} from './product.dto';
import { ProductEntity } from './product.entity';

@ApiBearerAuth()
@ApiTags('产品')
@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}

  /** 标签列表 */
  @UseGuards(JwtGuard)
  @Get('/list')
  @ApiOkResponse({
    type: ProductListResult,
  })
  async find(
    @Query() query: SearchDto,
    @CurrentUser() currentUser,
  ): Promise<Pager<ProductEntity>> {
    const { current, pageSize } = query;
    const [list, total] = await this.productService.find(
      currentUser.id,
      getSkip(current, pageSize),
      pageSize,
      query,
    );
    return {
      list: list,
      total: total,
    };
  }

  /** 全量客户列表 */
  @UseGuards(JwtGuard)
  @Get('/all')
  @ApiOkResponse({
    type: ProductDataResult,
  })
  async findAll(
    @Query() query: SearchDto,
    @CurrentUser() currentUser,
  ): Promise<ProductEntity[]> {
    const list = await this.productService.findAll(currentUser.id, query);
    return list;
  }

  /** 更新 */
  @UseGuards(JwtGuard)
  @Post('/add')
  @ApiOkResponse({
    type: ProductIdResult,
  })
  async insert(
    @Body() body: ProductCreateDto,
    @CurrentUser() currentUser,
  ): Promise<number> {
    return this.productService.insert({
      ...body,
      creatorId: currentUser.id,
    });
  }

  /** 更新 */
  @UseGuards(JwtGuard)
  @Post('/update')
  @ApiOkResponse({
    type: ProductIdResult,
  })
  async update(@Body() body: ProductUpdateDto): Promise<number> {
    return this.productService.update(body.id, body);
  }

  /**
   * 删除
   */
  @UseGuards(JwtGuard)
  @Post('/delete')
  @ApiOkResponse({
    type: ProductIdResult,
  })
  async delete(@Body() { ids }: ProductDeleteDto) {
    return this.productService.delete(ids);
  }
}
