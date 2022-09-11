import {
  Controller,
  Post,
  Get,
  Res,
  Body,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  FileTypeValidator,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiBearerAuth,
  ApiTags,
  ApiConsumes,
} from '@nestjs/swagger';
import { read } from 'xlsx';
import { FileInterceptor } from '@nestjs/platform-express';
import { CustomResponse, ErrorConstant } from 'src/constant/error';
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
  ProductSaveDto,
  ProductParseDto,
  ProductParseResult,
} from './product.dto';
import { ProductEntity } from './product.entity';
import { mimeType, productSheetName } from '../../constant/file';

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

  /** 解析文件 */
  @UseGuards(JwtGuard)
  @Post('/parseFile')
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({
    type: ProductParseResult,
  })
  @UseInterceptors(FileInterceptor('file'))
  async parseFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: mimeType.xlsx,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() body: ProductParseDto,
    @CurrentUser() currentUser,
  ) {
    const workbook = read(file.buffer, {
      type: 'buffer',
      cellDates: true,
      cellText: false,
    });
    const { SheetNames: sheetNames, Sheets: sheets } = workbook;
    const fileName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    let flag = 0;

    for (let i = 0; i < sheetNames.length; i++) {
      const sheetName = sheetNames[i];
      const sheet = sheets[sheetName];
      if (sheetName === productSheetName) {
        flag = 1;
        const res = await this.productService.parseSheet(
          workbook,
          sheet,
          fileName,
          currentUser.id,
        );
        return res;
      }
    }

    if (!flag) {
      throw new CustomResponse('sheet页名称不正确');
    }
    return true;
  }

  /**
   * 保存数据
   */
  @UseGuards(JwtGuard)
  @Post('/save')
  @ApiOkResponse({
    type: Number,
  })
  async save(@Body() body: ProductSaveDto) {
    return this.productService.save(body);
  }

  /** 导出数据 */
  @UseGuards(JwtGuard)
  @Get('/export')
  async export(
    @Res({ passthrough: true }) res,
    @CurrentUser() currentUser,
  ): Promise<StreamableFile> {
    const buf = await this.productService.export(currentUser.id);
    const fileName = 'download_product';
    res.set({
      'Content-Type': mimeType.xlsx,
      'Content-Disposition': `attachment; filename=${fileName}`,
    });
    return new StreamableFile(buf);
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
